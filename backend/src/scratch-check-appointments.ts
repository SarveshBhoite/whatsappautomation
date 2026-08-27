import prisma from "./utils/prisma";

async function checkAppointments() {
  console.log("=== CHECKING RECENT APPOINTMENTS ===");
  const appointments = await (prisma as any).appointment.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  });

  console.log(`Found ${appointments.length} appointments:`);
  for (const appt of appointments) {
    console.log({
      id: appt.id,
      title: appt.title,
      customerName: appt.customerName,
      googleCalendarEventId: appt.googleCalendarEventId,
      googleMeetUrl: appt.googleMeetUrl,
      googleSyncStatus: appt.googleSyncStatus,
      googleSyncError: appt.googleSyncError,
      createdAt: appt.createdAt
    });
  }

  console.log("\n=== CHECKING GOOGLE CALENDAR CONFIGS ===");
  const calConfigs = await (prisma as any).googleCalendarConfig.findMany();
  console.log("Google Calendar Configs count:", calConfigs.length);

  const gmbConfigs = await (prisma as any).googleBusinessConfig.findMany();
  console.log("Google Business Configs count:", gmbConfigs.length);
  for (const g of gmbConfigs) {
    console.log({
      id: g.id,
      accountName: g.accountName,
      accessToken: g.accessToken ? `Present (${g.accessToken.length} chars)` : "Missing",
      refreshToken: (g.refreshToken || g.googleRefreshToken) ? "Present" : "Missing"
    });
  }
}

checkAppointments()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error checking appointments:", err);
    process.exit(1);
  });
