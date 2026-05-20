const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { Resend } = require("resend");

exports.dailyUserExport = onSchedule(
  {
    schedule: "0 8 * * *",
    timeZone: "America/Los_Angeles",
  },
  async () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const db = admin.firestore();

    const [usersSnap, usageSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("userUsage").get(),
    ]);

    const usageMap = {};
    usageSnap.forEach((doc) => {
      const d = doc.data();
      usageMap[doc.id] = {
        jobs: d.total?.jobs ?? 0,
        estimates: d.total?.estimates ?? 0,
        invoices: d.total?.invoices ?? 0,
        usageUpdatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? "",
      };
    });

    const rows = [];
    usersSnap.forEach((doc) => {
      const u = doc.data();
      const usage = usageMap[doc.id] || {
        jobs: 0,
        estimates: 0,
        invoices: 0,
        usageUpdatedAt: "",
      };
      rows.push({
        uid: doc.id,
        email: u.email ?? "",
        displayName: u.displayName ?? "",
        authProvider: u.authProvider ?? "",
        createdAt: u.createdAt?.toDate?.()?.toISOString() ?? "",
        jobs: usage.jobs,
        estimates: usage.estimates,
        invoices: usage.invoices,
        usageUpdatedAt: usage.usageUpdatedAt,
        hasUsageDoc: !!usageMap[doc.id],
      });
    });

    rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const today = new Date().toISOString().slice(0, 10);
    const filename = `epx-users-${today}.csv`;
    const active = rows.filter(
      (r) => r.jobs > 0 || r.estimates > 0 || r.invoices > 0
    );

    await resend.emails.send({
      from: "EPX Reports <support@proxtrades.com>",
      to: "zcfshr@gmail.com",
      subject: `EPX User Report — ${today}`,
      html: `
        <p>Daily user export attached.</p>
        <ul>
          <li><strong>Total users:</strong> ${rows.length}</li>
          <li><strong>Active (any usage):</strong> ${active.length}</li>
          <li><strong>Zero-usage:</strong> ${rows.length - active.length}</li>
        </ul>
      `,
      attachments: [
        {
          filename,
          content: Buffer.from(csv).toString("base64"),
        },
      ],
    });

    console.log(`✅ Emailed ${rows.length} users report for ${today}`);
  }
);
