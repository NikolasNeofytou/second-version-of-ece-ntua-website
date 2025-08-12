"use client";
import { useState } from "react";

export default function VerifyProfileAccess({ userId }: { userId: string }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "fail" | "loading">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/profile/view-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("ok");
        // Trigger reload so server can see cookie and render content
        window.location.reload();
      } else {
        setStatus("fail");
      }
    } catch {
      setStatus("fail");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          aria-label="Profile password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-2 py-1.5 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-xs"
          placeholder="Profile password"
        />
        <button type="submit" className="btn-primary text-xs" disabled={status === "loading"}>
          {status === "loading" ? "Verifying…" : "Verify"}
        </button>
      </div>
      {status === "fail" && (
        <p className="text-[10px] text-[var(--color-error)]">Incorrect password. Try again.</p>
      )}
    </form>
  );
}
