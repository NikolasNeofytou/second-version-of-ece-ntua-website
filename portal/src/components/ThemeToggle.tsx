"use client";
import { useEffect, useState } from "react";

// Simple theme toggle: toggles data-theme attr between dark/light.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
      className="btn-primary text-sm"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
