"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth/session-context";
import { fetchAssignments } from "@/features/vessel-crews/api";
import type { Assignment } from "@/features/vessel-crews/types";
import {
  attestWorkOrder,
  createWorkOrder,
  fetchWorkOrdersCreatedBy,
  type WorkOrderWithNames,
} from "../api";
import { StatusStamp } from "./status-stamp";

export function CaptainWorkOrdersSection() {
  const { activeUser } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [orders, setOrders] = useState<WorkOrderWithNames[]>([]);
  const [vesselId, setVesselId] = useState("");
  const [crewId, setCrewId] = useState("");
  const [title, setTitle] = useState("");
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captainId = activeUser?.id;

  useEffect(() => {
    if (!captainId) return;
    let cancelled = false;

    setLoading(true);
    Promise.all([fetchAssignments(), fetchWorkOrdersCreatedBy(captainId)])
      .then(([fetchedAssignments, fetchedOrders]) => {
        if (cancelled) return;
        setAssignments(fetchedAssignments);
        setOrders(fetchedOrders);
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
  }, [captainId]);

  if (!captainId) return null;

  const myVessels = assignments.filter((entry) => entry.userId === captainId);
  const crewOnVessel = assignments.filter(
    (entry) => entry.vesselId === vesselId && entry.userRole === "Crew",
  );

  const handleVesselChange = (nextVesselId: string) => {
    setVesselId(nextVesselId);
    setCrewId("");
  };

  const handleAttest = async (workOrderId: string) => {
    if (busyId) return;
    setBusyId(workOrderId);
    setError(null);
    try {
      await attestWorkOrder(workOrderId);
      setOrders(await fetchWorkOrdersCreatedBy(captainId));
    } catch {
      setError("Failed to attest work order.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedIssue = issue.trim();
    if (!trimmedTitle || !trimmedIssue || !vesselId || !crewId || saving) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createWorkOrder({
        creatorUserId: captainId,
        assignedCrewUserId: crewId,
        vesselId,
        title: trimmedTitle,
        issue: trimmedIssue,
      });
      setOrders(await fetchWorkOrdersCreatedBy(captainId));
      setTitle("");
      setIssue("");
      setCrewId("");
    } catch {
      setError("Failed to log work order.");
    } finally {
      setSaving(false);
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
                {vesselId && crewOnVessel.length === 0
                  ? "No crew on this vessel"
                  : "Assign to crew…"}
              </option>
              {crewOnVessel.map((entry) => (
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
                saving || !title.trim() || !issue.trim() || !vesselId || !crewId
              }
            >
              {saving ? "Logging…" : "Log work order"}
            </Button>
          </div>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      <ul className="mt-4 border-t border-rule">
        {loading && (
          <li className="py-2 text-sm italic text-muted">
            Loading work orders…
          </li>
        )}
        {!loading && orders.length === 0 && (
          <li className="py-2 text-sm italic text-muted">
            No work orders logged.
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
                    Attested on{" "}
                    {new Date(order.attested_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    .
                  </p>
                ) : (
                  <div className="mt-2">
                    <Button
                      onClick={() => handleAttest(order.id)}
                      disabled={busyId === order.id}
                    >
                      {busyId === order.id ? "Attesting…" : "Attest & close"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
