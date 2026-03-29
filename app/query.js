import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req, res) {
    const { DATABASE_URL } = process.env;
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    const { query } = req.body;
    try {
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await client.end();
    }
}