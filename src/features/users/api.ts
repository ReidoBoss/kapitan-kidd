import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "./types";

export async function fetchRoles(): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id, name")
    .order("id");

  if (error) throw error;
  return (data ?? []) as UserRole[];
}

export async function createUser(
  name: string,
  userRoleId: number,
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .insert({ name, user_role_id: userRoleId });

  if (error) throw error;
}
