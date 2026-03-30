export const CONFIG = {
    // Use environment variable for API URL
    API_URL: process.env.NODE_ENV === 'production' 
        ? 'https://your-app.vercel.app' 
        : 'http://localhost:3000',
    
    // This should be an environment variable, not hardcoded
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID',
    
    // Add other configuration
    APP_NAME: 'SQL Learning Platform',
    VERSION: '1.0.0'
};