"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/features/auth/session-context";
import {
  fetchWorkOrdersAssignedTo,
  type WorkOrderWithNames,
} from "../api";
import { StatusStamp } from "./status-stamp";

export function CrewWorkOrdersSection() {
  const { activeUser } = useSession();
  const [orders, setOrders] = useState<WorkOrderWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const crewId = activeUser?.id;

  useEffect(() => {
    if (!crewId) return;
    let cancelled = false;

    setLoading(true);
    fetchWorkOrdersAssignedTo(crewId)
      .then((fetched) => {
        if (!cancelled) setOrders(fetched);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load work orders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [crewId]);

  if (!crewId) return null;

  return (
    <section className="mt-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
        My Work Orders
      </p>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      <ul className="mt-2 border-t border-rule">
        {loading && (
          <li className="py-2 text-sm italic text-muted">
            Loading work orders…
          </li>
        )}
        {!loading && !error && orders.length === 0 && (
          <li className="py-2 text-sm italic text-muted">
            No work orders assigned to you.
          </li>
        )}
        {orders.map((order) => (
          <li key={order.id} className="border-b border-rule py-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-xs text-muted">
                WO-{order.id.slice(0, 8)}
              </span>
              <StatusStamp status={order.status} />
            </div>
            <p className="text-lg font-bold">{order.title}</p>
            <p className="text-sm text-muted">
              {order.vesselName} &middot; ordered by {order.creatorName}
            </p>
            <p className="mt-1 text-sm">{order.issue}</p>
            {order.solution && (
              <p className="mt-1 text-sm">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Solution&nbsp;
                </span>
                {order.solution}
              </p>
            )}
            {order.rejection_reason && (
              <p className="mt-1 text-sm text-accent">
                <span className="text-[11px] uppercase tracking-[0.2em]">
                  Rejected&nbsp;
                </span>
                {order.rejection_reason}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
