"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does Jisnu CRM connect to my WhatsApp Business account?",
    answer:
      "Jisnu CRM integrates directly with the official Meta WhatsApp Cloud API via Embedded Signup. You can link your phone number in minutes, retain your green verification checkmark if applicable, and avoid account bans associated with unofficial scrapers.",
  },
  {
    question: "Is connecting my Google Ads and Google Business accounts secure?",
    answer:
      "Yes. We use Google's official OAuth 2.0 protocol. Jisnu CRM never accesses or stores your Google password. You have full granular control and can revoke access anytime directly from your Google Security settings or within our dashboard.",
  },
  {
    question: "Can I customize the AI replies for customer reviews and WhatsApp chats?",
    answer:
      "Absolutely. You can provide your business tone of voice (e.g. professional, friendly, luxury), upload custom FAQs or service details, and configure auto-approval rules so you can review AI drafts before they are sent.",
  },
  {
    question: "Do I need technical skills or a developer to set up automations?",
    answer:
      "No developer needed! Jisnu CRM features intuitive visual builders for WhatsApp template broadcasting, automated triggers for ad leads, and 1-click review management.",
  },
  {
    question: "Can multiple team members use the CRM simultaneously?",
    answer:
      "Yes. Jisnu CRM includes multi-agent live chat support, role-based access control (Admin, Manager, Agent), and real-time collaboration so your entire sales and support team stays in sync.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "bg-white border-slate-300 shadow-md shadow-slate-100"
                : "bg-white/70 border-slate-200/80 hover:border-slate-300 hover:bg-white"
            }`}
          >
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 focus:outline-none"
            >
              <span className="text-base flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4 text-brand-blue shrink-0" />
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-brand-blue" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1 animate-fadeIn">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
