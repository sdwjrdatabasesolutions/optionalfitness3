// payment.js
import { CONFIG } from './config.js';

// Function to dynamically load PayPal SDK if not already loaded
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        if (window.paypal) return resolve(window.paypal); // Already loaded

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${CONFIG.PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;
        script.onload = () => resolve(window.paypal);
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
    });
}

// Render PayPal Button
export async function renderPayPalButton(onSuccess) {
    try {
        const paypal = await loadPayPalSDK();

        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{ amount: { value: '10.00' } }]
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then(details => {
                    console.log('Payment successful:', details);
                    if (onSuccess) onSuccess();
                });
            },
            onError: (err) => {
                console.error('PayPal error:', err);
                alert('An error occurred with the payment system. Please try again later.');
            }
        }).render('#paypal-button-container');

    } catch (error) {
        console.error('Failed to load PayPal SDK:', error);
        alert('Could not load PayPal payment system. Please try again later.');
    }
}
