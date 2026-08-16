"use client";

import { useCallback, useEffect, useState } from "react";

export type Query<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
Declarative data fetching: runs `fetcher` once per `deps` change and exposes
the result. `refetch` reloads in place (no loading flicker), for use after writes.
*/
export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  errorMessage = "Failed to load.",
): Query<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* The fetcher is keyed by `deps`, not by its identity, so callers can pass
     inline arrow functions without memoizing them. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refetch = useCallback(async () => {
    try {
      setData(await fetcher());
      setError(null);
    } catch {
      setError(errorMessage);
    }
  }, deps);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refetch().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  return { data, loading, error, refetch };
}
