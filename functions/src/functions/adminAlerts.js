const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

exports.notifyJobOwnerOnClockInOut = onDocumentWritten(
  'users/{ownerId}/jobs/{jobId}',
  async (event) => {
    const { ownerId, jobId } = event.params;

        console.log(`[ClockNotify] Triggered — ownerId: ${ownerId}, jobId: ${jobId}`);


    // Skip deletes
    if (!event.data.after.exists()) return null;

    const before = event.data.before.exists() ? (event.data.before.data() || {}) : {};
    const after  = event.data.after.data() || {};

    // ── Detect clock-in: a new entry appeared in activeInviteeSessions ──
    const beforeInviteeSessions = before.activeInviteeSessions || [];
    const afterInviteeSessions  = after.activeInviteeSessions  || [];

    console.log(`[ClockNotify] beforeInviteeSessions: ${JSON.stringify(beforeInviteeSessions)}`);
    console.log(`[ClockNotify] afterInviteeSessions: ${JSON.stringify(afterInviteeSessions)}`);



    const newEntry = afterInviteeSessions.find(s =>
      !beforeInviteeSessions.some(b => b.uid === s.uid && b.startTime === s.startTime)
    );

    // ── Detect clock-out: an entry disappeared from activeInviteeSessions ──
    const removedEntry = beforeInviteeSessions.find(s =>
      !afterInviteeSessions.some(a => a.uid === s.uid && a.startTime === s.startTime)
    );

    console.log(`[ClockNotify] newEntry: ${JSON.stringify(newEntry)}`);
    console.log(`[ClockNotify] removedEntry: ${JSON.stringify(removedEntry)}`);



    const isClockIn  = !!newEntry;
    const isClockOut = !!removedEntry && !newEntry;

    if (!isClockIn && !isClockOut) {
      console.log('[ClockNotify] No clock-in or clock-out detected — skipping');
      return null;
    }

    let workerInfo      = isClockIn ? newEntry : removedEntry;
    let clockOutSession = null;

    if (isClockOut) {
      const afterWorkSessions  = after.workSessions  || [];
      const beforeWorkSessions = before.workSessions || [];
      clockOutSession = afterWorkSessions.find(s =>
        s.clockedBy?.uid === removedEntry.uid &&
        !beforeWorkSessions.some(b => b.startTime === s.startTime)
      );
    }

    if (!workerInfo) return null;
    if (workerInfo.uid === ownerId) return null;

    const workerName = workerInfo.name || workerInfo.email || 'A team member';
    const jobTitle   = after.title || after.name || 'your job';

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
      const validTokens = tokens.filter(t => !staleTokens.includes(t));
      const updateField = ownerData.fcmTokens
        ? { fcmTokens: validTokens }
        : { fcmToken: validTokens[0] || null };
      await admin.firestore().collection('users').doc(ownerId).update(updateField);
      console.log(`[ClockNotify] Removed ${staleTokens.length} stale token(s) for ${ownerId}`);
    }

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[ClockNotify] ${succeeded}/${tokens.length} sent — ${body}`);

    return null;
  }
);