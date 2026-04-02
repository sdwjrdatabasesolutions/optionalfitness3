// query.js
import pkg from 'pg';
import admin from 'firebase-admin';
const { Client } = pkg;

// Initialize Firebase Admin
if (!admin.apps.length) admin.initializeApp();

// Define safe queries
const SAFE_QUERIES = {
    getLessons: 'SELECT id, title, locked, price FROM lessons ORDER BY id',
    getUserProgress: 'SELECT user_id, completed_modules, is_paid FROM user_progress WHERE user_id = $1',
    updateProgress: 'UPDATE user_progress SET completed_modules = $1, is_paid = $2 WHERE user_id = $3'
};

// Verify Firebase ID token
async function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken.uid; // Return Firebase UID
    } catch (err) {
        console.error('Firebase token verification failed:', err);
        return null;
    }
}

// Main handler
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const userID = await verifyToken(req);
    if (!userID) return res.status(401).json({ error: 'Unauthorized' });

    const { queryType, completedModules = [], isPaid = false } = req.body;

    if (!SAFE_QUERIES[queryType]) return res.status(400).json({ error: 'Invalid query type' });

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        let result;

        switch (queryType) {
            case 'getLessons':
                result = await client.query(SAFE_QUERIES.getLessons);
                res.status(200).json(result.rows);
                break;

            case 'getUserProgress':
                result = await client.query(SAFE_QUERIES.getUserProgress, [userID]);
                res.status(200).json(result.rows[0] || { completed_modules: [], is_paid: false });
                break;

            case 'updateProgress':
                // Ensure completedModules is an array
                if (!Array.isArray(completedModules)) {
                    return res.status(400).json({ error: 'completedModules must be an array' });
                }

                await client.query(SAFE_QUERIES.updateProgress, [
                    JSON.stringify(completedModules), // Store as JSON
                    isPaid,
                    userID
                ]);
                res.status(200).json({ success: true });
                break;

            default:
                res.status(400).json({ error: 'Unsupported query type' });
        }

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        await client.end();
    }
}
