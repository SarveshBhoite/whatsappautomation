"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface CalendarPostItem {
  id: string;
  summary: string;
  date: Date;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";
  author?: string;
  mediaUrl?: string | null;
}

interface ContentCalendarProps {
  posts?: any[];
  scheduledPosts?: any[];
  drafts?: any[];
  onClose?: () => void;
}

export function ContentCalendar({
  posts = [],
  scheduledPosts = [],
  drafts = [],
  onClose
}: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

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
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.getDate());
  };

  // Combine items into calendar items
  const calendarItems: CalendarPostItem[] = [
    ...posts.map((p) => ({
      id: p.id,
      summary: p.summary || "Published LinkedIn Post",
      date: new Date(p.publishedAt || p.createdAt),
      status: "PUBLISHED" as const,
      author: p.author,
      mediaUrl: p.mediaUrl
    })),
    ...scheduledPosts.map((s) => ({
      id: s.id,
      summary: s.summary || "Scheduled LinkedIn Post",
      date: new Date(s.scheduledAt || s.createdAt),
      status: (s.status || "SCHEDULED") as any,
      author: s.author,
      mediaUrl: s.mediaUrl
    })),
    ...drafts.map((d) => ({
      id: d.id,
      summary: d.summary || "Draft Post",
      date: new Date(d.createdAt),
      status: "DRAFT" as const,
      author: d.author,
      mediaUrl: d.mediaUrl
    }))
  ];

  const getItemsForDay = (day: number) => {
    return calendarItems.filter(
      (item) =>
        item.date.getDate() === day &&
        item.date.getMonth() === month &&
        item.date.getFullYear() === year
    );
  };

  const selectedDayItems = selectedDay ? getItemsForDay(selectedDay) : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-900/5 space-y-6 font-sans relative overflow-hidden text-slate-900"
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none rounded-tr-3xl" />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 relative z-10 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200 text-[#0A66C2] rounded-2xl shadow-xs">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
              <span>{monthNames[month]} {year}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0A66C2] border border-blue-200 font-semibold">
                Monthly Schedule
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any date to inspect scheduled posts, drafts, and published content
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-500 border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
              title="Close Calendar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Legend & Stats Pill */}
      <div className="flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2 pt-0.5">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" /> Published ({posts.length})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0A66C2] ring-2 ring-blue-100" /> Scheduled ({scheduledPosts.length})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" /> Drafts ({drafts.length})
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          Total Content Pipeline: {calendarItems.length}
        </span>
      </div>

      {/* Calendar Grid Container with Enhanced Borders */}
      <div className="bg-slate-50/70 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner p-3">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
            <div key={dayName} className={idx === 0 || idx === 6 ? "text-slate-400" : "text-slate-700"}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 gap-2 pt-2.5">
          {/* Empty leading cells */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="bg-slate-100/50 rounded-xl min-h-[85px] border border-dashed border-slate-200"
            />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dayItems = getItemsForDay(day);
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const isSelected = selectedDay === day;

            return (
              <div
                key={`day-${day}`}
                onClick={() => setSelectedDay(day)}
                className={`p-2.5 rounded-xl border-2 min-h-[90px] flex flex-col justify-between cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "border-[#0A66C2] bg-blue-50/70 shadow-md shadow-blue-500/10 scale-[1.02] z-10"
                    : isToday
                    ? "border-blue-300 bg-blue-50/40"
                    : dayItems.length > 0
                    ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    : "border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-extrabold ${
                      isSelected
                        ? "text-[#0A66C2] underline underline-offset-2"
                        : isToday
                        ? "text-[#0A66C2] font-black"
                        : "text-slate-700"
                    }`}
                  >
                    {day}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-[#0A66C2] border border-blue-200 rounded-full">
                      {dayItems.length}
                    </span>
                  )}
                </div>

                {/* Day Dots / Snippet */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold truncate flex items-center gap-1 ${
                        item.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : item.status === "SCHEDULED"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : item.status === "DRAFT"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                      title={item.summary}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          item.status === "PUBLISHED"
                            ? "bg-emerald-500"
                            : item.status === "SCHEDULED"
                            ? "bg-[#0A66C2]"
                            : item.status === "DRAFT"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="truncate">{item.summary}</span>
                    </div>
                  ))}
                  {dayItems.length > 2 && (
                    <div className="text-[9px] text-slate-500 font-bold px-1">
                      +{dayItems.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[#0A66C2]" />
              Scheduled & Created for {monthNames[month]} {selectedDay}, {year}
            </h4>
            <span className="text-xs font-bold text-[#0A66C2] font-mono">
              {selectedDayItems.length} Items Found
            </span>
          </div>

          {selectedDayItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {selectedDayItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 shadow-xs hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          item.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : item.status === "SCHEDULED"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : item.status === "DRAFT"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-red-50 text-red-800 border-red-200"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-3">
              No posts or drafts scheduled for this date.
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
