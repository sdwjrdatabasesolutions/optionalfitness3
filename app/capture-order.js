// capture-order.js (Firebase Cloud Function or Next.js API route)
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import paypal from '@paypal/checkout-server-sdk';

// Initialize PayPal client
function getPayPalClient() {
    const environment = new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    );
    
    // Use LiveEnvironment for production
    // const environment = new paypal.core.LiveEnvironment(
    //     process.env.PAYPAL_CLIENT_ID,
    //     process.env.PAYPAL_CLIENT_SECRET
    // );
    
    return new paypal.core.PayPalHttpClient(environment);
}

// Initialize Firebase Admin SDK (server-side)
if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    console.error('Missing Firebase Admin credentials');
}

// Check if app is already initialized to avoid duplicate initialization
let adminApp;
try {
    adminApp = initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
} catch (error) {
    // App might already be initialized
    if (!error.message?.includes('already exists')) {
        console.error('Firebase Admin initialization error:', error);
        throw error;
    }
}

const db = getFirestore();

export default async function handler(req, res) {
    // Enable CORS if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { orderID, userID } = req.body;
    
    if (!orderID || !userID) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['orderID', 'userID'],
            received: { orderID: !!orderID, userID: !!userID }
        });
    }

    // Validate userID format (Firestore document ID should be string)
    if (typeof userID !== 'string' || userID.trim() === '') {
        return res.status(400).json({ error: 'Invalid userID format' });
    }

    try {
        // First, verify user exists in Firestore
        const userRef = db.collection('users').doc(userID);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ 
                error: 'User not found',
                message: 'Please ensure user is registered before payment'
            });
        }

        // Capture the PayPal order
        const client = getPayPalClient();
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});
        
        const capture = await client.execute(request);
        
        if (!capture.result || capture.result.status !== 'COMPLETED') {
            console.error('PayPal capture failed:', capture.result);
            return res.status(400).json({ 
                error: 'Payment capture failed',
                details: capture.result
            });
        }

        console.log('Payment captured successfully:', {
            orderID,
            userID,
            captureId: capture.result.id,
            amount: capture.result.purchase_units[0]?.payments?.captures[0]?.amount
        });

        // Update Firestore user to mark as paid
        const updateData = {
            is_paid: true,
            paid_at: new Date().toISOString(),
            paypal_order_id: orderID,
            paypal_capture_id: capture.result.id,
            payment_status: 'completed',
            last_payment_update: new Date().toISOString()
        };
        
        await userRef.update(updateData);
        
        // Also update the user's payment history if you have a subcollection
        const paymentRef = userRef.collection('payments').doc(orderID);
        await paymentRef.set({
            order_id: orderID,
            capture_id: capture.result.id,
            amount: capture.result.purchase_units[0]?.payments?.captures[0]?.amount,
            status: 'completed',
            created_at: new Date().toISOString(),
            timestamp: new Date()
        });

        res.status(200).json({ 
            status: "captured",
            message: "Payment successful and user unlocked",
            data: {
                order_id: orderID,
                capture_id: capture.result.id,
                user_id: userID,
                is_paid: true
            }
        });
        
    } catch (error) {
        console.error('Capture order error:', {
            error: error.message,
            stack: error.stack,
            orderID,
            userID
        });
        
        // Handle specific PayPal errors
        if (error.statusCode === 404) {
            return res.status(404).json({ error: 'PayPal order not found' });
        }
        
        if (error.statusCode === 422) {
            return res.status(422).json({ error: 'Order already captured or invalid' });
        }
        
        res.status(500).json({ 
            error: 'Failed to capture payment',
            message: error.message,
            order_id: orderID
        });
    }
}

// For local development, export handler for serverless function
export const config = {
    api: {
        bodyParser: true,
    },
};
