export default async function handler(req, res) {
    const { orderID } = req.body;
    // Capture logic with PayPal API
    console.log("Captured order:", orderID);
    res.json({ status: "captured" });
}