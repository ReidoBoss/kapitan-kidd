"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth/session-context";
import {
  completeWorkOrder,
  fetchWorkOrdersAssignedTo,
  startWorkOrder,
  type WorkOrderWithNames,
} from "../api";
import { StatusStamp } from "./status-stamp";

export function CrewWorkOrdersSection() {
  const { activeUser } = useSession();
  const [orders, setOrders] = useState<WorkOrderWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
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

  const runAction = async (orderId: string, action: () => Promise<void>) => {
    if (busyId) return;
    setBusyId(orderId);
    setError(null);
    try {
      await action();
      setOrders(await fetchWorkOrdersAssignedTo(crewId));
    } catch {
      setError("Failed to update work order.");
    } finally {
      setBusyId(null);
    }
  };

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
          <CrewOrderItem
            key={order.id}
            order={order}
            busy={busyId === order.id}
            onStart={() => runAction(order.id, () => startWorkOrder(order.id))}
            onComplete={(solution) =>
              runAction(order.id, () => completeWorkOrder(order.id, solution))
            }
          />
        ))}
      </ul>
    </section>
  );
}

function CrewOrderItem({
  order,
  busy,
  onStart,
  onComplete,
}: {
  order: WorkOrderWithNames;
  busy: boolean;
  onStart: () => void;
  onComplete: (solution: string) => void;
}) {
  const [solution, setSolution] = useState(order.solution ?? "");

  return (
    <li className="border-b border-rule py-3">
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

      {order.rejection_reason && order.status !== "Done" && (
        <p className="mt-1 text-sm text-accent">
          <span className="text-[11px] uppercase tracking-[0.2em]">
            Rejected&nbsp;
          </span>
          {order.rejection_reason}
        </p>
      )}

      {order.status === "Open" && (
        <div className="mt-2">
          <Button onClick={onStart} disabled={busy}>
            {busy ? "Starting…" : "Start work"}
          </Button>
        </div>
      )}

      {order.status === "In Progress" && (
        <div className="mt-2 flex flex-col gap-2">
          <Textarea
            value={solution}
            onChange={(event) => setSolution(event.target.value)}
            placeholder="Document the solution…"
            aria-label={`Solution for ${order.title}`}
            className="w-full sm:w-96"
          />
          <div>
            <Button
              onClick={() => onComplete(solution.trim())}
              disabled={busy || !solution.trim()}
            >
              {busy ? "Submitting…" : "Mark as Done"}
            </Button>
          </div>
        </div>
      )}

      {order.status === "Done" && (
        <div className="mt-1 text-sm">
          {order.solution && (
            <p>
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                Solution&nbsp;
              </span>
              {order.solution}
            </p>
          )}
          <p className="italic text-muted">
            {order.attested_at
              ? "Attested by the captain."
              : "Awaiting the captain's review."}
          </p>
        </div>
      )}
    </li>
  );
}
