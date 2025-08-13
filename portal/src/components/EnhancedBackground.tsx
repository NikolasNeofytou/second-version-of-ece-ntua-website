"use client";
import React, { useEffect, useState } from "react";
import { useBackgroundVariant } from "./BackgroundProvider";

export default function EnhancedBackground() {
  const variant = useBackgroundVariant?.() ?? "vivid";
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    } catch {
      /* noop */
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(59,130,246,0.08), transparent 60%)," +
          "radial-gradient(900px 500px at 90% 80%, rgba(224,73,62,0.06), transparent 65%)," +
          "linear-gradient(120deg, var(--color-bg) 0%, var(--color-bg-alt) 60%, var(--color-bg) 100%)",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Subtle circuit grid */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
  style={{ position: "absolute", inset: 0, opacity: variant === "subtle" ? 0.07 : 0.12 }}
      >
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="var(--color-border)" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Electric traces and waves */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="spark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Static reference path for spark motion (gentle sine near bottom) */}
        <path
          id="waveRef"
          d="M0,680 C240,620 480,740 720,680 C960,620 1200,740 1440,680"
          fill="none"
          stroke="transparent"
        />

        {/* Main dynamic wave with glow */}
        <path
          d="M0,660 Q360,600 720,660 T1440,660"
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity={variant === "subtle" ? 0.22 : 0.35}
          strokeWidth={variant === "subtle" ? 2 : 3}
          filter="url(#glow)"
        >
          {!reduced && (
            <animate
              attributeName="d"
              dur={variant === "subtle" ? "12s" : "9s"}
              repeatCount="indefinite"
              values={variant === "subtle"
                ? "M0,660 Q360,610 720,660 T1440,660; M0,680 Q360,630 720,680 T1440,680; M0,660 Q360,610 720,660 T1440,660"
                : "M0,660 Q360,600 720,660 T1440,660; M0,690 Q360,630 720,690 T1440,690; M0,660 Q360,600 720,660 T1440,660"}
            />
          )}
        </path>

        {/* Secondary wave (phase shifted) */}
        <path
          d="M0,700 Q360,640 720,700 T1440,700"
          fill="none"
          stroke="var(--color-info)"
          strokeOpacity={variant === "subtle" ? 0.12 : 0.18}
          strokeWidth={variant === "subtle" ? 1.5 : 2}
        >
          {!reduced && (
            <animate
              attributeName="d"
              dur={variant === "subtle" ? "14s" : "10s"}
              repeatCount="indefinite"
              values={variant === "subtle"
                ? "M0,700 Q360,650 720,700 T1440,700; M0,720 Q360,670 720,720 T1440,720; M0,700 Q360,650 720,700 T1440,700"
                : "M0,700 Q360,640 720,700 T1440,700; M0,730 Q360,670 720,730 T1440,730; M0,700 Q360,640 720,700 T1440,700"}
            />
          )}
        </path>

        {/* Sparks traveling along the reference wave */}
  {!reduced && variant !== "subtle" && (
          <g opacity="0.6">
            <circle r="6" fill="url(#spark)">
              <animateMotion dur="8s" repeatCount="indefinite">
                <mpath href="#waveRef" />
              </animateMotion>
            </circle>
            <circle r="5" fill="url(#spark)">
              <animateMotion dur="10s" begin="-2s" repeatCount="indefinite">
                <mpath href="#waveRef" />
              </animateMotion>
            </circle>
            <circle r="4" fill="url(#spark)">
              <animateMotion dur="12s" begin="-5s" repeatCount="indefinite">
                <mpath href="#waveRef" />
              </animateMotion>
            </circle>
          </g>
        )}

        {/* Circuit nodes (pulsing) */}
        {[{ x: 180, y: 220 }, { x: 420, y: 140 }, { x: 980, y: 260 }, { x: 1240, y: 180 }].map((n, i) => (
          <g key={i} opacity={0.28}>
            <circle cx={n.x} cy={n.y} r={2.5} fill="var(--color-accent)" />
            {!reduced && (
              <circle cx={n.x} cy={n.y} r={8} fill="var(--color-accent)" opacity={0.25} filter="url(#glow)">
                <animate attributeName="r" values="6;10;6" dur="3.5s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
