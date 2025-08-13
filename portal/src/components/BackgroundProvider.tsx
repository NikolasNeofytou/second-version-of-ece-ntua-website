"use client";
import { createContext, useContext, useMemo } from "react";

type Variant = "subtle" | "vivid";

const BgCtx = createContext<Variant>("vivid");

export function BackgroundProvider({ variant = "vivid", children }: { variant?: Variant; children: React.ReactNode }) {
  const value = useMemo(() => variant, [variant]);
  return <BgCtx.Provider value={value}>{children}</BgCtx.Provider>;
}

export function useBackgroundVariant() { return useContext(BgCtx); }
