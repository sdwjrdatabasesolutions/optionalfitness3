// capture-order.js
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (server-side)
if (!initializeApp.apps?.length) {
    initializeApp({
        credential: process.env.FIREBASE_ADMIN_CREDENTIAL // Your service account JSON
    });
}

const db = getFirestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { orderID, userID } = req.body;
    
    if (!orderID || !userID) {
        return res.status(400).json({ error: 'Order ID and userID are required' });
    }

    try {
        // Here you would capture with PayPal SDK
        // const request = new paypal.orders.OrdersCaptureRequest(orderID);
        // const capture = await paypalClient.execute(request);
        console.log("Captured order:", orderID);

        // Update Firestore user to mark as paid
        const userRef = db.collection('users').doc(userID);
        await userRef.set({ is_paid: true }, { merge: true });

        res.status(200).json({ 
            status: "captured",
            message: "Payment successful and user unlocked"
        });
    } catch (error) {
        console.error('Capture order error:', error);
        res.status(500).json({ error: 'Failed to capture payment' });
    }
}
