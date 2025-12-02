---
title: PayPal Standard Checkout
description: PayPal Standard Checkout integration for pet listing fees with receipt recording.
---

## Overview

This integration uses PayPal Standard Checkout with the Orders API to:
- Accept payments with a fixed quantity (buyer cannot change)
- Record receipts in the database via the onApprove callback
- Link receipts to pets

**Documentation:** https://developer.paypal.com/docs/checkout/standard/integrate/

---

## Environment Variables

Your current env vars are correctly named. Here is what each one does:

| Variable | Description | Example |
|----------|-------------|---------|
| PAYPAL_API_KEY | Your PayPal Client ID (public) | AU3UdGku2m7... |
| PAYPAL_SECRET | Your PayPal Client Secret (private) | EJ4YJ72uK-eB... |
| PAYPAL_LISTING_FEE | Amount to charge for pet listing | 5.00 |

Note: PAYPAL_USERNAME and PAYPAL_PASSWORD are sandbox login credentials for testing in the PayPal UI. They are not needed for API calls.

Add to your .env:

```dotenv
PAYPAL_API_KEY=your_client_id_here
PAYPAL_SECRET=your_client_secret_here
PAYPAL_LISTING_FEE=5.00
```

---

## API Endpoints

The integration creates two endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/paypal/create-order | POST | Creates a PayPal order with fixed quantity |
| /api/paypal/capture-order | POST | Captures payment and records receipt in DB |

---

## Frontend Implementation

### 1. Add PayPal SDK to your EJS layout

Add this script tag to your layout head. The client ID is loaded from environment.

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD&intent=capture&enable-funding=venmo"></script>
```

### 2. Render the PayPal Button

```html
<div id="paypal-button-container"></div>

<script>
  var petId = 'PET_ID_FROM_SERVER';
  
  paypal.Buttons({
    createOrder: function() {
      return fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: petId })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) { return data.orderId; });
    },
    
    onApprove: function(data) {
      return fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID, petId: petId })
      })
      .then(function(res) { return res.json(); })
      .then(function(result) {
        if (result.success) {
          window.location.href = '/payment-success?receipt=' + result.receiptId;
        } else {
          alert('Payment failed: ' + result.error);
        }
      });
    },
    
    onError: function(err) {
      console.error('PayPal error:', err);
      alert('Payment error. Please try again.');
    }
  }).render('#paypal-button-container');
</script>
```

---

## Testing Procedures

### Test 1: Verify API Credentials

Run this command to test that your credentials can obtain an access token:

```bash
curl -X POST https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

Expected response contains access_token:
```json
{
  "access_token": "A21AAK...",
  "token_type": "Bearer",
  "expires_in": 32400
}
```

### Test 2: API Health Check

After implementing the API, test the health endpoint:

```
GET http://localhost:3001/paypal/health
```

Expected response:
```json
{
  "status": "ok",
  "hasCredentials": true,
  "environment": "sandbox"
}
```

### Test 3: Create Order (without payment)

```
POST http://localhost:3001/paypal/create-order
Content-Type: application/json

{
  "petId": "test-pet-123"
}
```

Expected response:
```json
{
  "orderId": "5O190127TN364715T",
  "status": "CREATED"
}
```

### Test 4: Full Payment Flow (Sandbox)

1. Start the web server: npm run dev:web
2. Navigate to a page with the PayPal button
3. Click the PayPal button
4. Log in with sandbox credentials:
   - Email: PAYPAL_USERNAME from .env
   - Password: PAYPAL_PASSWORD from .env
5. Complete the payment
6. Verify receipt was created in database via Prisma Studio

### Test 5: Verify Receipt in Database

After a successful payment, check Prisma Studio:

```bash
npm run prisma:studio
```

Look for:
- New Receipt record with paypal_order_id matching the order
- Pet record updated with Receipt_id linking to the receipt

---

## Troubleshooting

### Error: INVALID_CLIENT

Your PAYPAL_API_KEY or PAYPAL_SECRET is incorrect. Verify in PayPal Developer Dashboard.

### Error: INSTRUMENT_DECLINED

The sandbox account has insufficient funds or card was declined. Use a different sandbox account.

### Error: 401 Unauthorized on capture

User session expired or not authenticated. Ensure user is logged in before payment.

---

## Production Checklist

Before going live:

1. Replace sandbox credentials with live credentials from PayPal Dashboard
2. Change API URL from api-m.sandbox.paypal.com to api-m.paypal.com
3. Update PAYPAL_API_KEY and PAYPAL_SECRET in production .env
4. Test with a real PayPal account (small amount like 0.01 USD)
5. Verify receipts are being recorded correctly
