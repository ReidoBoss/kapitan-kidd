"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchUsers } from "./api";
import type { SessionUser } from "./types";

const STORAGE_KEY = "kapitan-kidd.active-user-id";

type SessionContextValue = {
  users: SessionUser[];
  activeUser: SessionUser | null;
  setActiveUser: (user: SessionUser) => void;
  refreshUsers: () => Promise<SessionUser[]>;
  loading: boolean;
  error: string | null;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [activeUser, setActiveUserState] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setActiveUser = useCallback((user: SessionUser) => {
    setActiveUserState(user);
    localStorage.setItem(STORAGE_KEY, user.id);
  }, []);

  const refreshUsers = useCallback(async () => {
    const fetched = await fetchUsers();
    setUsers(fetched);
    return fetched;
  }, []);

  useEffect(() => {
    let cancelled = false;

    refreshUsers()
      .then((fetched) => {
        if (cancelled) return;
        const storedId = localStorage.getItem(STORAGE_KEY);
        const restored = fetched.find((user) => user.id === storedId);
        setActiveUserState(
          restored ??
            fetched.find((user) => user.role === "Admin") ??
            fetched[0] ??
            null,
        );
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load users.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshUsers]);

  return (
    <SessionContext
      value={{ users, activeUser, setActiveUser, refreshUsers, loading, error }}
    >
      {children}
    </SessionContext>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
