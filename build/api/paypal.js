import { Router } from 'express';
import { prisma } from '../core/prisma.js';
const router = Router();
// Use sandbox API for development, production API for live
const PAYPAL_API = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
// Get PayPal access token
async function getAccessToken() {
    const clientId = process.env.PAYPAL_API_KEY;
    const clientSecret = process.env.PAYPAL_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not configured');
    }
    const credentials = clientId + ':' + clientSecret;
    const auth = Buffer.from(credentials).toString('base64');
    const response = await fetch(PAYPAL_API + '/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error('Failed to get PayPal access token: ' + error);
    }
    const data = await response.json();
    return data.access_token;
}
// Health check endpoint
router.get('/health', async (req, res) => {
    const hasCredentials = !!(process.env.PAYPAL_API_KEY && process.env.PAYPAL_SECRET);
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
    if (!hasCredentials) {
        return res.json({
            status: 'error',
            hasCredentials: false,
            environment,
            error: 'PayPal credentials not configured'
        });
    }
    try {
        // Test that we can get an access token
        const token = await getAccessToken();
        res.json({
            status: 'ok',
            hasCredentials: true,
            environment,
            tokenObtained: !!token
        });
    }
    catch (error) {
        res.json({
            status: 'error',
            hasCredentials: true,
            environment,
            error: error.message
        });
    }
});
// Create order with fixed quantity of 1
router.post('/create-order', async (req, res) => {
    const petId = req.body.petId || 'unknown';
    const listingFee = process.env.PAYPAL_LISTING_FEE || '5.00';
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(PAYPAL_API + '/v2/checkout/orders', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                        reference_id: petId,
                        description: 'Pet Listing Fee',
                        amount: {
                            currency_code: 'USD',
                            value: listingFee,
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: listingFee
                                }
                            }
                        },
                        items: [{
                                name: 'Pet Listing Fee',
                                quantity: '1', // FIXED quantity - buyer cannot change
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: listingFee
                                }
                            }]
                    }]
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            return res.status(response.status).json({
                success: false,
                error: 'Failed to create order: ' + error
            });
        }
        const order = await response.json();
        res.json({
            orderId: order.id,
            status: order.status
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Capture order and record receipt
router.post('/capture-order', async (req, res) => {
    const orderId = req.body.orderId;
    const petIds = req.body.petIds; // Array of pet IDs
    const packId = req.body.packId;
    const user = req.user;
    const userId = user?.id;
    if (!orderId) {
        return res.status(400).json({ success: false, error: 'Order ID required' });
    }
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(PAYPAL_API + '/v2/checkout/orders/' + orderId + '/capture', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const error = await response.text();
            return res.status(response.status).json({
                success: false,
                error: 'Failed to capture order: ' + error
            });
        }
        const capture = await response.json();
        if (capture.status === 'COMPLETED') {
            const payment = capture.purchase_units[0].payments.captures[0];
            // Record receipt in database (only if user is authenticated)
            if (userId) {
                const receipt = await prisma.receipt.create({
                    data: {
                        user_id: userId,
                        paypal_order_id: orderId,
                        amount: parseFloat(payment.amount.value),
                        currency: payment.amount.currency_code,
                        status: 'completed',
                        paid_at: new Date(),
                    }
                });
                // Link receipt to all pets if petIds provided
                if (petIds && Array.isArray(petIds) && petIds.length > 0) {
                    await prisma.pets.updateMany({
                        where: { id: { in: petIds } },
                        data: { Receipt_id: receipt.id }
                    });
                }
                return res.json({
                    success: true,
                    receiptId: receipt.id,
                    paypalOrderId: orderId,
                    amount: payment.amount.value,
                    currency: payment.amount.currency_code,
                    petsUpdated: petIds?.length || 0
                });
            }
            // Payment successful but user not authenticated - still return success
            return res.json({
                success: true,
                paypalOrderId: orderId,
                amount: payment.amount.value,
                currency: payment.amount.currency_code,
                warning: 'Receipt not recorded - user not authenticated'
            });
        }
        else {
            res.json({
                success: false,
                error: 'Payment not completed',
                status: capture.status
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
export default router;
