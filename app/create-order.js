// create-order.js
import { paypalClient } from './paypalClient.js'; // Your PayPal SDK client

export async function createOrder(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount = '10.00', userID } = req.body;
    if (!userID) return res.status(400).json({ error: 'userID is required' });

    try {
        // Create a real PayPal order
        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: { currency_code: 'USD', value: amount }
                }
            ]
        });

        const order = await paypalClient.execute(request);

        console.log(`Created PayPal order ${order.result.id} for user ${userID}`);

        res.status(200).json({ id: order.result.id });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
}
