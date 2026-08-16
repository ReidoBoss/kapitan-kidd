"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LedgerList } from "@/components/ui/ledger-list";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth/session-context";
import { useMutation } from "@/lib/hooks/use-mutation";
import { useQuery } from "@/lib/hooks/use-query";
import {
  completeWorkOrder,
  fetchWorkOrdersAssignedTo,
  startWorkOrder,
  type WorkOrderWithNames,
} from "../api";
import { StatusStamp } from "./status-stamp";

export function CrewWorkOrdersSection() {
  const { activeUser } = useSession();
  const crewId = activeUser?.id ?? null;

  const ordersQuery = useQuery(
    () =>
      crewId
        ? fetchWorkOrdersAssignedTo(crewId)
        : Promise.resolve<WorkOrderWithNames[]>([]),
    [crewId],
    "Failed to load work orders.",
  );
  const start = useMutation(startWorkOrder, {
    onSuccess: ordersQuery.refetch,
    errorMessage: "Failed to update work order.",
  });
  const complete = useMutation(completeWorkOrder, {
    onSuccess: ordersQuery.refetch,
    errorMessage: "Failed to update work order.",
  });

  if (!crewId) return null;

  const error = ordersQuery.error ?? start.error ?? complete.error;

  return (
    <section className="mt-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
        My Work Orders
      </p>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      <LedgerList
        items={ordersQuery.data ?? []}
        getKey={(order) => order.id}
        loading={ordersQuery.loading}
        loadingText="Loading work orders…"
        emptyText="No work orders assigned to you."
        className="mt-2 border-t border-rule"
        rowClassName="py-3"
        renderItem={(order) => (
          <CrewOrderEntry
            order={order}
            busy={start.busyOn === order.id || complete.busyOn === order.id}
            onStart={() => start.run(order.id)}
            onComplete={(solution) => complete.run(order.id, solution)}
          />
        )}
      />
    </section>
  );
}

function CrewOrderEntry({
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
    <>
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
    </>
  );
}
