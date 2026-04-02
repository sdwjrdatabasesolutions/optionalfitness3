// create-order.js (Firebase Cloud Function or Next.js API route)
import { paypalClient } from './paypalClient.js'; // Your PayPal SDK client
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
let db;
try {
    if (!initializeApp.apps?.length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    db = getFirestore();
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Valid amount options (prevent arbitrary amounts)
const VALID_AMOUNTS = {
    '10.00': 'Basic Course Access',
    '19.99': 'Premium Course Access',
    '29.99': 'Full Course + Certificate'
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowed_methods: ['POST']
        });
    }

    const { amount = '10.00', userID, currency = 'USD' } = req.body;
    
    // Validate required fields
    if (!userID) {
        return res.status(400).json({ 
            error: 'userID is required',
            message: 'Please provide a valid user ID'
        });
    }
    
    // Validate amount
    const amountStr = parseFloat(amount).toFixed(2);
    if (!VALID_AMOUNTS[amountStr]) {
        return res.status(400).json({ 
            error: 'Invalid amount',
            message: `Amount must be one of: ${Object.keys(VALID_AMOUNTS).join(', ')}`,
            provided: amount
        });
    }
    
    // Validate currency
    if (currency !== 'USD') {
        return res.status(400).json({ 
            error: 'Invalid currency',
            message: 'Only USD is supported at this time',
            provided: currency
        });
    }
    
    // Validate userID format
    if (typeof userID !== 'string' || userID.trim() === '') {
        return res.status(400).json({ error: 'Invalid userID format' });
    }

    try {
        // Check if user already has paid access
        if (db) {
            const userRef = db.collection('users').doc(userID);
            const userDoc = await userRef.get();
            
            if (userDoc.exists && userDoc.data().is_paid === true) {
                return res.status(400).json({ 
                    error: 'User already has paid access',
                    message: 'This user already unlocked premium content',
                    is_paid: true
                });
            }
        }
        
        // Create a real PayPal order
        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: { 
                        currency_code: currency, 
                        value: amountStr 
                    },
                    description: VALID_AMOUNTS[amountStr],
                    custom_id: userID, // Store userID in PayPal for reference
                    invoice_id: `INV-${Date.now()}-${userID.slice(-6)}` // Unique invoice ID
                }
            ],
            application_context: {
                brand_name: 'SQL Learning Platform',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-cancel`
            }
        });

        const order = await paypalClient.execute(request);
        
        if (!order || !order.result || !order.result.id) {
            throw new Error('Failed to create PayPal order - no order ID returned');
        }

        console.log(`✅ Created PayPal order ${order.result.id} for user ${userID}`, {
            amount: amountStr,
            currency,
            product: VALID_AMOUNTS[amountStr],
            timestamp: new Date().toISOString()
        });
        
        // Store order in Firestore for tracking
        if (db) {
            const orderRef = db.collection('pending_orders').doc(order.result.id);
            await orderRef.set({
                order_id: order.result.id,
                user_id: userID,
                amount: amountStr,
                currency: currency,
                status: 'created',
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
                product: VALID_AMOUNTS[amountStr]
            });
        }

        res.status(200).json({ 
            id: order.result.id,
            status: 'created',
            amount: amountStr,
            currency: currency,
            links: order.result.links
        });
        
    } catch (error) {
        console.error('❌ Create order error:', {
            error: error.message,
            stack: error.stack,
            userID,
            amount
        });
        
        // Handle specific PayPal errors
        if (error.statusCode === 400) {
            return res.status(400).json({ 
                error: 'Invalid request to PayPal',
                message: error.message
            });
        }
        
        if (error.statusCode === 401) {
            return res.status(401).json({ 
                error: 'PayPal authentication failed',
                message: 'Payment service configuration error'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to create order',
            message: error.message,
            order_id: null
        });
    }
}

// For local development
export const config = {
    api: {
        bodyParser: true,
    },
};
