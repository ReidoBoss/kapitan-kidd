import { ASSIGNABLE_ROLES, type UserRole } from "./types";

/** Roles the Admin may hand out (never Admin itself). */
export const assignableRolesOf = (roles: readonly UserRole[]) =>
  roles.filter((role) =>
    (ASSIGNABLE_ROLES as readonly string[]).includes(role.name),
  );
