"use client";
import React from "react";

type Props = {
  code: string;
  title: string;
  type: "CORE" | "ELECTIVE";
  size?: number; // pixel size of the square icon
};

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickHue(code: string, title: string) {
  const h = hash(code + "|" + title);
  return h % 360;
}

function Glyph({ kind, color }: { kind: string; color: string }) {
  const common = { stroke: color, strokeWidth: 1.75, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "programming":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path {...common} d="M8 7l-4 5 4 5" />
          <path {...common} d="M16 7l4 5-4 5" />
        </svg>
      );
    case "circuits":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <circle cx="6" cy="12" r="2" fill={color} />
          <circle cx="18" cy="12" r="2" fill={color} />
          <path {...common} d="M8 12h8" />
        </svg>
      );
    case "networks":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <circle cx="12" cy="6" r="2" fill={color} />
          <circle cx="6" cy="16" r="2" fill={color} />
          <circle cx="18" cy="16" r="2" fill={color} />
          <path {...common} d="M12 8v4" />
          <path {...common} d="M12 12l-6 4" />
          <path {...common} d="M12 12l6 4" />
        </svg>
      );
    case "robotics":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <rect x="7" y="8" width="10" height="8" rx="2" {...common} />
          <path {...common} d="M9 16v2m6-2v2" />
          <circle cx="11" cy="12" r="1" fill={color} />
          <circle cx="13" cy="12" r="1" fill={color} />
        </svg>
      );
    case "math":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path {...common} d="M6 8h12M6 12h12M6 16h12" />
        </svg>
      );
    case "core":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <circle cx="12" cy="12" r="6" {...common} />
          <path {...common} d="M12 8v4l2 2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <rect x="5" y="6" width="14" height="12" rx="2" {...common} />
          <path {...common} d="M8 10h8" />
          <path {...common} d="M8 14h6" />
        </svg>
      );
  }
}

function keywordKind(title: string, type: "CORE" | "ELECTIVE"): string {
  const t = title.toLowerCase();
  if (/(program|coding|software|data structures|algorithms)/.test(t)) return "programming";
  if (/(circuit|analog|digital|vlsi|systems)/.test(t)) return "circuits";
  if (/(network|security|distributed|communication)/.test(t)) return "networks";
  if (/(robot|control|automation)/.test(t)) return "robotics";
  if (/(math|probabil|algebra|calculus|discrete)/.test(t)) return "math";
  return type === "CORE" ? "core" : "default";
}

export default function CourseIcon({ code, title, type, size = 48 }: Props) {
  const hue = pickHue(code, title);
  const bg = `hsl(${hue} 70% 96%)`;
  const border = `hsl(${hue} 45% 78%)`;
  const fg = `hsl(${hue} 60% 38%)`;
  const kind = keywordKind(title, type);

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: bg,
        border: `1px solid ${border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
      title={title}
    >
      <Glyph kind={kind} color={fg} />
    </div>
  );
}
