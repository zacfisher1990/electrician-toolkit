/**
 * Cloud Function: createDepositCheckout
 * HTTP GET handler — creates a Stripe Checkout session for the estimate deposit,
 * then redirects the client to the Stripe-hosted payment page.
 * Called from the deposit page shown after client clicks "Pay Deposit Now".
 */

const { onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');
const Stripe = require('stripe');

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const functionsBaseUrl = defineString('FUNCTIONS_BASE_URL');

const createDepositCheckout = onRequest(
  { cors: false },
  async (req, res) => {
    const { estimateId, token, userId } = req.query;

    if (!estimateId || !token || !userId) {
      res.status(400).send('Missing required parameters.');
      return;
    }

    const db = getFirestore();

    try {
      // --- Load estimate ---
      const estimateSnap = await db.collection('estimates').doc(estimateId).get();
      if (!estimateSnap.exists) {
        res.status(404).send('Estimate not found.');
        return;
      }

      const estimate = { id: estimateId, ...estimateSnap.data() };

      // --- Verify token is still valid ---
      if (!estimate.responseToken || estimate.responseToken !== token) {
        res.status(403).send('This link has already been used or has expired.');
        return;
      }

      // --- Load contractor's Stripe account ID ---
      const userSnap = await db.collection('users').doc(userId).get();
      const userData = userSnap.exists ? userSnap.data() : {};
      const stripeAccountId = userData.stripeAccountId;

      if (!stripeAccountId) {
        // Contractor hasn't connected Stripe — fall back to "pay later"
        const skipUrl = `${functionsBaseUrl.value()}/handleEstimateResponse?estimateId=${estimateId}&action=acceptNoDeposit&token=${token}&userId=${userId}`;
        res.redirect(302, skipUrl);
        return;
      }

      const stripe = Stripe(stripeSecretKey.value());

      const depositAmount = estimate.depositAmount || 0;
      if (depositAmount <= 0) {
        res.status(400).send('Invalid deposit amount.');
        return;
      }

      const estimateName = estimate.name || 'Project Estimate';
      const clientName = estimate.clientName || 'Client';
      const depositLabel = estimate.depositType === 'percent'
        ? `${estimate.depositValue}% deposit`
        : 'Deposit';

      // --- Success and cancel URLs ---
      const successUrl = `${functionsBaseUrl.value()}/handleDepositSuccess?estimateId=${estimateId}&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${functionsBaseUrl.value()}/handleEstimateResponse?estimateId=${estimateId}&action=accept&token=${token}&userId=${userId}`;

      // --- Create Stripe Checkout session on the contractor's connected account ---
      const session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                unit_amount: Math.round(depositAmount * 100), // cents
                product_data: {
                  name: `${depositLabel} — ${estimateName}`,
                  description: `Deposit for work to be performed by ${userData.businessName || userData.displayName || 'your contractor'}`,
                },
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          // Pre-fill client email if available
          ...(estimate.clientEmail ? { customer_email: estimate.clientEmail } : {}),
          // Store metadata for the webhook
          metadata: {
            estimateId,
            userId,
            depositAmount: depositAmount.toString(),
            estimateName,
          },
        },
        {
          stripeAccount: stripeAccountId, // charge goes to contractor's account
        }
      );

      // --- Redirect client to Stripe Checkout ---
      res.redirect(303, session.url);

    } catch (err) {
      console.error('createDepositCheckout error:', err);
      res.status(500).send('Failed to create payment session. Please try again.');
    }
  }
);

module.exports = { createDepositCheckout };