import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { AppointmentService } from "../services/appointmentService";
import { GoogleCalendarService } from "../services/googleCalendarService";
import { resolveWhatsAppConfig } from "../utils/accountResolver";

const router = Router();

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || (req.query.orgId as string) || "demo-org-123";
};

// 1. GET: List Appointments for Organization with Search, Filters, Pagination & Summary Counts
router.get("/", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const {
      search,
      status,
      googleMeetStatus,
      googleAccountId,
      whatsappConfigId,
      accountId,
      dateFilter,
      startDate,
      endDate,
      page = "1",
      pageSize = "25",
      sortBy = "startTime",
      sortOrder = "asc"
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pageSize as string, 10) || 25));
    const skip = (pageNum - 1) * limit;

    const now = new Date();

    // Timezone bounds calculation (Asia/Kolkata default: UTC+5:30)
    // Create today's start and end in IST
    const nowIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const startOfTodayIST = new Date(nowIST);
    startOfTodayIST.setHours(0, 0, 0, 0);
    const endOfTodayIST = new Date(nowIST);
    endOfTodayIST.setHours(23, 59, 59, 999);

    const startOfTomorrowIST = new Date(startOfTodayIST);
    startOfTomorrowIST.setDate(startOfTomorrowIST.getDate() + 1);
    const endOfTomorrowIST = new Date(endOfTodayIST);
    endOfTomorrowIST.setDate(endOfTomorrowIST.getDate() + 1);

    const startOfWeekIST = new Date(startOfTodayIST);
    startOfWeekIST.setDate(startOfWeekIST.getDate() - startOfWeekIST.getDay());
    const endOfWeekIST = new Date(startOfWeekIST);
    endOfWeekIST.setDate(endOfWeekIST.getDate() + 6);
    endOfWeekIST.setHours(23, 59, 59, 999);

    const next7DaysIST = new Date(startOfTodayIST);
    next7DaysIST.setDate(next7DaysIST.getDate() + 7);
    next7DaysIST.setHours(23, 59, 59, 999);

    // Build Prisma where conditions - strictly organization-scoped
    const where: any = {
      organizationId: orgId
    };

    if (googleAccountId && googleAccountId !== "ALL" && typeof googleAccountId === "string") {
      where.googleAccountId = googleAccountId;
    }

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } }
      ];
    }

    // Status filter
    if (status && status !== "ALL" && typeof status === "string") {
      if (status === "CONFIRMED") {
        where.status = "CONFIRMED";
      } else if (status === "RESCHEDULED") {
        where.status = "RESCHEDULED";
      } else if (status === "CANCELLED") {
        where.status = "CANCELLED";
      } else if (status === "COMPLETED") {
        where.status = "COMPLETED";
      } else if (status === "MISSED") {
        where.status = { notIn: ["CANCELLED", "COMPLETED"] };
        where.endTime = { lt: now };
      } else if (status === "UPCOMING") {
        where.status = { notIn: ["CANCELLED", "COMPLETED"] };
        where.startTime = { gte: now };
      } else if (status === "LIVE") {
        where.status = { notIn: ["CANCELLED", "COMPLETED"] };
        where.startTime = { lte: now };
        where.endTime = { gte: now };
      }
    }

    // Google Meet status filter
    if (googleMeetStatus && googleMeetStatus !== "ALL" && typeof googleMeetStatus === "string") {
      if (googleMeetStatus === "READY") {
        where.googleMeetUrl = { not: null };
        where.googleSyncStatus = "SYNCED";
      } else if (googleMeetStatus === "PENDING") {
        where.googleSyncStatus = "PENDING";
      } else if (googleMeetStatus === "FAILED") {
        where.googleSyncStatus = "FAILED";
      } else if (googleMeetStatus === "AUTH_REQUIRED") {
        where.googleSyncStatus = "AUTH_REQUIRED";
      } else if (googleMeetStatus === "NOT_CREATED") {
        where.googleMeetUrl = null;
        where.googleCalendarEventId = null;
      }
    }

    // Date filters
    if (dateFilter && typeof dateFilter === "string" && dateFilter !== "ALL") {
      if (dateFilter === "today") {
        where.startTime = { gte: startOfTodayIST, lte: endOfTodayIST };
      } else if (dateFilter === "tomorrow") {
        where.startTime = { gte: startOfTomorrowIST, lte: endOfTomorrowIST };
      } else if (dateFilter === "this_week") {
        where.startTime = { gte: startOfWeekIST, lte: endOfWeekIST };
      } else if (dateFilter === "next_7_days") {
        where.startTime = { gte: startOfTodayIST, lte: next7DaysIST };
      } else if (dateFilter === "past") {
        where.endTime = { lt: now };
      } else if (dateFilter === "custom" && startDate && endDate) {
        where.startTime = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }
    }

    // Determine sorting
    let orderBy: any = [];
    if (sortBy === "createdAt") {
      orderBy = [{ createdAt: sortOrder === "asc" ? "asc" : "desc" }];
    } else if (sortBy === "customerName") {
      orderBy = [{ customerName: sortOrder === "asc" ? "asc" : "desc" }];
    } else if (sortBy === "status") {
      orderBy = [{ status: sortOrder === "asc" ? "asc" : "desc" }];
    } else {
      // Default: Sort by startTime descending/ascending
      orderBy = [
        { startTime: sortOrder === "asc" ? "asc" : "desc" },
        { createdAt: "desc" }
      ];
    }

    // Execute queries in parallel
    const [appointments, totalCount, allOrgAppointments] = await Promise.all([
      (prisma as any).appointment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          googleCalendarConfig: {
            select: {
              id: true,
              googleEmail: true,
              calendarName: true,
              selectedCalendarId: true,
              isDefault: true
            }
          },
          whatsappConfig: {
            select: {
              id: true,
              accountName: true,
              phoneNumber: true,
              phoneNumberId: true,
              wabaId: true
            }
          }
        }
      }),
      (prisma as any).appointment.count({ where }),
      (prisma as any).appointment.findMany({
        where: {
          organizationId: orgId,
          ...(googleAccountId && googleAccountId !== "ALL" ? { googleAccountId } : {})
        },
        select: {
          id: true,
          status: true,
          startTime: true,
          endTime: true,
          googleMeetUrl: true,
          googleSyncStatus: true
        }
      })
    ]);

    // Calculate real database KPI summary counts
    let todayCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;
    let missedCount = 0;
    let cancelledCount = 0;
    let meetReadyCount = 0;
    let needsAttentionCount = 0;

    for (const a of allOrgAppointments) {
      const aStart = new Date(a.startTime);
      const aEnd = new Date(a.endTime);

      if (a.status === "CANCELLED") {
        cancelledCount++;
      } else if (a.status === "COMPLETED") {
        completedCount++;
      } else if (now > aEnd) {
        // Missed meeting: past end time and not cancelled/completed
        missedCount++;
      } else if (aStart >= now) {
        upcomingCount++;
      }

      // Check if scheduled for today (IST)
      if (aStart >= startOfTodayIST && aStart <= endOfTodayIST) {
        todayCount++;
      }

      // Google Meet ready status
      if (a.googleMeetUrl && a.googleSyncStatus === "SYNCED") {
        meetReadyCount++;
      }

      // Needs attention
      if (
        a.googleSyncStatus === "FAILED" ||
        a.googleSyncStatus === "AUTH_REQUIRED" ||
        (!a.googleMeetUrl && a.status !== "CANCELLED")
      ) {
        needsAttentionCount++;
      }
    }

    const counts = {
      total: allOrgAppointments.length,
      today: todayCount,
      upcoming: upcomingCount,
      completed: completedCount,
      missed: missedCount,
      cancelled: cancelledCount,
      meetReady: meetReadyCount,
      needsAttention: needsAttentionCount
    };

    return res.status(200).json({
      appointments,
      pagination: {
        page: pageNum,
        pageSize: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1
      },
      counts
    });
  } catch (error: any) {
    console.error("[APPOINTMENTS GET ERROR]", error);
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
