import { CONFIG } from './config.js';
import { updatePaymentStatus } from './auth.js';

export async function renderPayPalButton() {
    // Check if PayPal SDK is loaded
    if (typeof paypal === 'undefined') {
        console.error('PayPal SDK not loaded');
        document.getElementById('paypal-button-container').innerHTML = 
            '<p style="color: red;">Payment system unavailable. Please try again later.</p>';
        return;
    }
    
    paypal.Buttons({
        createOrder: async () => {
            try {
                const response = await fetch(`${CONFIG.API_URL}/api/create-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ amount: '10.00' })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to create order');
                }
                
                const data = await response.json();
                return data.id;
            } catch (error) {
                console.error('Create order error:', error);
                alert('Unable to process payment. Please try again.');
                throw error;
            }
        },
        
        onApprove: async (data) => {
            try {
                const response = await fetch(`${CONFIG.API_URL}/api/capture-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderID: data.orderID })
                });
                
                if (!response.ok) {
                    throw new Error('Payment capture failed');
                }
                
                const result = await response.json();
                
                if (result.status === 'captured') {
                    updatePaymentStatus(true);
                    alert("✅ Payment successful! You now have access to all lessons.");
                    location.reload();
                } else {
                    throw new Error('Payment not captured');
                }
            } catch (error) {
                console.error('Capture error:', error);
                alert('Payment was approved but failed to complete. Please contact support.');
            }
        },
        
        onError: (error) => {
            console.error('PayPal error:', error);
            alert('An error occurred with the payment system. Please try again later.');
        }
        
    }).render('#paypal-button-container');
}