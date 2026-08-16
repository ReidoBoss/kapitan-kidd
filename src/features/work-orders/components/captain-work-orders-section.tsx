"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LedgerList } from "@/components/ui/ledger-list";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth/session-context";
import { fetchAssignments } from "@/features/vessel-crews/api";
import {
  crewOnVessel,
  vesselsCommandedBy,
} from "@/features/vessel-crews/derive";
import { useMutation } from "@/lib/hooks/use-mutation";
import { useQuery } from "@/lib/hooks/use-query";
import {
  attestWorkOrder,
  createWorkOrder,
  fetchWorkOrdersCreatedBy,
  rejectWorkOrder,
  type WorkOrderWithNames,
} from "../api";
import { StatusStamp } from "./status-stamp";

const attestedOn = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function CaptainWorkOrdersSection() {
  const { activeUser } = useSession();
  const captainId = activeUser?.id ?? null;

  const assignmentsQuery = useQuery(
    fetchAssignments,
    [],
    "Failed to load assignments.",
  );
  const ordersQuery = useQuery(
    () =>
      captainId
        ? fetchWorkOrdersCreatedBy(captainId)
        : Promise.resolve<WorkOrderWithNames[]>([]),
    [captainId],
    "Failed to load work orders.",
  );

  const [vesselId, setVesselId] = useState("");
  const [crewId, setCrewId] = useState("");
  const [title, setTitle] = useState("");
  const [issue, setIssue] = useState("");

  const logOrder = useMutation(createWorkOrder, {
    onSuccess: ordersQuery.refetch,
    errorMessage: "Failed to log work order.",
  });
  const attest = useMutation(attestWorkOrder, {
    onSuccess: ordersQuery.refetch,
    errorMessage: "Failed to attest work order.",
  });
  const reject = useMutation(rejectWorkOrder, {
    onSuccess: ordersQuery.refetch,
    errorMessage: "Failed to reject work order.",
  });

  if (!captainId) return null;

  const assignments = assignmentsQuery.data ?? [];
  const myVessels = vesselsCommandedBy(assignments, captainId);
  const crew = crewOnVessel(assignments, vesselId);
  const loading = assignmentsQuery.loading || ordersQuery.loading;
  const error =
    assignmentsQuery.error ??
    ordersQuery.error ??
    logOrder.error ??
    attest.error ??
    reject.error;

  const handleVesselChange = (nextVesselId: string) => {
    setVesselId(nextVesselId);
    setCrewId("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedIssue = issue.trim();
    if (!trimmedTitle || !trimmedIssue || !vesselId || !crewId) return;

    const logged = await logOrder.run({
      creatorUserId: captainId,
      assignedCrewUserId: crewId,
      vesselId,
      title: trimmedTitle,
      issue: trimmedIssue,
    });
    if (logged) {
      setTitle("");
      setIssue("");
      setCrewId("");
    }
  };

  return (
    <section className="mt-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
        Work Orders &middot; New Entry
      </p>

      {!loading && myVessels.length === 0 ? (
        <p className="mt-2 text-sm italic text-muted">
          You have no vessel under your command. Ask the Admin for an
          assignment.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={vesselId}
              aria-label="Vessel"
              disabled={loading}
              onChange={(event) => handleVesselChange(event.target.value)}
            >
              <option value="">Select vessel…</option>
              {myVessels.map((entry) => (
                <option key={entry.vesselId} value={entry.vesselId}>
                  {entry.vesselName}
                </option>
              ))}
            </Select>
            <Select
              value={crewId}
              aria-label="Assign to crew member"
              disabled={!vesselId}
              onChange={(event) => setCrewId(event.target.value)}
            >
              <option value="">
                {vesselId && crew.length === 0
                  ? "No crew on this vessel"
                  : "Assign to crew…"}
              </option>
              {crew.map((entry) => (
                <option key={entry.userId} value={entry.userId}>
                  {entry.userName}
                </option>
              ))}
            </Select>
          </div>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title, e.g. Engine coolant leak"
            aria-label="Title"
            maxLength={200}
            className="w-full sm:w-96"
          />
          <Textarea
            value={issue}
            onChange={(event) => setIssue(event.target.value)}
            placeholder="Describe the issue…"
            aria-label="Issue"
            className="w-full sm:w-96"
          />
          <div>
            <Button
              type="submit"
              disabled={
                logOrder.busy ||
                !title.trim() ||
                !issue.trim() ||
                !vesselId ||
                !crewId
              }
            >
              {logOrder.busy ? "Logging…" : "Log work order"}
            </Button>
          </div>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      <LedgerList
        items={ordersQuery.data ?? []}
        getKey={(order) => order.id}
        loading={loading}
        loadingText="Loading work orders…"
        emptyText="No work orders logged."
        rowClassName="py-3"
        renderItem={(order) => (
          <CaptainOrderEntry
            order={order}
            busy={attest.busyOn === order.id || reject.busyOn === order.id}
            onAttest={() => attest.run(order.id)}
            onReject={(reason) => reject.run(order.id, reason)}
          />
        )}
      />
    </section>
  );
}

function CaptainOrderEntry({
  order,
  busy,
  onAttest,
  onReject,
}: {
  order: WorkOrderWithNames;
  busy: boolean;
  onAttest: () => void;
  onReject: (reason: string) => void;
}) {
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
        {order.vesselName} &middot; assigned to {order.crewName}
      </p>

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
          {order.attested_at ? (
            <p className="italic text-done">
              Attested on {attestedOn(order.attested_at)}.
            </p>
          ) : (
            <ReviewControls busy={busy} onAttest={onAttest} onReject={onReject} />
          )}
        </div>
      )}
    </>
  );
}

function ReviewControls({
  busy,
  onAttest,
  onReject,
}: {
  busy: boolean;
  onAttest: () => void;
  onReject: (reason: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (!rejecting) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button onClick={onAttest} disabled={busy}>
          {busy ? "Attesting…" : "Attest & close"}
        </Button>
        <Button
          onClick={() => setRejecting(true)}
          disabled={busy}
          className="border-accent text-accent hover:bg-accent/5"
        >
          Reject…
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <Textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Rejection reason (required)…"
        aria-label="Rejection reason"
        className="w-full sm:w-96"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => onReject(reason.trim())}
          disabled={busy || !reason.trim()}
          className="border-accent text-accent hover:bg-accent/5"
        >
          {busy ? "Rejecting…" : "Send back to crew"}
        </Button>
        <Button onClick={() => setRejecting(false)} disabled={busy}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
