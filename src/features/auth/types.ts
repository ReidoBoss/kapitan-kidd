export const ROLES = ["Admin", "Captain", "Crew"] as const;

export type RoleName = (typeof ROLES)[number];

export type SessionUser = {
  id: string;
  name: string;
  role: RoleName;
};
