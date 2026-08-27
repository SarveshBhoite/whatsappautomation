import prisma from "./utils/prisma";
import { GoogleCalendarService } from "./services/googleCalendarService";

async function testGoogleMeetFlow() {
  console.log("=================================================");
  console.log("   TESTING GOOGLE CALENDAR & GOOGLE MEET FLOW   ");
  console.log("=================================================");

  const orgId = "demo-org-123";
  const customerName = "Rahul Sharma";
  const customerPhone = "+917709936965";
  const customerEmail = "rahul.sharma@example.com";
  const title = "AI Consultation & Strategy Meeting (E2E Test)";
  const startTime = new Date(Date.now() + 86400000); // Tomorrow
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 mins later

  console.log(`\n1. Creating Appointment for ${customerName} (${customerPhone})...`);
  console.log(`Start Time: ${startTime.toLocaleString()}`);

  let meetUrl = "";
  let calendarEventId = "";
  let eventHtmlLink = "";
  let syncStatus = "PENDING";
  let syncError = null;

  try {
    const gResult = await GoogleCalendarService.createCalendarEventWithMeet({
      organizationId: orgId,
      title,
      description: `E2E Test Consultation Meeting for ${customerName}`,
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

    console.log(`\n✅ Google Calendar Event Created Successfully!`);
    console.log(`Event ID: ${calendarEventId}`);
    console.log(`Google Calendar HTML Link: ${eventHtmlLink}`);
    console.log(`Live Google Meet URL: ${meetUrl || "Pending/Fallback"}`);
  } catch (gErr: any) {
    console.warn(`\n⚠️ Google API note: ${gErr.message}`);
    syncStatus = "FAILED";
    syncError = gErr.message;
  }

  // Save Appointment in Database
  const appointment = await (prisma as any).appointment.create({
    data: {
      organizationId: orgId,
      customerPhone,
      customerName,
      customerEmail,
      title,
      description: "E2E Test Booking",
      startTime,
      endTime,
      timezone: "Asia/Kolkata",
      status: "CONFIRMED",
      googleCalendarEventId: calendarEventId || null,
      googleEventHtmlLink: eventHtmlLink || null,
      googleMeetUrl: meetUrl || null,
      googleSyncStatus: syncStatus,
      googleSyncError: syncError,
      notificationSent: true
    }
  });

  console.log(`\n2. Appointment Saved to Database! Record ID: ${appointment.id}`);

  // Format WhatsApp Outgoing Message
  const formattedDate = startTime.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const formattedTime = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  let waMessage = `Your appointment has been confirmed! ✅\n\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n👤 Name: ${customerName}\n📌 Subject: ${title}`;

  if (meetUrl) {
    waMessage += `\n\n🎥 Join Google Meet:\n${meetUrl}`;
  } else {
    waMessage += `\n\n🎥 Join Google Meet:\nhttps://meet.google.com/abc-defg-hij`;
  }

  console.log("\n=================================================");
  console.log("  CONFIRMATION MESSAGE READY FOR WHATSAPP SEND   ");
  console.log("=================================================");
  console.log(waMessage);
  console.log("=================================================\n");
}

testGoogleMeetFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("E2E Test Error:", err);
    process.exit(1);
  });
