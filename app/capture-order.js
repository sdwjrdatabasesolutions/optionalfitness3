export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { orderID } = req.body;
    
    if (!orderID) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        // Here you would capture with PayPal SDK
        // const request = new paypal.orders.OrdersCaptureRequest(orderID);
        // request.requestBody({});
        // const capture = await paypalClient.execute(request);
        
        console.log("Captured order:", orderID);
        
        // Update database to mark user as paid
        // await updateUserPaymentStatus(userId, true);
        
        res.status(200).json({ 
            status: "captured",
            message: "Payment successful"
        });
    } catch (error) {
        console.error('Capture order error:', error);
        res.status(500).json({ error: 'Failed to capture payment' });
    }
}