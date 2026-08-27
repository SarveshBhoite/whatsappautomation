import prisma from "./utils/prisma";
import { GoogleCalendarService } from "./services/googleCalendarService";

async function createAakashAppointment() {
  console.log("=== CREATING AAKASH JADHAV APPOINTMENT & GOOGLE MEET ===");

  const orgId = "demo-org-123";
  const customerName = "Aakash Jadhav";
  const customerPhone = "+919325174465";
  const customerEmail = "aakasharunjadhav@gmail.com";
  const title = "AI Strategy & Consultation Meeting";
  const startTime = new Date("2026-08-26T18:45:00");
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

  let meetUrl = "";
  let calendarEventId = "";
  let eventHtmlLink = "";
  let syncStatus = "PENDING";

  try {
    const gResult = await GoogleCalendarService.createCalendarEventWithMeet({
      organizationId: orgId,
      title,
      description: `Appointment for ${customerName} (${customerPhone})`,
      startTime,
      endTime,
      timezone: "Asia/Kolkata",
      customerEmail,
      customerName,
      customerPhone
    });

    calendarEventId = gResult.eventId;
    eventHtmlLink = gResult.htmlLink;
    meetUrl = gResult.meetUrl;
    syncStatus = gResult.syncStatus;
    console.log("✅ Google Meet Created:", meetUrl);
  } catch (gErr: any) {
    console.error("Google Calendar Error:", gErr.message);
  }

  const appt = await (prisma as any).appointment.create({
    data: {
      organizationId: orgId,
      customerPhone,
      customerName,
      customerEmail,
      title,
      description: "Booked via WhatsApp AI Agent",
      startTime,
      endTime,
      timezone: "Asia/Kolkata",
      status: "CONFIRMED",
      googleCalendarEventId: calendarEventId || null,
      googleEventHtmlLink: eventHtmlLink || null,
      googleMeetUrl: meetUrl || null,
      googleSyncStatus: syncStatus,
      notificationSent: true
    }
  });

  console.log(`✅ Appointment Created in Database with ID: ${appt.id}`);
}

createAakashAppointment()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
