"use client";

import { useState } from "react";

export type Mutation<Args extends unknown[]> = {
  /** Runs the write; resolves true on success, false on failure or if busy. */
  run: (...args: Args) => Promise<boolean>;
  busy: boolean;
  /** First argument of the in-flight call (e.g. a row id), for per-row busy states. */
  busyOn: unknown;
  error: string | null;
};

type MutationOptions = {
  onSuccess?: () => void | Promise<void>;
  errorMessage?: string | ((cause: unknown) => string);
};

/**
Declarative writes: wraps an api mutation with busy/error state and an
onSuccess follow-up (typically a query's refetch).
*/
export function useMutation<Args extends unknown[]>(
  mutate: (...args: Args) => Promise<unknown>,
  { onSuccess, errorMessage = "Failed to save." }: MutationOptions = {},
): Mutation<Args> {
  const [busyOn, setBusyOn] = useState<unknown>(undefined);
  const [error, setError] = useState<string | null>(null);
  const busy = busyOn !== undefined;

  const run = async (...args: Args): Promise<boolean> => {
    if (busy) return false;
    setBusyOn(args[0] ?? null);
    setError(null);
    try {
      await mutate(...args);
      await onSuccess?.();
      return true;
    } catch (cause) {
      setError(
        typeof errorMessage === "function" ? errorMessage(cause) : errorMessage,
      );
      return false;
    } finally {
      setBusyOn(undefined);
    }
  };

  return { run, busy, busyOn, error };
}
