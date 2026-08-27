import prisma from "../utils/prisma";
import { GoogleCalendarService } from "./googleCalendarService";
import { WhatsAppService } from "./whatsappService";

export interface CreateAppointmentDTO {
  organizationId: string;
  whatsappConfigId?: string | null;
  conversationId?: string | null;
  customerPhone?: string | null;
  customerName: string;
  customerEmail?: string | null;
  title: string;
  description?: string | null;
  startTime: Date | string;
  endTime: Date | string;
  timezone?: string;
  googleAccountId?: string | null;
  calendarId?: string | null;
  idempotencyKey?: string | null;
  skipWhatsAppNotification?: boolean;
}

export interface AppointmentResult {
  appointment: any;
  meetUrl: string | null;
  calendarEventId: string | null;
  googleSyncStatus: "SYNCED" | "PENDING" | "FAILED" | "NOT_REQUESTED" | "AUTH_REQUIRED";
  googleSyncError?: string | null;
}

export class AppointmentService {
  /**
   * Central Authoritative Method to Create an Appointment across ALL channels (UI, AI Agent, API)
   * Guarantees:
   * 1. DB Record is created first (status = CONFIRMED, googleSyncStatus = PENDING)
   * 2. Google Calendar event with real Google Meet is created with conferenceDataVersion=1
   * 3. Google Meet conference is polled/verified until 'success' status
   * 4. Real Google Meet URI is persisted to the DB appointment record
   * 5. Real-time Socket.IO event 'new-appointment' is broadcast to all active dashboards
   * 6. WhatsApp notification is sent ONLY with the verified, saved Meet URI (if phone is provided)
   */
  public static async createAppointment(dto: CreateAppointmentDTO): Promise<AppointmentResult> {
    const {
      organizationId,
      whatsappConfigId,
      conversationId,
      customerPhone,
      customerName,
      customerEmail,
      title,
      description,
      startTime: rawStartTime,
      endTime: rawEndTime,
      timezone = "Asia/Kolkata",
      googleAccountId,
      calendarId
    } = dto;

    const startTime = new Date(rawStartTime);
    const endTime = new Date(rawEndTime);
    const apptTitle = title || `AI Consultation - ${customerName}`;
    const apptDescription = description || `Appointment for ${customerName} (${customerPhone || ""}). Booked via CRM.`;

    console.log(`[APPOINTMENT SERVICE] 📅 Creating appointment for "${customerName}" (${customerPhone || 'no phone'}) in Org: ${organizationId}...`);

    // 1. Check for Duplicate/Idempotent creation within the same window for the same customer
    const existing = await (prisma as any).appointment.findFirst({
      where: {
        organizationId,
        customerName,
        customerPhone: customerPhone || undefined,
        startTime: {
          gte: new Date(startTime.getTime() - 2 * 60 * 1000),
          lte: new Date(startTime.getTime() + 2 * 60 * 1000)
        }
      }
    });

    if (existing) {
      console.log(`[APPOINTMENT SERVICE] ⚡ Idempotent match found! Returning existing appointment: ${existing.id}`);
      return {
        appointment: existing,
        meetUrl: existing.googleMeetUrl || null,
        calendarEventId: existing.googleCalendarEventId || null,
        googleSyncStatus: (existing.googleSyncStatus as any) || "SYNCED"
      };
    }

    // 2. Persist appointment record immediately into DB
    let appointment = await (prisma as any).appointment.create({
      data: {
        organizationId,
        whatsappConfigId: whatsappConfigId || null,
        conversationId,
        customerPhone,
        customerName,
        customerEmail,
        title: apptTitle,
        description: apptDescription,
        startTime,
        endTime,
        timezone,
        status: "CONFIRMED",
        googleAccountId: googleAccountId || null,
        googleCalendarId: calendarId || "primary",
        googleSyncStatus: "PENDING",
        notificationSent: false
      }
    });

    console.log(`[APPOINTMENT SERVICE] CRM Appointment record created. ID: ${appointment.id}`);

    // Broadcast initial state to Appointments dashboard immediately
    this.broadcastAppointmentEvent(organizationId, appointment);

    // 3. Create authentic Google Calendar Event & Google Meet Room
    let meetUrl: string | null = null;
    let calendarEventId: string | null = null;
    let eventHtmlLink: string | null = null;
    let syncStatus: "SYNCED" | "PENDING" | "FAILED" | "AUTH_REQUIRED" = "PENDING";
    let syncError: string | null = null;

    try {
      const gResult = await GoogleCalendarService.createCalendarEventWithMeet({
        organizationId,
        googleAccountId: googleAccountId || undefined,
        calendarId: calendarId || undefined,
        title: apptTitle,
        description: apptDescription,
        startTime,
        endTime,
        timezone,
        customerEmail: customerEmail || undefined,
        customerName,
        customerPhone: customerPhone || undefined
      });

      calendarEventId = gResult.eventId || null;
      eventHtmlLink = gResult.htmlLink || null;
      meetUrl = gResult.meetUrl || null;
      syncStatus = gResult.syncStatus as any;
    } catch (gErr: any) {
      console.error("[APPOINTMENT SERVICE] ❌ Google Calendar sync error:", gErr.message);
      syncStatus = gErr.message?.includes("OAuth") || gErr.message?.includes("account") ? "AUTH_REQUIRED" : "FAILED";
      syncError = gErr.message;
    }

    // 4. Update Appointment record with Google Meet details
    appointment = await (prisma as any).appointment.update({
      where: { id: appointment.id },
      data: {
        googleCalendarEventId: calendarEventId,
        googleEventHtmlLink: eventHtmlLink,
        googleMeetUrl: meetUrl,
        googleSyncStatus: syncStatus,
        googleSyncError: syncError
      }
    });

    console.log(`[APPOINTMENT SERVICE] ✅ Appointment updated with Google status: ${syncStatus}, Meet URL: ${meetUrl || 'None'}`);

    // Broadcast updated state to frontend
    this.broadcastAppointmentEvent(organizationId, appointment);

    // 5. Send WhatsApp notification if requested, not skipped, and not yet sent
    if (customerPhone && !dto.skipWhatsAppNotification && !appointment.notificationSent) {
      try {
        await this.sendAppointmentWhatsAppNotification(organizationId, appointment);
        appointment = await (prisma as any).appointment.update({
          where: { id: appointment.id },
          data: { notificationSent: true }
        });
      } catch (notifErr: any) {
        console.warn("[APPOINTMENT SERVICE] WhatsApp notification error:", notifErr.message);
      }
    }

    return {
      appointment,
      meetUrl,
      calendarEventId,
      googleSyncStatus: syncStatus,
      googleSyncError: syncError
    };
  }

