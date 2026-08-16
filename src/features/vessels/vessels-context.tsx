"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@/lib/hooks/use-query";
import { fetchVessels } from "./api";
import type { Vessel } from "./types";

type VesselsContextValue = {
  vessels: Vessel[];
  loading: boolean;
  error: string | null;
  refreshVessels: () => Promise<void>;
};

const VesselsContext = createContext<VesselsContextValue | null>(null);

export function VesselsProvider({ children }: { children: ReactNode }) {
  const query = useQuery(fetchVessels, [], "Failed to load vessels.");

  return (
    <VesselsContext
      value={{
        vessels: query.data ?? [],
        loading: query.loading,
        error: query.error,
        refreshVessels: query.refetch,
      }}
    >
      {children}
    </VesselsContext>
  );
}

export function useVessels() {
  const context = useContext(VesselsContext);
  if (!context) {
    throw new Error("useVessels must be used within a VesselsProvider");
  }
  return context;
}
