// query.js (Serverless function - Vercel/Netlify/Firebase Function)
import pkg from 'pg';
import admin from 'firebase-admin';

const { Pool } = pkg;

// Initialize Firebase Admin with proper credentials
if (!admin.apps.length) {
    try {
        // For production, use service account JSON
        if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            // For development with emulators or default credentials
            admin.initializeApp();
        }
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error);
    }
}

// Create connection pool for better performance
let pool;
try {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    console.log('✅ PostgreSQL connection pool created');
} catch (error) {
    console.error('❌ PostgreSQL pool creation error:', error);
}

// Define safe queries with better structure
const SAFE_QUERIES = {
    getLessons: {
        text: 'SELECT id, title, locked, price, content_preview FROM lessons ORDER BY id',
        requiresAuth: false
    },
    getUserProgress: {
        text: 'SELECT user_id, completed_modules, is_paid, last_accessed FROM user_progress WHERE user_id = $1',
        requiresAuth: true
    },
    updateProgress: {
        text: `
            INSERT INTO user_progress (user_id, completed_modules, is_paid, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                completed_modules = EXCLUDED.completed_modules,
                is_paid = EXCLUDED.is_paid,
                updated_at = NOW()
            RETURNING *
        `,
        requiresAuth: true
    },
    getUserById: {
        text: 'SELECT user_id, email, is_paid, completed_modules FROM user_progress WHERE user_id = $1',
        requiresAuth: true
    }
};

// Verify Firebase ID token with caching (optional)
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    
    // Check cache
    if (tokenCache.has(token)) {
        const cached = tokenCache.get(token);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.uid;
        }
        tokenCache.delete(token);
    }
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;
        
        // Cache the valid token
        tokenCache.set(token, { uid, timestamp: Date.now() });
        
        return uid;
    } catch (err) {
        console.error('Firebase token verification failed:', {
            error: err.message,
            code: err.code
        });
        return null;
    }
}

// Validate input data
function validateInput(queryType, completedModules, isPaid) {
    if (queryType === 'updateProgress') {
        if (!Array.isArray(completedModules)) {
            return { valid: false, error: 'completedModules must be an array' };
        }
        
        // Validate each module ID is a number
        for (const moduleId of completedModules) {
            if (typeof moduleId !== 'number' || moduleId < 1) {
                return { valid: false, error: 'Invalid module ID in completedModules' };
            }
        }
        
        if (typeof isPaid !== 'boolean') {
            return { valid: false, error: 'isPaid must be a boolean' };
        }
    }
    
    return { valid: true };
}

// Main handler
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowed_methods: ['POST']
        });
    }

    // Verify authentication
    const userID = await verifyToken(req.headers.authorization);
    
    const { queryType, completedModules = [], isPaid = false } = req.body;
    
    // Validate query type
    if (!queryType || !SAFE_QUERIES[queryType]) {
        return res.status(400).json({ 
            error: 'Invalid query type',
            available_queries: Object.keys(SAFE_QUERIES)
        });
    }
    
    const query = SAFE_QUERIES[queryType];
    
    // Check authentication requirement
    if (query.requiresAuth && !userID) {
        return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Valid authentication token required'
        });
    }
    
    // Validate input data
    const validation = validateInput(queryType, completedModules, isPaid);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }
    
    // Check database connection
    if (!pool) {
        return res.status(503).json({ 
            error: 'Database connection unavailable',
            message: 'Please try again later'
        });
    }
    
    let client;
    try {
        client = await pool.connect();
        
        let result;
        
        switch (queryType) {
            case 'getLessons':
                result = await client.query(query.text);
                res.status(200).json({
                    success: true,
                    data: result.rows,
                    count: result.rowCount
                });
                break;
                
            case 'getUserProgress':
                result = await client.query(query.text, [userID]);
                const userData = result.rows[0] || {
                    user_id: userID,
                    completed_modules: [],
                    is_paid: false,
                    last_accessed: null
                };
                
                // Parse JSON if stored as string
                if (typeof userData.completed_modules === 'string') {
                    userData.completed_modules = JSON.parse(userData.completed_modules);
                }
                
                res.status(200).json({
                    success: true,
                    data: userData
                });
                break;
                
            case 'updateProgress':
                // Store as JSON string for PostgreSQL
                const completedModulesJson = JSON.stringify(completedModules);
                
                result = await client.query(query.text, [userID, completedModulesJson, isPaid]);
                
                res.status(200).json({
                    success: true,
                    message: 'Progress updated successfully',
                    data: result.rows[0]
                });
                break;
                
            case 'getUserById':
                result = await client.query(query.text, [userID]);
                res.status(200).json({
                    success: true,
                    data: result.rows[0] || null
                });
                break;
                
            default:
                res.status(400).json({ error: 'Unsupported query type' });
        }
        
    } catch (err) {
        console.error('Database error:', {
            error: err.message,
            queryType,
            userID,
            stack: err.stack
        });
        
        // Handle specific database errors
        if (err.code === '23505') {
            res.status(409).json({ error: 'Duplicate entry', message: err.message });
        } else if (err.code === '42P01') {
            res.status(500).json({ error: 'Table does not exist', message: 'Database schema issue' });
        } else {
            res.status(500).json({ 
                error: 'Database operation failed',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
            });
        }
    } finally {
        if (client) client.release();
    }
}

// Cleanup pool on function shutdown (for serverless environments)
export const cleanup = async () => {
    if (pool) {
        await pool.end();
        console.log('✅ PostgreSQL connection pool closed');
    }
};

// For local development
export const config = {
    api: {
        bodyParser: true,
    },
};
