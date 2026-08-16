import type { SessionUser } from "@/features/auth/types";
import type { Assignment } from "./types";

const roleRank = (role: string) => (role === "Captain" ? 0 : 1);

/** Assignments of the given user (for captains: vessels under their command). */
export const vesselsCommandedBy = (
  assignments: readonly Assignment[],
  userId: string,
) => assignments.filter((entry) => entry.userId === userId);

/** Crew-role members serving on the given vessel. */
export const crewOnVessel = (
  assignments: readonly Assignment[],
  vesselId: string,
) =>
  assignments.filter(
    (entry) => entry.vesselId === vesselId && entry.userRole === "Crew",
  );

/** Everyone serving on the given vessel, captains first, then alphabetical. */
export const rosterOfVessel = (
  assignments: readonly Assignment[],
  vesselId: string,
) =>
  [...assignments.filter((entry) => entry.vesselId === vesselId)].sort(
    (a, b) =>
      roleRank(a.userRole) - roleRank(b.userRole) ||
      a.userName.localeCompare(b.userName),
  );

/** Captains and Crew (Admins do not serve aboard). */
export const assignableMembers = (users: readonly SessionUser[]) =>
  users.filter((user) => user.role !== "Admin");

/** Assignable members not yet serving on any vessel. */
export const unassignedMembers = (
  users: readonly SessionUser[],
  assignments: readonly Assignment[],
) =>
  assignableMembers(users).filter(
    (user) => !assignments.some((entry) => entry.userId === user.id),
  );
