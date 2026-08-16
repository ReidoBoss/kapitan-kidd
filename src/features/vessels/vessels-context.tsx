"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
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
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshVessels = useCallback(async () => {
    try {
      setVessels(await fetchVessels());
      setError(null);
    } catch {
      setError("Failed to load vessels.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshVessels();
  }, [refreshVessels]);

  return (
    <VesselsContext
      value={{ vessels, loading, error, refreshVessels }}
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
