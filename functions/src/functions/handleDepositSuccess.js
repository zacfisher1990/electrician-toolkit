/**
 * Cloud Function: handleDepositSuccess
 * HTTP GET handler — Stripe redirects here after successful deposit payment.
 * Verifies the session, updates estimate status, creates invoice, notifies contractor.
 *
 * NOTE: This is the redirect-based confirmation. For production you should ALSO
 * handle the `checkout.session.completed` Stripe webhook (stripeDepositWebhook.js)
 * as the authoritative source — redirect confirmations can be spoofed or missed.
 */

const { onRequest } = require('firebase-functions/v2/https');
const { defineString, defineSecret } = require('firebase-functions/params');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { Resend } = require('resend');
const Stripe = require('stripe');

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const resendApiKey = defineString('RESEND_API_KEY');

// Inline helper — mirrors what createInvoiceFromEstimate does on the client side
function buildInvoiceFromEstimate(estimate) {
  const lineItems = [];

  if (estimate.laborHours && estimate.laborRate) {
    lineItems.push({
      description: `Labor: ${estimate.laborHours} hours @ $${estimate.laborRate}/hr`,
      quantity: 1,
      rate: parseFloat(estimate.laborHours) * parseFloat(estimate.laborRate),
    });
  }

  (estimate.materials || []).forEach(m => {
    lineItems.push({
      description: m.name,
      quantity: parseFloat(m.quantity) || 1,
      rate: parseFloat(m.cost) || 0,
    });
  });

  (estimate.additionalItems || []).forEach(item => {
    lineItems.push({
      description: item.description,
      quantity: 1,
      rate: parseFloat(item.amount) || 0,
    });
  });

  // Fallback: no line items but estimate has a total
  if (lineItems.length === 0 && (estimate.total || estimate.estimatedCost)) {
    lineItems.push({
      description: estimate.name || 'Labor & Materials',
      quantity: 1,
      rate: parseFloat(estimate.total || estimate.estimatedCost) || 0,
    });
  }

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  return {
    client: estimate.clientName || estimate.client || '',
    clientEmail: estimate.clientEmail || '',
    date: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    paymentTerms: 'Net 30',
    lineItems,
    notes: estimate.notes || '',
    total: parseFloat(estimate.total) || 0,
    status: 'Partial',
    jobId: estimate.jobId || null,
  };
}

function successHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Deposit Received</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #f3f4f6; min-height: 100vh;
           display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #fff; border-radius: 16px; padding: 40px 32px;
            max-width: 480px; width: 100%;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 12px; }
    p  { font-size: 15px; color: #6b7280; line-height: 1.6; margin-bottom: 8px; }
    .footer { font-size: 12px; color: #9ca3af; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎉</div>
    <h1>Deposit Received!</h1>
    <p>Your payment has been processed successfully.</p>
    <p>Your contractor has been notified and will be in touch shortly to schedule the work.</p>
    <p class="footer">Electrician Pro X · Powered by Pro X Trades LLC</p>
  </div>
</body>
</html>`;
}

// Generate next invoice number server-side by querying existing invoices
async function getNextInvoiceNumber(db, userId) {
  try {
    const snapshot = await db.collection('invoices')
      .where('userId', '==', userId)
      .get();

    const numbers = snapshot.docs
      .map(d => {
        const match = d.data().invoiceNumber?.match(/INV-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);

    const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `INV-${String(next).padStart(3, '0')}`;
  } catch (err) {
    console.error('Error generating invoice number:', err);
    return `INV-${String(Date.now()).slice(-4)}`;
  }
}

const handleDepositSuccess = onRequest(
  { cors: false, secrets: ['STRIPE_SECRET_KEY'] },
  async (req, res) => {
    const { estimateId, userId, session_id } = req.query;

    if (!estimateId || !userId || !session_id) {
      res.status(400).send('Missing parameters.');
      return;
    }

    const db = getFirestore();
    const resend = new Resend(resendApiKey.value());
    const stripe = Stripe(stripeSecretKey.value());

    try {
      // --- Load estimate ---
      const estimateRef = db.collection('estimates').doc(estimateId);
      const estimateSnap = await estimateRef.get();

      if (!estimateSnap.exists) {
        res.status(404).send('Estimate not found.');
        return;
      }

      const estimate = { id: estimateId, ...estimateSnap.data() };

      // --- Avoid double-processing (webhook may have already handled this) ---
      if (estimate.status === 'Accepted' && estimate.depositPaid) {
        res.status(200).send(successHTML());
        return;
      }

      // --- Load contractor's Stripe account to verify session ---
      const userSnap = await db.collection('users').doc(userId).get();
      const userData = userSnap.exists ? userSnap.data() : {};
      const stripeAccountId = userData.stripeAccountId;

      // --- Verify Stripe session is actually paid ---
      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(
          session_id,
          stripeAccountId ? { stripeAccount: stripeAccountId } : {}
        );
      } catch (stripeErr) {
        console.error('Could not retrieve Stripe session:', stripeErr);
        // Still show success — webhook is the authoritative source
        res.status(200).send(successHTML());
        return;
      }

      if (session.payment_status !== 'paid') {
        res.status(400).send('Payment not completed.');
        return;
      }

      const amountPaid = session.amount_total / 100; // convert from cents

      // --- Update estimate: Accepted, deposit paid ---
      await estimateRef.update({
        status: 'Accepted',
        depositPaid: true,
        depositPaidAt: FieldValue.serverTimestamp(),
        depositPaidAmount: amountPaid,
        stripeSessionId: session_id,
        responseToken: FieldValue.delete(),
        respondedAt: FieldValue.serverTimestamp(),
        respondedAction: 'accept_with_deposit',
      });

      // --- Auto-create invoice with deposit pre-applied ---
      try {
        const invoiceNumber = await getNextInvoiceNumber(db, userId);
        const invoiceBase = buildInvoiceFromEstimate(estimate);
        const invoiceData = {
          ...invoiceBase,
          invoiceNumber,
          estimateId,
          payments: [
            {
              amount: amountPaid,
              method: 'Stripe (deposit)',
              paidAt: new Date().toISOString(),
              note: 'Deposit paid online at estimate acceptance',
            }
          ],
          amountPaid: amountPaid,
          balance: Math.max(0, (parseFloat(estimate.total) || 0) - amountPaid),
          status: amountPaid >= (parseFloat(estimate.total) || 0) ? 'Paid' : 'Partial',
        };

        await db.collection('invoices').add({
          ...invoiceData,
          userId,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        console.log('Invoice created with deposit applied.');
      } catch (invoiceErr) {
        console.error('Invoice creation error (non-fatal):', invoiceErr);
      }

      // --- Notify contractor ---
      const contractorEmail = userData.email;
      if (contractorEmail) {
        await resend.emails.send({
          from: 'Electrician Pro X <notifications@proxtrades.com>',
          to: contractorEmail,
          subject: `💰 Deposit Received: ${estimate.name || 'Estimate'}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
              <h2 style="color:#111827;">💰 Deposit Received</h2>
              <p style="color:#374151;">
                <strong>${estimate.clientName || 'Your client'}</strong> has paid a 
                <strong>$${amountPaid.toFixed(2)}</strong> deposit for 
                <strong>${estimate.name || 'an estimate'}</strong>.
              </p>
              <p style="color:#374151;">An invoice has been automatically created with the deposit applied.</p>
              <p style="color:#6b7280;font-size:13px;margin-top:24px;">
                Open Electrician Pro X to view the invoice and schedule the work.
              </p>
            </div>
          `,
        });
      }

      res.status(200).send(successHTML());

    } catch (err) {
      console.error('handleDepositSuccess error:', err);
      // Show success anyway — webhook will handle authoritative state
      res.status(200).send(successHTML());
    }
  }
);

module.exports = { handleDepositSuccess };