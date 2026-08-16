import { supabase } from "@/lib/supabase/client";
import type { RoleName } from "@/features/auth/types";
import type { Assignment } from "./types";

type AssignmentRow = {
  id: string;
  crew_user_id: string;
  vessel_id: string;
  users: { name: string; user_roles: { name: RoleName } };
  vessels: { name: string };
};

export async function fetchAssignments(): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("vessel_crews")
    .select(
      "id, crew_user_id, vessel_id, users(name, user_roles(name)), vessels(name)",
    )
    .order("assigned_at");

  if (error) throw error;

  return ((data ?? []) as unknown as AssignmentRow[]).map((row) => ({
    id: row.id,
    userId: row.crew_user_id,
    vesselId: row.vessel_id,
    userName: row.users.name,
    userRole: row.users.user_roles.name,
    vesselName: row.vessels.name,
  }));
}

export async function assignCrew(
  crewUserId: string,
  vesselId: string,
): Promise<void> {
  const { error } = await supabase
    .from("vessel_crews")
    .insert({ crew_user_id: crewUserId, vessel_id: vesselId });

  if (error) throw error;
}

export async function unassignCrew(assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from("vessel_crews")
    .delete()
    .eq("id", assignmentId);

  if (error) throw error;
}
