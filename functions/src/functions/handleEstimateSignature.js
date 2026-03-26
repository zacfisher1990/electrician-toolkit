/**
 * Cloud Function: handleEstimateSignature
 * Serves a self-contained e-signature page for contract estimates.
 *
 * GET  ?estimateId=...&token=...&userId=...
 *   → Returns an HTML page showing the contract text + type-to-sign field.
 *
 * POST (JSON body: { estimateId, token, userId, signatureName })
 *   → Validates token, saves signature to Firestore, marks estimate Accepted.
 *   → Returns JSON { success, message }.
 */

const { onRequest } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const handleEstimateSignature = onRequest({ cors: true }, async (req, res) => {
  const db = getFirestore();

  // ─── POST: process signature submission ───────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { estimateId, token, userId, signatureName } = req.body;

      if (!estimateId || !token || !userId || !signatureName?.trim()) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
      }

      const estimateRef = db.collection('estimates').doc(estimateId);
      const estimateSnap = await estimateRef.get();

      if (!estimateSnap.exists) {
        return res.status(404).json({ success: false, message: 'Estimate not found.' });
      }

      const estimate = estimateSnap.data();

      // Validate token
      if (!estimate.responseToken || estimate.responseToken !== token) {
        return res.status(403).json({ success: false, message: 'This link has already been used or is invalid.' });
      }

      // Validate ownership
      if (estimate.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }

      // Already actioned
      if (['Accepted', 'Rejected'].includes(estimate.status)) {
        return res.status(409).json({
          success: false,
          message: `This estimate has already been ${estimate.status.toLowerCase()}.`,
        });
      }

      const signatureTimestamp = new Date().toISOString();

      // Save signature + mark Accepted + invalidate token
      await estimateRef.update({
        status: 'Accepted',
        signatureName: signatureName.trim(),
        signatureTimestamp: FieldValue.serverTimestamp(),
        signatureTimestampISO: signatureTimestamp,
        signatureIp: req.headers['x-forwarded-for'] || req.ip || '',
        responseToken: FieldValue.delete(), // single-use — invalidate immediately
        updatedAt: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        message: 'Estimate accepted and signature recorded.',
        signatureName: signatureName.trim(),
        signatureTimestamp,
      });
    } catch (err) {
      console.error('handleEstimateSignature POST error:', err);
      return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }

  // ─── GET: serve the signature HTML page ───────────────────────────────────
  if (req.method === 'GET') {
    const { estimateId, token, userId } = req.query;

    if (!estimateId || !token || !userId) {
      return res.status(400).send(errorPage('Invalid link. Please use the link from your email.'));
    }

    try {
      const estimateSnap = await db.collection('estimates').doc(estimateId).get();

      if (!estimateSnap.exists) {
        return res.status(404).send(errorPage('Estimate not found.'));
      }

      const estimate = estimateSnap.data();

      if (!estimate.responseToken || estimate.responseToken !== token) {
        return res.status(403).send(errorPage('This link has already been used or is no longer valid.'));
      }

      if (['Accepted', 'Rejected'].includes(estimate.status)) {
        return res.status(200).send(alreadyActionedPage(estimate.status, estimate.signatureName));
      }

      return res.status(200).send(signaturePage(estimate, estimateId, token, userId));
    } catch (err) {
      console.error('handleEstimateSignature GET error:', err);
      return res.status(500).send(errorPage('Server error. Please try again or contact your contractor.'));
    }
  }

  return res.status(405).send('Method not allowed.');
});

// ─── HTML page builders ───────────────────────────────────────────────────────

