import { CONFIG } from './config.js';

export function renderPayPalButton() {
    paypal.Buttons({
        createOrder: async () => {
            const res = await fetch(CONFIG.API_URL + '/api/create-order', {
                method: 'POST'
            });
            const data = await res.json();
            return data.id;
        },
        onApprove: async (data) => {
            await fetch(CONFIG.API_URL + '/api/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID })
            });

            let user = JSON.parse(localStorage.getItem("user")) || {};
            user.is_paid = true;
            localStorage.setItem("user", JSON.stringify(user));

            alert("✅ Payment successful!");
            location.reload();
        }
    }).render('#paypal-button-container');
}