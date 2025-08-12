"use client";
import React from "react";

export default function EnhancedBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
  background: "linear-gradient(120deg, var(--color-surface) 0%, var(--color-surface-alt) 65%, var(--color-surface) 100%)",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Glassmorphism panels */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "30vw",
        height: "30vh",
  background: "rgba(255,255,255,0.05)",
        borderRadius: "2rem",
  boxShadow: "0 6px 24px 0 rgba(31, 38, 135, 0.2)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.12)",
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "8%",
        width: "24vw",
        height: "24vh",
  background: "rgba(255,255,255,0.06)",
        borderRadius: "1.5rem",
  boxShadow: "0 6px 20px 0 rgba(31, 38, 135, 0.18)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.1)",
      }} />
      {/* Bold accent card */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "320px",
        height: "120px",
  background: "var(--color-accent)",
        borderRadius: "1.5rem",
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.12)",
  opacity: 0.08,
      }} />
      {/* Animated accent wave */}
      <svg
        width="100%"
        height="240"
        viewBox="0 0 1440 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
  style={{ position: "absolute", bottom: 0, left: 0, opacity: 0.12, pointerEvents: "none" }}
      >
        <path>
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="M0,160 Q360,80 720,160 T1440,160; M0,180 Q360,120 720,180 T1440,180; M0,160 Q360,80 720,160 T1440,160"
          />
        </path>
  <path d="M0,160 Q360,80 720,160 T1440,160" stroke="var(--color-accent)" strokeOpacity="0.5" strokeWidth="4" fill="none" />
      </svg>
    </div>
  );
}
