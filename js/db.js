import { CONFIG } from './config.js';

// Instead of executing raw SQL, use specific actions
export async function getLessons() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/query`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ queryType: 'getLessons' })
        });
        
        if (!res.ok) throw new Error('Failed to fetch lessons');
        return await res.json();
    } catch (error) {
        console.error('Get lessons error:', error);
        return [];
    }
}

export async function getUserProgress(userId) {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/query`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ 
                queryType: 'getUserProgress',
                userId: userId 
            })
        });
        
        if (!res.ok) throw new Error('Failed to fetch progress');
        return await res.json();
    } catch (error) {
        console.error('Get progress error:', error);
        return null;
    }
}

export async function updateProgress(userId, completedModules) {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/query`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ 
                queryType: 'updateProgress',
                userId: userId,
                completedModules: completedModules
            })
        });
        
        if (!res.ok) throw new Error('Failed to update progress');
        return await res.json();
    } catch (error) {
        console.error('Update progress error:', error);
        return null;
    }
}