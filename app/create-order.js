export default async function handler(req, res) {
    // For simplicity, return mock order ID (replace with real PayPal API)
    res.json({ id: "ORDER12345" });
}