  /**
   * Reschedule an existing appointment
   */
  public static async rescheduleAppointment(
    appointmentId: string,
    organizationId: string,
    newStartTime: Date | string,
    newEndTime: Date | string,
    title?: string,
    description?: string
  ) {
    const appointment = await (prisma as any).appointment.findFirst({
      where: { id: appointmentId, organizationId }
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const startTime = new Date(newStartTime);
    const endTime = new Date(newEndTime);

    if (appointment.googleCalendarEventId) {
      try {
        await GoogleCalendarService.updateCalendarEvent({
          organizationId,
          googleAccountId: appointment.googleAccountId || undefined,
          calendarId: appointment.googleCalendarId || "primary",
          eventId: appointment.googleCalendarEventId,
          title: title || appointment.title,
          description: description || appointment.description,
          startTime,
          endTime,
          timezone: appointment.timezone
        });
      } catch (err: any) {
        console.warn("[APPOINTMENT SERVICE] Google Calendar update warning:", err.message);
      }
    }

    const updated = await (prisma as any).appointment.update({
      where: { id: appointmentId },
      data: {
        startTime,
        endTime,
        title: title || appointment.title,
        status: "RESCHEDULED"
      }
    });

    this.broadcastAppointmentEvent(organizationId, updated);
    return updated;
  }

  /**
   * Cancel an existing appointment
   */
  public static async cancelAppointment(appointmentId: string, organizationId: string) {
    const appointment = await (prisma as any).appointment.findFirst({
      where: { id: appointmentId, organizationId }
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.googleCalendarEventId) {
      try {
        await GoogleCalendarService.deleteCalendarEvent({
          organizationId,
          googleAccountId: appointment.googleAccountId || undefined,
          calendarId: appointment.googleCalendarId || "primary",
          eventId: appointment.googleCalendarEventId
        });
      } catch (err: any) {
        console.warn("[APPOINTMENT SERVICE] Google Calendar delete warning:", err.message);
      }
    }

    const updated = await (prisma as any).appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED" }
    });

    this.broadcastAppointmentEvent(organizationId, updated);
    return updated;
  }

  /**
   * Helper to format and send WhatsApp confirmation with real stored Meet URL
   */
  private static async sendAppointmentWhatsAppNotification(organizationId: string, appointment: any) {
    const { WhatsAppRuntimeContextResolver } = require("./whatsapp/whatsappRuntimeContext");
    const ctx = await WhatsAppRuntimeContextResolver.resolveContext({
      organizationId,
      whatsappConfigId: appointment.whatsappConfigId,
      conversationId: appointment.conversationId,
    });

    if (!ctx?.phoneNumberId || !ctx?.accessToken || !appointment.customerPhone) {
      return;
    }

    const waConfig = {
      phoneNumberId: ctx.phoneNumberId,
      accessToken: ctx.accessToken,
      phoneNumber: ctx.displayPhoneNumber,
    };

    const startD = new Date(appointment.startTime);
    const endD = new Date(appointment.endTime);
    const formattedDate = startD.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const formattedTime = `${startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    let message = `Your appointment has been confirmed! ✅\n\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n👤 Name: ${appointment.customerName}\n📌 Subject: ${appointment.title}`;

    if (appointment.googleMeetUrl) {
      message += `\n\n🎥 Join Google Meet:\n${appointment.googleMeetUrl}`;
    }

    const { OutboundMessageService } = require("./whatsapp/outboundMessageService");
    await OutboundMessageService.dispatch({
      organizationId,
      whatsappConfigId: ctx.whatsappConfigId,
      phoneNumberId: ctx.phoneNumberId,
      accessToken: ctx.accessToken,
      recipientPhone: appointment.customerPhone,
      type: "text",
      text: message,
      conversationId: appointment.conversationId || undefined,
      senderName: "Calendar Assistant",
      source: "appointment",
      priority: "P2",
      idempotencyKey: `appt:${appointment.id}:confirmation`,
    });
  }

  /**
   * Helper to broadcast real-time events via Socket.IO
   */
  private static broadcastAppointmentEvent(organizationId: string, appointment: any) {
    try {
      const { io } = require("../index");
      if (io) {
        io.to(organizationId).emit("new-appointment", { appointment });
      }
    } catch (err: any) {
      console.warn("[APPOINTMENT SERVICE] Socket broadcast warning:", err.message);
    }
  }
}
