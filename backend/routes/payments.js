const express = require('express');
const router = express.Router();

// Lazy-init Stripe to avoid crash if key missing during build
let stripe = null;
function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY not set');
    }
    // eslint-disable-next-line global-require
    stripe = require('stripe')(key);
  }
  return stripe;
}

// Create a Stripe Checkout Session
// POST /api/payments/create-session
router.post('/create-session', async (req, res, next) => {
  try {
    const { lineItems, customerEmail, mode = 'payment', metadata = {} } = req.body || {};

    // Fallback demo item if none provided
    const items = Array.isArray(lineItems) && lineItems.length > 0
      ? lineItems
      : [
          {
            price_data: {
              currency: 'inr',
              product_data: { name: 'Todo Pro - One-time' },
              unit_amount: 29900, // INR 299.00
            },
            quantity: 1,
          },
        ];

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: items,
      success_url: `${clientUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payments/cancel`,
      customer_email: customerEmail,
      metadata,
    });

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
