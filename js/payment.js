export function renderPayPalButton(onSuccess) {
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
        onError: err => console.error('PayPal error:', err)
    }).render('#paypal-button-container');
}
        
        onError: (error) => {
            console.error('PayPal error:', error);
            alert('An error occurred with the payment system. Please try again later.');
        }
        
    }).render('#paypal-button-container');
}
