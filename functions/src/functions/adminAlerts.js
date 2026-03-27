const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Fires on any write to a job document.
 * Sends a push notification to the job owner when an invitee clocks in or out.
 * Sessions written by an invitee include a `clockedBy: { uid, name, email }` field.
 */
exports.notifyJobOwnerOnClockInOut = functions.firestore
  .document('users/{ownerId}/jobs/{jobId}')
  .onWrite(async (change, context) => {
    const { ownerId, jobId } = context.params;

    // Skip deletes
    if (!change.after.exists) return null;

    const before = change.before.exists ? (change.before.data() || {}) : {};
    const after  = change.after.data() || {};

    const beforeSessions = before.workSessions || [];
    const afterSessions  = after.workSessions  || [];

    // ── Detect clock-in: currentSessionClockedBy appeared and clockedIn flipped to true ──
    const wasClockedIn  = before.clockedIn === true;
    const nowClockedIn  = after.clockedIn  === true;
    const clockedBy     = after.currentSessionClockedBy || null;

    const isClockIn  = !wasClockedIn && nowClockedIn && clockedBy;
    const isClockOut = wasClockedIn && !nowClockedIn;

    if (!isClockIn && !isClockOut) return null;

    // ── For clock-out, find the session that just completed (has clockedBy) ──
    let workerInfo = null;
    let clockOutSession = null;

    if (isClockIn) {
      workerInfo = clockedBy;
    } else {
      // Most recent session that has clockedBy
      clockOutSession = [...afterSessions]
        .reverse()
        .find(s => s.clockedBy && !beforeSessions.some(
          b => b.startTime === s.startTime && b.endTime === s.endTime
        ));
      workerInfo = clockOutSession?.clockedBy || null;
    }

    if (!workerInfo) return null;

    // Only notify if the clocking user is NOT the owner
    if (workerInfo.uid === ownerId) return null;

    const workerName = workerInfo.name || workerInfo.email || 'A team member';
    const jobTitle   = after.title || after.name || 'your job';

    // ── Build notification ──
    let title, body;
    if (isClockIn) {
      title = '🟢 Team Member Clocked In';
      body  = `${workerName} clocked in to ${jobTitle}`;
    } else {
      title = '🔴 Team Member Clocked Out';
      if (clockOutSession) {
        try {
          const ms  = new Date(clockOutSession.endTime) - new Date(clockOutSession.startTime);
          const hrs = Math.floor(ms / 3_600_000);
          const min = Math.floor((ms % 3_600_000) / 60_000);
          const duration = hrs > 0 ? `${hrs}h ${min}m` : `${min}m`;
          body = `${workerName} clocked out of ${jobTitle} after ${duration}`;
        } catch {
          body = `${workerName} clocked out of ${jobTitle}`;
        }
      } else {
        body = `${workerName} clocked out of ${jobTitle}`;
      }
    }

    // ── Get owner's FCM token(s) ──
    const ownerSnap = await admin.firestore().collection('users').doc(ownerId).get();
    if (!ownerSnap.exists) return null;

    const ownerData = ownerSnap.data();
    const tokens = ownerData.fcmTokens
      ? (Array.isArray(ownerData.fcmTokens) ? ownerData.fcmTokens : [ownerData.fcmTokens])
      : ownerData.fcmToken
        ? [ownerData.fcmToken]
        : [];

    if (tokens.length === 0) {
      console.log(`[ClockNotify] Owner ${ownerId} has no FCM tokens — skipping`);
      return null;
    }

    const payload = {
      notification: { title, body },
      data: {
        type:       'clock_notification',
        jobId,
        action:     isClockIn ? 'clock_in' : 'clock_out',
        workerUid:  workerInfo.uid,
        workerName,
      },
      apns:    { payload: { aps: { sound: 'default' } } },
      android: { notification: { sound: 'default' } },
    };

    // Send to all tokens, clean up stale ones
    const results = await Promise.allSettled(
      tokens.map(token => admin.messaging().send({ ...payload, token }))
    );

    const staleTokens = tokens.filter((_, i) => {
      const r = results[i];
      return r.status === 'rejected' && (
        r.reason?.code === 'messaging/registration-token-not-registered' ||
        r.reason?.code === 'messaging/invalid-registration-token'
      );
    });

    if (staleTokens.length > 0) {
      const validTokens  = tokens.filter(t => !staleTokens.includes(t));
      const updateField  = ownerData.fcmTokens
        ? { fcmTokens: validTokens }
        : { fcmToken: validTokens[0] || null };
      await admin.firestore().collection('users').doc(ownerId).update(updateField);
      console.log(`[ClockNotify] Removed ${staleTokens.length} stale token(s) for ${ownerId}`);
    }

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[ClockNotify] ${succeeded}/${tokens.length} sent — ${body}`);

    return null;
  });