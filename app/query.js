import pkg from 'pg';
const { Client } = pkg;

// Only allow specific safe queries
const SAFE_QUERIES = {
    getLessons: 'SELECT id, title, locked, price FROM lessons ORDER BY id',
    getUserProgress: 'SELECT user_id, completed_modules, is_paid FROM user_progress WHERE user_id = $1',
    updateProgress: 'UPDATE user_progress SET completed_modules = $1 WHERE user_id = $2'
};

// Authentication check (you should implement proper auth)
function isAuthenticated(req) {
    const token = req.headers.authorization;
    // Verify token logic here
    return token === 'your-secure-token'; // Replace with real auth
}

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check authentication
    if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { queryType, userId, completedModules } = req.body;
    
    // Validate query type
    if (!SAFE_QUERIES[queryType]) {
        return res.status(400).json({ error: 'Invalid query type' });
    }

    const client = new Client({ 
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        
        let result;
        switch(queryType) {
            case 'getLessons':
                result = await client.query(SAFE_QUERIES.getLessons);
                break;
            case 'getUserProgress':
                if (!userId) throw new Error('User ID required');
                result = await client.query(SAFE_QUERIES.getUserProgress, [userId]);
                break;
            case 'updateProgress':
                if (!userId || !completedModules) throw new Error('Missing data');
                result = await client.query(SAFE_QUERIES.updateProgress, [completedModules, userId]);
                break;
            default:
                throw new Error('Unsupported query');
        }
        
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        await client.end();
    }
}