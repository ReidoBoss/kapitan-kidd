"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { LedgerList } from "@/components/ui/ledger-list";
import { Select } from "@/components/ui/select";
import { useSession } from "@/features/auth/session-context";
import { useVessels } from "@/features/vessels/vessels-context";
import { useMutation } from "@/lib/hooks/use-mutation";
import { useQuery } from "@/lib/hooks/use-query";
import { assignCrew, fetchAssignments, unassignCrew } from "../api";
import {
  assignableMembers,
  rosterOfVessel,
  unassignedMembers,
} from "../derive";

const assignErrorMessage = (cause: unknown) =>
  (cause as { code?: string }).code === "23505"
    ? "That member is already assigned to this vessel."
    : "Failed to assign member.";

export function AssignmentsSection() {
  const { users } = useSession();
  const { vessels } = useVessels();
  const assignmentsQuery = useQuery(
    fetchAssignments,
    [],
    "Failed to load assignments.",
  );
  const assignments = assignmentsQuery.data ?? [];

  const [userId, setUserId] = useState("");
  const [vesselId, setVesselId] = useState("");

  const assign = useMutation(assignCrew, {
    onSuccess: assignmentsQuery.refetch,
    errorMessage: assignErrorMessage,
  });
  const unassign = useMutation(unassignCrew, {
    onSuccess: assignmentsQuery.refetch,
    errorMessage: "Failed to remove assignment.",
  });

  const members = assignableMembers(users);
  const unassigned = unassignedMembers(users, assignments);
  const error = assignmentsQuery.error ?? assign.error ?? unassign.error;

  const handleAssign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (userId && vesselId && (await assign.run(userId, vesselId))) {
      setUserId("");
    }
  };

  return (
    <section className="mt-4">
      <form
        onSubmit={handleAssign}
        className="flex flex-wrap items-center gap-2"
      >
        <Select
          value={userId}
          aria-label="Member"
          onChange={(event) => setUserId(event.target.value)}
        >
          <option value="">Select member…</option>
          {members.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </Select>
        <Select
          value={vesselId}
          aria-label="Vessel"
          onChange={(event) => setVesselId(event.target.value)}
        >
          <option value="">Select vessel…</option>
          {vessels.map((vessel) => (
            <option key={vessel.id} value={vessel.id}>
              {vessel.name}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={assign.busy || !userId || !vesselId}>
          {assign.busy ? "Assigning…" : "Assign to vessel"}
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      {assignmentsQuery.loading ? (
        <p className="mt-4 text-sm italic text-muted">Loading assignments…</p>
      ) : (
        <div className="mt-4 space-y-6">
          {vessels.map((vessel) => (
            <div key={vessel.id}>
              <h3 className="border-b border-rule pb-1 text-lg font-bold">
                {vessel.name}
              </h3>
              <LedgerList
                items={rosterOfVessel(assignments, vessel.id)}
                getKey={(entry) => entry.id}
                emptyText="No members assigned."
                className=""
                renderItem={(entry) => (
                  <div className="flex items-baseline justify-between gap-4">
                    <span>{entry.userName}</span>
                    <span className="flex items-baseline gap-3">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                        {entry.userRole}
                      </span>
                      <button
                        type="button"
                        onClick={() => unassign.run(entry.id)}
                        aria-label={`Unassign ${entry.userName} from ${entry.vesselName}`}
                        className="text-sm text-accent hover:underline"
                      >
                        Remove
                      </button>
                    </span>
                  </div>
                )}
              />
            </div>
          ))}

          {unassigned.length > 0 && (
            <div>
              <h3 className="border-b border-rule pb-1 text-lg font-bold italic">
                Awaiting assignment
              </h3>
              <LedgerList
                items={unassigned}
                getKey={(user) => user.id}
                emptyText="None."
                className=""
                renderItem={(user) => (
                  <div className="flex items-baseline justify-between gap-4">
                    <span>{user.name}</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                      {user.role}
                    </span>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
