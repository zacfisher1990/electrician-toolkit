/**
 * Stripe Connect Functions
 * 
 * Handles contractor Stripe account onboarding and invoice payment links.
 * 
 * Setup:
 * 1. cd functions && npm install stripe
 * 2. firebase functions:secrets:set STRIPE_SECRET_KEY --project electrician-toolkit-33497
 * 3. firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project electrician-toolkit-33497
 * 4. Deploy: firebase deploy --only functions
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Define secrets
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

/**
 * Creates a Stripe Connect onboarding link for contractors
 * Called when contractor wants to connect their Stripe account
 */
exports.createStripeConnectLink = onCall(
  { 
    secrets: [stripeSecretKey],
    cors: true 
  },
  async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in to connect Stripe account');
    }

    const userId = request.auth.uid;
    const stripe = require('stripe')(stripeSecretKey.value());

    try {
      // Check if user already has a Stripe account
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      let accountId = userData?.stripeAccountId;

      // Create new Connect account if none exists
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          email: request.auth.token.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual',
          metadata: {
            firebaseUserId: userId
          }
        });
        
        accountId = account.id;
        
        // Save Stripe account ID to user document
        await db.collection('users').doc(userId).set({
          stripeAccountId: accountId,
          stripeOnboardingComplete: false
        }, { merge: true });
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `https://electrician.proxtrades.com/stripe-refresh?userId=${userId}`,
        return_url: `https://electrician.proxtrades.com/stripe-return?userId=${userId}`,
        type: 'account_onboarding',
      });

      return { 
        success: true, 
        url: accountLink.url,
        accountId: accountId
      };
    } catch (error) {
      console.error('Error creating Stripe Connect link:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

/**
 * Check if contractor's Stripe account is fully onboarded
 */
exports.checkStripeAccountStatus = onCall(
  { 
    secrets: [stripeSecretKey],
    cors: true 
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const userId = request.auth.uid;
    const stripe = require('stripe')(stripeSecretKey.value());

    try {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData?.stripeAccountId) {
        return { 
          connected: false, 
          onboardingComplete: false,
          message: 'No Stripe account connected' 
        };
      }

      const account = await stripe.accounts.retrieve(userData.stripeAccountId);
      
      const onboardingComplete = account.charges_enabled && account.payouts_enabled;
      
      // Update user document with current status
      await db.collection('users').doc(userId).set({
        stripeOnboardingComplete: onboardingComplete,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled
      }, { merge: true });

      return {
        connected: true,
        onboardingComplete,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        accountId: userData.stripeAccountId
      };
    } catch (error) {
      console.error('Error checking Stripe account status:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

/**
 * Creates a payment link for an invoice using Stripe Checkout
 */
exports.createInvoicePaymentLink = onCall(
  { 
    secrets: [stripeSecretKey],
    cors: true 
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { invoiceId } = request.data;
    
    if (!invoiceId) {
      throw new HttpsError('invalid-argument', 'Invoice ID is required');
    }

    const userId = request.auth.uid;
    const stripe = require('stripe')(stripeSecretKey.value());

    try {
      // Get the invoice
      const invoiceDoc = await db.collection('users').doc(userId)
        .collection('invoices').doc(invoiceId).get();
      
      if (!invoiceDoc.exists) {
        throw new HttpsError('not-found', 'Invoice not found');
      }

      const invoice = invoiceDoc.data();
      
      // Get contractor's Stripe account
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData?.stripeAccountId || !userData?.stripeOnboardingComplete) {
        throw new HttpsError('failed-precondition', 'Stripe account not connected or onboarding incomplete');
      }

      // Calculate total in cents
      const totalCents = Math.round(invoice.total * 100);
      
      // Build line items description
      const description = invoice.lineItems
        ?.map(item => `${item.description || item.name}`)
        .join(', ')
        .substring(0, 500) || 'Services rendered';

      // Create Checkout Session with connected account
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Invoice #${invoice.invoiceNumber || invoiceId.slice(-6)}`,
                description: description,
              },
              unit_amount: totalCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          // Send payment directly to contractor's Stripe account
          transfer_data: {
            destination: userData.stripeAccountId,
          },
          metadata: {
            invoiceId: invoiceId,
            contractorUserId: userId
          }
        },
        // Optional: take a platform fee (e.g., 1% or $0.50)
        // payment_intent_data: {
        //   application_fee_amount: Math.round(totalCents * 0.01), // 1% fee
        //   transfer_data: { destination: userData.stripeAccountId },
        // },
        metadata: {
          invoiceId: invoiceId,
          contractorUserId: userId
        },
        success_url: `https://electrician.proxtrades.com/payment-success?invoice=${invoiceId}`,
        cancel_url: `https://electrician.proxtrades.com/payment-cancelled?invoice=${invoiceId}`,
        customer_email: invoice.clientEmail || undefined,
      });

      // Save payment link to invoice
      await db.collection('users').doc(userId)
        .collection('invoices').doc(invoiceId).update({
          paymentLinkUrl: session.url,
          paymentLinkId: session.id,
          paymentLinkCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
          paymentStatus: 'pending'
        });

      return {
        success: true,
        paymentUrl: session.url,
        sessionId: session.id
      };
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

/**
 * Stripe Webhook Handler
 * Listens for payment events and updates invoice status
 * 
 * Setup: Add webhook endpoint in Stripe Dashboard pointing to:
 * https://us-central1-electrician-toolkit-33497.cloudfunctions.net/stripeWebhook
 */
exports.stripeWebhook = onRequest(
  { 
    secrets: [stripeSecretKey, stripeWebhookSecret],
    cors: false 
  },
  async (req, res) => {
    const stripe = require('stripe')(stripeSecretKey.value());
    
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        const invoiceId = session.metadata?.invoiceId;
        const contractorUserId = session.metadata?.contractorUserId;
        
        if (invoiceId && contractorUserId) {
          try {
            await db.collection('users').doc(contractorUserId)
              .collection('invoices').doc(invoiceId).update({
                paymentStatus: 'paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                paidAmount: session.amount_total / 100,
                stripePaymentIntentId: session.payment_intent,
                stripeCustomerEmail: session.customer_email
              });
            
            console.log(`Invoice ${invoiceId} marked as paid`);
          } catch (error) {
            console.error('Error updating invoice:', error);
          }
        }
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object;
        const invoiceId = session.metadata?.invoiceId;
        const contractorUserId = session.metadata?.contractorUserId;
        
        if (invoiceId && contractorUserId) {
          await db.collection('users').doc(contractorUserId)
            .collection('invoices').doc(invoiceId).update({
              paymentStatus: 'expired'
            });
        }
        break;
      }

      case 'account.updated': {
        // Handle connected account updates (onboarding completion)
        const account = event.data.object;
        const userId = account.metadata?.firebaseUserId;
        
        if (userId && account.charges_enabled && account.payouts_enabled) {
          await db.collection('users').doc(userId).update({
            stripeOnboardingComplete: true,
            stripeChargesEnabled: true,
            stripePayoutsEnabled: true
          });
          console.log(`User ${userId} Stripe onboarding complete`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

/**
 * Creates a Stripe Connect login link for contractors to access their dashboard
 */
exports.createStripeDashboardLink = onCall(
  { 
    secrets: [stripeSecretKey],
    cors: true 
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const userId = request.auth.uid;
    const stripe = require('stripe')(stripeSecretKey.value());

    try {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData?.stripeAccountId) {
        throw new HttpsError('failed-precondition', 'No Stripe account connected');
      }

      const loginLink = await stripe.accounts.createLoginLink(userData.stripeAccountId);

      return {
        success: true,
        url: loginLink.url
      };
    } catch (error) {
      console.error('Error creating dashboard link:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);