import React from "react";

/**
 * WhatsAppChatBackground
 * Ultra high-density WhatsApp official doodle texture.
 * Recreates the full dense WhatsApp wallpaper landscape packed with 80+ iconic motifs,
 * micro-textures, cross-hatches, and precise light theme tones (#efeae2 base with 0.11 opacity).
 */
export const WhatsAppChatBackground: React.FC<{ isInstagram?: boolean }> = ({ isInstagram }) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none z-0 overflow-hidden ${
        isInstagram ? "wa-chat-canvas-instagram" : "wa-chat-canvas"
      }`}
    >
      {/* High-Density Repeating Vector Doodle Pattern */}
      <svg
        className="w-full h-full"
        style={{
          opacity: isInstagram ? 0.09 : 0.11,
          color: isInstagram ? "#701a75" : "#3b332a",
        }}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="wa-dense-official-doodle-grid"
            x="0"
            y="0"
            width="340"
            height="340"
            patternUnits="userSpaceOnUse"
          >
            {/* ROW 1 (y: 0 - 65) */}
            {/* 1. Iconic Whale */}
            <g transform="translate(10, 10) rotate(-6)">
              <path
                d="M36 18c-6-10-20-11-28-5C2 18 1 26 6 31c6 6 20 6 28 2 5-2 10-3 14 1 2-3 2-7-1-10-3-3-8-4-11-5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M9 22c2.5 0 4-1.5 4-3" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <circle cx="10.5" cy="17.5" r="1.1" fill="currentColor" />
              <path d="M18 8c-1.5-3-4-4-6-3M19.5 6c0-4-1.5-5.5-4-6.5M21 8c1.5-3 4-4 6-3" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* 2. Translation Icon (A - 文) */}
            <g transform="translate(95, 12) rotate(4)">
              <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 17l5-9 5 9M10 14h6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* 3. Digital Clock (1:13) */}
            <g transform="translate(145, 15) rotate(-3)">
              <rect x="2" y="2" width="28" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9 6v8M16 6v8M17 6h-2M22 6h3v3h-3v5h3" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="12.5" cy="8.5" r="0.7" fill="currentColor" />
              <circle cx="12.5" cy="11.5" r="0.7" fill="currentColor" />
            </g>

            {/* 4. Tea Cup & Saucer */}
            <g transform="translate(205, 10) rotate(8)">
              <path d="M4 8h17v6a7 7 0 0 1-14 0v-6z" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M21 9.5h3a2.5 2.5 0 0 1 0 5h-3" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <path d="M1 20h23" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M8 3c0 1.5 1.5 2.5 1.5 4M15 3c0 1.5 1.5 2.5 1.5 4" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
            </g>

            {/* 5. Vintage Telephone */}
            <g transform="translate(265, 12) rotate(32)">
              <path
                d="M3 2a2.5 2.5 0 0 1 3-.2l2.2 1.5a2.5 2.5 0 0 1 .7 2.8l-.9 1.5a11 11 0 0 0 5.5 5.5l1.5-.9a2.5 2.5 0 0 1 2.8.7l1.5 2.2a2.5 2.5 0 0 1-.2 3l-2 2a3 3 0 0 1-3.5.6c-4.5-2.2-8.5-6.2-10.7-10.7A3 3 0 0 1 2.2 6.5l2-2z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </g>

            {/* 6. Balloon with string */}
            <g transform="translate(312, 14) rotate(-12)">
              <ellipse cx="9" cy="9" rx="7" ry="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9 18l-1.5 2h3L9 18z" fill="currentColor" />
              <path d="M9 20c-1 3-3 6-5 8" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* ROW 2 (y: 65 - 130) */}
            {/* 7. Speech Bubble 3-dots */}
            <g transform="translate(15, 68) rotate(4)">
              <rect x="1" y="1" width="22" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 15l-3 4v-4h3z" fill="currentColor" />
              <circle cx="7" cy="8" r="1.1" fill="currentColor" />
              <circle cx="12" cy="8" r="1.1" fill="currentColor" />
              <circle cx="17" cy="8" r="1.1" fill="currentColor" />
            </g>

            {/* 8. Sunglasses */}
            <g transform="translate(68, 62) rotate(-8)">
              <path d="M3 6h24M8 6c0 4 3 7 7 7s7-3 7-7M3 6c0 3 2.5 6 5.5 6s5.5-3 5.5-6" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M3 6L1 3M27 6l2-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* 9. Crossword Puzzle Grid (from screenshot!) */}
            <g transform="translate(125, 60) rotate(6)">
              <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 7h20M2 12h20M2 17h20M7 2v20M12 2v20M17 2v20" stroke="currentColor" strokeWidth="0.9" />
              <rect x="7" y="7" width="5" height="5" fill="currentColor" />
              <rect x="17" y="12" width="5" height="5" fill="currentColor" />
            </g>

            {/* 10. Calendar 24 */}
            <g transform="translate(178, 62) rotate(-5)">
              <rect x="2" y="3" width="20" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 8h20M6 1v3M18 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M6 12h3v2H6v2h4M13 12v5m0-2h2.5v2" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* 11. Watermelon Slice */}
            <g transform="translate(230, 65) rotate(-20)">
              <path d="M3 3c11 0 20 9 20 20H3V3z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <circle cx="9" cy="11" r="0.9" fill="currentColor" />
              <circle cx="14" cy="14" r="0.9" fill="currentColor" />
              <circle cx="11" cy="17" r="0.9" fill="currentColor" />
            </g>

            {/* 12. Diya / Oil Lamp (from screenshot!) */}
            <g transform="translate(285, 62) rotate(8)">
              <path d="M4 14c0 5 7 8 13 8s13-3 13-8H4z" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M17 4c-3 3-4 6-4 8h8c0-2-1-5-4-8z" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <path d="M1 14h3M26 14h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* ROW 3 (y: 130 - 195) */}
            {/* 13. Retro Cassette Tape */}
            <g transform="translate(8, 125) rotate(-5)">
              <rect x="2" y="2" width="26" height="17" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="6" y="5" width="18" height="8" rx="1.2" fill="none" stroke="currentColor" strokeWidth="0.9" />
              <circle cx="10" cy="9" r="1.8" fill="none" stroke="currentColor" strokeWidth="0.9" />
              <circle cx="20" cy="9" r="1.8" fill="none" stroke="currentColor" strokeWidth="0.9" />
            </g>

            {/* 14. Paper Airplane */}
            <g transform="translate(65, 120) rotate(22)">
              <path
                d="M2 16l17-7-7 12-3-6L2 16zm7.5-3.5l3.5-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* 15. Gamepad Controller */}
            <g transform="translate(118, 128) rotate(-12)">
              <rect x="2" y="3" width="24" height="14" rx="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6 10h4M8 8v4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="18" cy="8.5" r="1.2" fill="currentColor" />
              <circle cx="21" cy="11.5" r="1.2" fill="currentColor" />
            </g>

            {/* 16. Palm Tree / Island (from screenshot!) */}
            <g transform="translate(175, 120) rotate(6)">
              <path d="M14 26c-1-6 2-12 5-16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M19 10c-5-4-11-2-14 1M19 10c0-6 5-8 9-7M19 10c5 0 9 4 10 9M19 10c-3 5-7 8-12 7" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* 17. Soccer/Football Ball */}
            <g transform="translate(235, 125) rotate(14)">
              <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <polygon points="11,6 14,8.5 12.5,12.5 9.5,12.5 8,8.5" fill="none" stroke="currentColor" strokeWidth="0.9" />
              <path d="M11 6V1.5M14 8.5l4-2M12.5 12.5l3 3M9.5 12.5l-3 3M8 8.5l-4-2" stroke="currentColor" strokeWidth="0.9" />
            </g>

            {/* 18. Cute Cat/Fox Face (from screenshot!) */}
            <g transform="translate(290, 122) rotate(-8)">
              <path d="M3 8l3-6 4 3c3-1 6-1 9 0l4-3 3 6c2 4 1 9-2 12-4 4-11 4-15 0-3-3-4-8-3-12z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <circle cx="9" cy="11" r="1.1" fill="currentColor" />
              <circle cx="18" cy="11" r="1.1" fill="currentColor" />
              <path d="M13.5 13.5l-1 1h2l-1-1z" fill="currentColor" />
              <path d="M6 14h-3M6 16h-3M21 14h3M21 16h3" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
            </g>

            {/* ROW 4 (y: 195 - 260) */}
            {/* 19. Slice of Pizza */}
            <g transform="translate(18, 190) rotate(15)">
              <path d="M2 3l16 18c-6 1.5-11 0-16-3V3z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M2 3c5 3 11 4.5 16 3" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="6" cy="9" r="1" fill="currentColor" />
              <circle cx="10" cy="13" r="1" fill="currentColor" />
            </g>

            {/* 20. Over-ear Headphones */}
            <g transform="translate(70, 185) rotate(-8)">
              <path d="M3 11a10 10 0 0 1 20 0" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="1" y="10" width="4" height="7" rx="2" fill="currentColor" />
              <rect x="21" y="10" width="4" height="7" rx="2" fill="currentColor" />
            </g>

            {/* 21. Lightbulb */}
            <g transform="translate(130, 188) rotate(16)">
              <path
                d="M6 12a6 6 0 1 1 8 0c-.7.7-1 1.6-1 2.8H7c0-1.2-.3-2.1-1-2.8z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path d="M8 17h4m-3 2h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* 22. Potted Cactus */}
            <g transform="translate(185, 185) rotate(-6)">
              <path d="M11 2v13M6 6v5a5 5 0 0 0 5 0M16 8v3a5 5 0 0 1-5 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M5 15h12l-1.5 6H6.5L5 15z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </g>

            {/* 23. Photo Camera */}
            <g transform="translate(240, 190) rotate(10)">
              <rect x="2" y="5" width="20" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <path d="M7 5l1.5-2.5h7L17 5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
              <circle cx="18" cy="8" r="0.8" fill="currentColor" />
            </g>

            {/* 24. Math Calculator % + = (from screenshot!) */}
            <g transform="translate(295, 185) rotate(-10)">
              <rect x="2" y="2" width="18" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="4" y="4" width="14" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="0.9" />
              <circle cx="6" cy="12" r="0.8" fill="currentColor" />
              <circle cx="11" cy="12" r="0.8" fill="currentColor" />
              <circle cx="16" cy="12" r="0.8" fill="currentColor" />
              <circle cx="6" cy="16" r="0.8" fill="currentColor" />
              <circle cx="11" cy="16" r="0.8" fill="currentColor" />
              <circle cx="16" cy="16" r="0.8" fill="currentColor" />
              <path d="M6 20h10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* ROW 5 (y: 260 - 340) */}
            {/* 25. Bicycle / Scooter */}
            <g transform="translate(20, 260) rotate(-4)">
              <circle cx="6" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="22" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <path d="M6 14l5-8h5l6 8M11 6l3 8H6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            </g>

            {/* 26. Microphone */}
            <g transform="translate(85, 265) rotate(14)">
              <rect x="4" y="1" width="6" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 6a5.5 5.5 0 0 0 11 0M7 11v4M4 15h6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* 27. Umbrella */}
            <g transform="translate(140, 260) rotate(-14)">
              <path d="M3 11a9 9 0 0 1 18 0H3z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M12 2v13a2.5 2.5 0 0 1-5 0" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </g>

            {/* 28. Gift Box Ribbon */}
            <g transform="translate(200, 265) rotate(8)">
              <rect x="3" y="6" width="16" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <rect x="1.5" y="4" width="19" height="3" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M11 4v15M3 12h16" stroke="currentColor" strokeWidth="1" />
            </g>

            {/* 29. Planet Saturn with Rings */}
            <g transform="translate(255, 260) rotate(-22)">
              <circle cx="11" cy="11" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <ellipse cx="11" cy="11" rx="11" ry="3" fill="none" stroke="currentColor" strokeWidth="1.1" transform="rotate(-25 11 11)" />
            </g>

            {/* 30. Ice Cream Cone (from screenshot!) */}
            <g transform="translate(305, 260) rotate(16)">
              <circle cx="10" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 8l5 12 5-12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M7 11l4 2M8 15l3 2" stroke="currentColor" strokeWidth="0.8" />
            </g>

            {/* RICH DENSE TEXTURE FILLERS: Micro Doodles, Sparkles, Cross-hatches, Dots */}
            {/* Sparkles / Crosses */}
            <path d="M52 28v-4m-2 2h4M122 35v-4m-2 2h4M185 30v-4m-2 2h4M248 38v-4m-2 2h4M48 95v-4m-2 2h4M108 95v-4m-2 2h4M162 105v-4m-2 2h4M215 100v-4m-2 2h4M272 105v-4m-2 2h4M328 85v-4m-2 2h4M45 160v-4m-2 2h4M98 165v-4m-2 2h4M158 160v-4m-2 2h4M218 165v-4m-2 2h4M275 165v-4m-2 2h4M328 150v-4m-2 2h4M48 230v-4m-2 2h4M112 235v-4m-2 2h4M165 230v-4m-2 2h4M222 235v-4m-2 2h4M278 235v-4m-2 2h4M328 220v-4m-2 2h4M60 305v-4m-2 2h4M118 305v-4m-2 2h4M175 305v-4m-2 2h4M235 305v-4m-2 2h4M290 305v-4m-2 2h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />

            {/* Mini Concentric Circles & Spirals */}
            <circle cx="58" cy="15" r="2.8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="188" cy="15" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="245" cy="15" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="48" cy="78" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="160" cy="78" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="268" cy="80" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="320" cy="50" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="42" cy="145" r="2.8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="102" cy="145" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="218" cy="148" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="272" cy="145" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="52" cy="210" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="112" cy="210" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="168" cy="212" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="225" cy="210" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="282" cy="212" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="55" cy="285" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="120" cy="285" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="178" cy="285" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="238" cy="288" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="288" cy="285" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />

            {/* Wavy Doodles & Lines */}
            <path d="M35 48q2.5-1.5 5 0t5 0M115 48q2.5-1.5 5 0t5 0M180 50q2.5-1.5 5 0t5 0M250 50q2.5-1.5 5 0t5 0M300 48q2.5-1.5 5 0t5 0M30 115q2.5-1.5 5 0t5 0M95 110q2.5-1.5 5 0t5 0M155 115q2.5-1.5 5 0t5 0M215 115q2.5-1.5 5 0t5 0M275 115q2.5-1.5 5 0t5 0M28 178q2.5-1.5 5 0t5 0M88 175q2.5-1.5 5 0t5 0M150 178q2.5-1.5 5 0t5 0M205 175q2.5-1.5 5 0t5 0M265 178q2.5-1.5 5 0t5 0M320 180q2.5-1.5 5 0t5 0M35 245q2.5-1.5 5 0t5 0M95 245q2.5-1.5 5 0t5 0M150 248q2.5-1.5 5 0t5 0M210 245q2.5-1.5 5 0t5 0M268 248q2.5-1.5 5 0t5 0M320 245q2.5-1.5 5 0t5 0M40 325q2.5-1.5 5 0t5 0M100 325q2.5-1.5 5 0t5 0M160 325q2.5-1.5 5 0t5 0M220 325q2.5-1.5 5 0t5 0M275 325q2.5-1.5 5 0t5 0" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />

            {/* Stars & Triangles */}
            <path d="M75 38l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M225 38l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M142 98l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M255 98l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M78 160l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M192 165l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M305 160l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M82 230l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M198 232l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M305 230l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M75 305l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            <path d="M192 308l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="none" stroke="currentColor" strokeWidth="0.9" />

            {/* Dense Micro Dots / Stardust */}
            <circle cx="28" cy="8" r="1" fill="currentColor" />
            <circle cx="82" cy="8" r="0.9" fill="currentColor" />
            <circle cx="138" cy="8" r="1.1" fill="currentColor" />
            <circle cx="195" cy="8" r="0.9" fill="currentColor" />
            <circle cx="255" cy="8" r="1" fill="currentColor" />
            <circle cx="305" cy="8" r="0.9" fill="currentColor" />
            <circle cx="8" cy="55" r="1" fill="currentColor" />
            <circle cx="58" cy="55" r="0.9" fill="currentColor" />
            <circle cx="112" cy="55" r="1" fill="currentColor" />
            <circle cx="168" cy="55" r="0.9" fill="currentColor" />
            <circle cx="225" cy="55" r="1.1" fill="currentColor" />
            <circle cx="278" cy="55" r="0.9" fill="currentColor" />
            <circle cx="335" cy="55" r="1" fill="currentColor" />
            <circle cx="8" cy="120" r="0.9" fill="currentColor" />
            <circle cx="58" cy="120" r="1.1" fill="currentColor" />
            <circle cx="112" cy="120" r="0.9" fill="currentColor" />
            <circle cx="168" cy="120" r="1" fill="currentColor" />
            <circle cx="225" cy="120" r="0.9" fill="currentColor" />
            <circle cx="278" cy="120" r="1.1" fill="currentColor" />
            <circle cx="335" cy="120" r="0.9" fill="currentColor" />
            <circle cx="8" cy="180" r="1.1" fill="currentColor" />
            <circle cx="58" cy="180" r="0.9" fill="currentColor" />
            <circle cx="112" cy="180" r="1" fill="currentColor" />
            <circle cx="168" cy="180" r="0.9" fill="currentColor" />
            <circle cx="225" cy="180" r="1.1" fill="currentColor" />
            <circle cx="278" cy="180" r="0.9" fill="currentColor" />
            <circle cx="335" cy="180" r="1" fill="currentColor" />
            <circle cx="8" cy="250" r="0.9" fill="currentColor" />
            <circle cx="58" cy="250" r="1" fill="currentColor" />
            <circle cx="112" cy="250" r="0.9" fill="currentColor" />
            <circle cx="168" cy="250" r="1.1" fill="currentColor" />
            <circle cx="225" cy="250" r="0.9" fill="currentColor" />
            <circle cx="278" cy="250" r="1" fill="currentColor" />
            <circle cx="335" cy="250" r="0.9" fill="currentColor" />
            <circle cx="18" cy="335" r="1" fill="currentColor" />
            <circle cx="75" cy="335" r="0.9" fill="currentColor" />
            <circle cx="135" cy="335" r="1.1" fill="currentColor" />
            <circle cx="195" cy="335" r="0.9" fill="currentColor" />
            <circle cx="255" cy="335" r="1" fill="currentColor" />
            <circle cx="315" cy="335" r="0.9" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wa-dense-official-doodle-grid)" />
      </svg>
    </div>
  );
};
