import type { RoleName } from "@/features/auth/types";

export type UserRole = {
  id: number;
  name: RoleName;
};

/** Roles the Admin may assign when creating a user. */
export const ASSIGNABLE_ROLES = ["Captain", "Crew"] as const satisfies readonly RoleName[];
