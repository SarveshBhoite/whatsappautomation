import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { AppointmentService } from "../services/appointmentService";
import { GoogleCalendarService } from "../services/googleCalendarService";

const router = Router();

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || (req.query.orgId as string) || "demo-org-123";
};

// 1. GET: List Appointments for Organization
router.get("/", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);

    const appointments = await (prisma as any).appointment.findMany({
      where: { organizationId: orgId },
      orderBy: [
        { createdAt: "desc" },
        { startTime: "desc" }
      ]
    });

    return res.status(200).json({ appointments });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch appointments", details: error.message });
  }
});

// 2. POST: Create Appointment + Google Calendar Event + Google Meet URL
router.post("/", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerName,
      customerPhone,
      customerEmail,
      title,
      description,
      startTime,
      endTime,
      timezone = "Asia/Kolkata",
      googleAccountId,
      calendarId,
      conversationId
    } = req.body;

    if (!customerName || !startTime || !endTime) {
      return res.status(400).json({ error: "Customer Name, Start Time, and End Time are required." });
    }

    const result = await AppointmentService.createAppointment({
      organizationId: orgId,
      conversationId,
      customerPhone,
      customerName,
      customerEmail,
      title,
      description,
      startTime,
      endTime,
      timezone,
      googleAccountId,
      calendarId
    });

    return res.status(201).json({
      success: true,
      appointment: result.appointment
    });
  } catch (error: any) {
    console.error("[APPOINTMENTS CREATE ERROR]", error);
    return res.status(500).json({ error: "Failed to create appointment", details: error.message });
  }
});

// 3. PUT: Reschedule Appointment
router.put("/:id/reschedule", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const id = req.params.id as string;
    const { startTime, endTime, title, description } = req.body;

    const appointment = await AppointmentService.rescheduleAppointment(
      id,
      orgId,
      startTime,
      endTime,
      title,
      description
    );

    return res.status(200).json({ success: true, appointment });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to reschedule appointment", details: error.message });
  }
});

// 4. DELETE: Cancel Appointment
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const id = req.params.id as string;

    await AppointmentService.cancelAppointment(id, orgId);

    return res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to cancel appointment", details: error.message });
  }
});

// 5. POST: Retry Google Sync
router.post("/:id/google-sync", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const id = req.params.id as string;

    let appointment = await (prisma as any).appointment.findFirst({
      where: { id, organizationId: orgId }
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const gResult = await GoogleCalendarService.createCalendarEventWithMeet({
      organizationId: orgId,
      googleAccountId: appointment.googleAccountId || undefined,
      calendarId: appointment.googleCalendarId || undefined,
      title: appointment.title,
      description: appointment.description || "",
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      timezone: appointment.timezone,
      customerEmail: appointment.customerEmail || undefined,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone || undefined
    });

    appointment = await (prisma as any).appointment.update({
      where: { id },
      data: {
        googleCalendarEventId: gResult.eventId,
        googleEventHtmlLink: gResult.htmlLink,
        googleMeetUrl: gResult.meetUrl,
        googleSyncStatus: gResult.syncStatus,
        googleSyncError: null
      }
    });

    return res.status(200).json({ success: true, appointment });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to retry Google sync", details: error.message });
  }
});

export default router;
