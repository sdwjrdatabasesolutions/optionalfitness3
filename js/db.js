import { CONFIG } from './config.js';

export async function runQuery(query) {
    const res = await fetch(CONFIG.API_URL + '/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    return await res.json();
}