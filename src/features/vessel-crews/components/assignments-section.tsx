"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useSession } from "@/features/auth/session-context";
import { useVessels } from "@/features/vessels/vessels-context";
import { assignCrew, fetchAssignments, unassignCrew } from "../api";
import type { Assignment } from "../types";

const roleRank = (role: string) => (role === "Captain" ? 0 : 1);

export function AssignmentsSection() {
  const { users } = useSession();
  const { vessels } = useVessels();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userId, setUserId] = useState("");
  const [vesselId, setVesselId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignable = users.filter((user) => user.role !== "Admin");
  const unassigned = assignable.filter(
    (user) => !assignments.some((entry) => entry.userId === user.id),
  );

  useEffect(() => {
    let cancelled = false;

    fetchAssignments()
      .then((fetched) => {
        if (!cancelled) setAssignments(fetched);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load assignments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAssign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !vesselId || saving) return;

    setSaving(true);
    setError(null);
    try {
      await assignCrew(userId, vesselId);
      setAssignments(await fetchAssignments());
      setUserId("");
    } catch (cause) {
      setError(
        (cause as { code?: string }).code === "23505"
          ? "That member is already assigned to this vessel."
          : "Failed to assign member.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    setError(null);
    try {
      await unassignCrew(assignmentId);
      setAssignments((current) =>
        current.filter((entry) => entry.id !== assignmentId),
      );
    } catch {
      setError("Failed to remove assignment.");
    }
  };

  return (
    <section className="mt-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
        Muster Roll
      </p>

      <form
        onSubmit={handleAssign}
        className="mt-2 flex flex-wrap items-center gap-2"
      >
        <Select
          value={userId}
          aria-label="Member"
          onChange={(event) => setUserId(event.target.value)}
        >
          <option value="">Select member…</option>
          {assignable.map((user) => (
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
        <Button type="submit" disabled={saving || !userId || !vesselId}>
          {saving ? "Assigning…" : "Assign to vessel"}
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}

      {loading ? (
        <p className="mt-4 text-sm italic text-muted">Loading assignments…</p>
      ) : (
        <div className="mt-4 space-y-6">
          {vessels.map((vessel) => {
            const crew = assignments
              .filter((entry) => entry.vesselId === vessel.id)
              .sort(
                (a, b) =>
                  roleRank(a.userRole) - roleRank(b.userRole) ||
                  a.userName.localeCompare(b.userName),
              );

            return (
              <div key={vessel.id}>
                <h3 className="border-b border-rule pb-1 text-lg font-bold">
                  {vessel.name}
                </h3>
                <ul>
                  {crew.length === 0 && (
                    <li className="py-2 text-sm italic text-muted">
                      No members assigned.
                    </li>
                  )}
                  {crew.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-baseline justify-between gap-4 border-b border-rule py-2"
                    >
                      <span>{entry.userName}</span>
                      <span className="flex items-baseline gap-3">
                        <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                          {entry.userRole}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnassign(entry.id)}
                          aria-label={`Unassign ${entry.userName} from ${entry.vesselName}`}
                          className="text-sm text-accent hover:underline"
                        >
                          Remove
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {unassigned.length > 0 && (
            <div>
              <h3 className="border-b border-rule pb-1 text-lg font-bold italic">
                Awaiting assignment
              </h3>
              <ul>
                {unassigned.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-baseline justify-between gap-4 border-b border-rule py-2"
                  >
                    <span>{user.name}</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                      {user.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
