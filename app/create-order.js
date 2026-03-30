export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get amount from request body
        const { amount = '10.00' } = req.body;
        
        // Here you would integrate with PayPal SDK
        // For now, using mock response
        const mockOrderId = 'ORDER_' + Date.now();
        
        // In production with real PayPal:
        // const request = new paypal.orders.OrdersCreateRequest();
        // request.requestBody({
        //     intent: 'CAPTURE',
        //     purchase_units: [{
        //         amount: {
        //             currency_code: 'USD',
        //             value: amount
        //         }
        //     }]
        // });
        // const order = await paypalClient.execute(request);
        
        console.log("Created order:", mockOrderId);
        res.status(200).json({ id: mockOrderId });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
}