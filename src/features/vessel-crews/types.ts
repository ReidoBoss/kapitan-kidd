import type { RoleName } from "@/features/auth/types";

export type Assignment = {
  id: string;
  userId: string;
  vesselId: string;
  userName: string;
  userRole: RoleName;
  vesselName: string;
};