function pageShell(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background: #f3f4f6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .header {
      width: 100%;
      background: #292929;
      border-bottom: 4px solid #F7C600;
      padding: 24px 20px;
      text-align: center;
    }
    .header h1 { color: #F7C600; font-size: 22px; font-weight: 700; }
    .header p  { color: rgba(255,255,255,0.75); font-size: 13px; margin-top: 4px; }
    .card {
      width: 100%;
      max-width: 640px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      margin: 32px 16px;
      overflow: hidden;
    }
    .card-body { padding: 32px 28px; }
    h2 { color: #111827; font-size: 20px; margin-bottom: 6px; }
    .meta { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .total-row {
      display: flex; justify-content: space-between; align-items: center;
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 14px 16px; margin-bottom: 24px;
    }
    .total-row span:first-child { color: #6b7280; font-size: 14px; }
    .total-row span:last-child  { color: #111827; font-size: 20px; font-weight: 700; }
    .section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.6px; color: #6b7280; margin-bottom: 8px;
    }
    .contract-box {
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 16px; font-size: 13px; color: #4b5563; line-height: 1.65;
      max-height: 280px; overflow-y: auto; white-space: pre-wrap;
      margin-bottom: 28px;
    }
    .sig-label { font-size: 14px; color: #111827; font-weight: 600; margin-bottom: 6px; }
    .sig-sub   { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
    input[type="text"] {
      width: 100%; border: 2px solid #d1d5db; border-radius: 8px;
      padding: 13px 14px; font-size: 16px; color: #111827;
      font-family: 'Georgia', serif;
      transition: border-color 0.2s;
      outline: none;
    }
    input[type="text"]:focus { border-color: #F7C600; }
    .disclaimer {
      font-size: 12px; color: #9ca3af; margin-top: 10px; line-height: 1.5;
    }
    .btn {
      display: block; width: 100%; margin-top: 24px;
      background: #16a34a; color: #fff;
      border: none; border-radius: 8px; cursor: pointer;
      padding: 16px; font-size: 16px; font-weight: 700;
      transition: background 0.2s, opacity 0.2s;
    }
    .btn:hover:not(:disabled) { background: #15803d; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-msg { color: #dc2626; font-size: 13px; margin-top: 10px; display: none; }
    .success-box {
      text-align: center; padding: 40px 28px;
    }
    .success-icon { font-size: 56px; margin-bottom: 16px; }
    .success-box h2 { color: #15803d; font-size: 22px; margin-bottom: 8px; }
    .success-box p  { color: #6b7280; font-size: 15px; line-height: 1.6; }
    .sig-display {
      margin-top: 20px; padding: 16px; background: #f0fdf4;
      border: 1px solid #bbf7d0; border-radius: 8px;
      font-size: 13px; color: #166534;
    }
    .footer {
      width: 100%; text-align: center; padding: 20px;
      color: #9ca3af; font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ Electrician Pro X</h1>
    <p>Estimate Review &amp; Signature</p>
  </div>
  ${bodyContent}
  <div class="footer">Electrician Pro X &mdash; Powered by Pro X Trades LLC</div>
</body>
</html>`;
}

function signaturePage(estimate, estimateId, token, userId) {
  const total = parseFloat(estimate.total || 0).toFixed(2);
  const contractText = (estimate.contractText || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const estimateName = (estimate.name || 'Estimate').replace(/</g, '&lt;');
  const contractorName = (estimate.businessName || '').replace(/</g, '&lt;');

  const body = `
  <div class="card">
    <div class="card-body" id="form-view">
      <h2>Review &amp; Sign Estimate</h2>
      <p class="meta">${estimateName}${contractorName ? ` &mdash; ${contractorName}` : ''}</p>

      <div class="total-row">
        <span>Estimate Total</span>
        <span>$${total}</span>
      </div>

      <div class="section-label">Contract / Disclaimer</div>
      <div class="contract-box">${contractText}</div>

      <div class="sig-label">Your Signature</div>
      <p class="sig-sub">Type your full legal name below to sign and accept this estimate.</p>
      <input
        type="text"
        id="sig-input"
        placeholder="Full Name"
        autocomplete="name"
        autocorrect="off"
        spellcheck="false"
      />
      <p class="disclaimer">
        By clicking "Sign &amp; Accept Estimate" you confirm that you have read and agree
        to the terms above. Your typed name constitutes a legally binding electronic signature.
      </p>
      <p class="error-msg" id="error-msg"></p>
      <button class="btn" id="submit-btn" disabled onclick="submitSignature()">
        ✍️ Sign &amp; Accept Estimate
      </button>
    </div>

    <div class="success-box" id="success-view" style="display:none;">
      <div class="success-icon">✅</div>
      <h2>Estimate Accepted</h2>
      <p>Your signature has been recorded and the estimate has been accepted.<br>Your contractor will be in touch shortly.</p>
      <div class="sig-display" id="sig-confirmation"></div>
    </div>
  </div>

  <script>
    const input = document.getElementById('sig-input');
    const btn   = document.getElementById('submit-btn');
    const errEl = document.getElementById('error-msg');

    input.addEventListener('input', () => {
      btn.disabled = input.value.trim().length < 2;
      errEl.style.display = 'none';
    });

    async function submitSignature() {
      const name = input.value.trim();
      if (name.length < 2) return;

      btn.disabled = true;
      btn.textContent = 'Submitting…';
      errEl.style.display = 'none';

      try {
        const res = await fetch(window.location.pathname, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estimateId: '${estimateId}',
            token: '${token}',
            userId: '${userId}',
            signatureName: name,
          }),
        });

        const data = await res.json();

        if (data.success) {
          document.getElementById('form-view').style.display = 'none';
          document.getElementById('success-view').style.display = 'block';
          const ts = data.signatureTimestamp
            ? new Date(data.signatureTimestamp).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
            : new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
          document.getElementById('sig-confirmation').innerHTML =
            '<strong>Signed by:</strong> ' + data.signatureName + '<br><strong>Date:</strong> ' + ts;
        } else {
          errEl.textContent = data.message || 'Something went wrong. Please try again.';
          errEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = '✍️ Sign & Accept Estimate';
        }
      } catch (e) {
        errEl.textContent = 'Network error. Please check your connection and try again.';
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = '✍️ Sign & Accept Estimate';
      }
    }
  </script>`;

  return pageShell(`Sign Estimate — ${estimate.name || 'Estimate'}`, body);
}

function alreadyActionedPage(status, signatureName) {
  const isAccepted = status === 'Accepted';
  const body = `
  <div class="card">
    <div class="success-box">
      <div class="success-icon">${isAccepted ? '✅' : '❌'}</div>
      <h2>Estimate Already ${status}</h2>
      <p>This estimate has already been ${status.toLowerCase()}${isAccepted && signatureName ? ` and signed by <strong>${signatureName}</strong>` : ''}.<br>No further action is needed.</p>
    </div>
  </div>`;
  return pageShell(`Estimate ${status}`, body);
}

function errorPage(message) {
  const body = `
  <div class="card">
    <div class="success-box">
      <div class="success-icon">⚠️</div>
      <h2>Something Went Wrong</h2>
      <p>${message}</p>
    </div>
  </div>`;
  return pageShell('Error', body);
}

module.exports = { handleEstimateSignature };