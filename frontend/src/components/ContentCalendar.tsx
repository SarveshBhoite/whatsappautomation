"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface CalendarPostItem {
  id: string;
  summary: string;
  date: Date;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";
}

interface ContentCalendarProps {
  posts: any[];
  scheduledPosts: any[];
  drafts: any[];
}

export function ContentCalendar({ posts = [], scheduledPosts = [], drafts = [] }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Combine items into calendar items
  const calendarItems: CalendarPostItem[] = [
    ...posts.map((p) => ({ id: p.id, summary: p.summary, date: new Date(p.publishedAt), status: "PUBLISHED" as const })),
    ...scheduledPosts.map((s) => ({ id: s.id, summary: s.summary, date: new Date(s.scheduledAt || s.createdAt), status: (s.status || "SCHEDULED") as any })),
    ...drafts.map((d) => ({ id: d.id, summary: d.summary, date: new Date(d.createdAt), status: "DRAFT" as const }))
  ];

  const getItemsForDay = (day: number) => {
    return calendarItems.filter(
      (item) =>
        item.date.getDate() === day &&
        item.date.getMonth() === month &&
        item.date.getFullYear() === year
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 font-sans relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
            Content Calendar – {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Days Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1.5 text-xs">
        {/* Empty leading cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} className="bg-slate-950/40 rounded-xl min-h-[70px]" />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const dayItems = getItemsForDay(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={`day-${day}`}
              className={`bg-slate-950 p-2 rounded-xl border min-h-[75px] flex flex-col justify-between ${
                isToday ? "border-blue-500/80 bg-blue-950/20" : "border-slate-850"
              }`}
            >
              <span className={`text-[11px] font-bold ${isToday ? "text-blue-400" : "text-slate-400"}`}>{day}</span>

              <div className="space-y-1 overflow-y-auto max-h-[50px]">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-1 rounded text-[10px] font-semibold truncate ${
                      item.status === "PUBLISHED"
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                        : item.status === "SCHEDULED"
                        ? "bg-blue-950/80 text-blue-400 border border-blue-800/60"
                        : item.status === "DRAFT"
                        ? "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                        : "bg-red-950/80 text-red-400 border border-red-800/60"
                    }`}
                    title={item.summary}
                  >
                    {item.summary}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
