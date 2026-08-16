import { supabase } from "@/lib/supabase/client";
import type { RoleName, SessionUser } from "./types";

export async function fetchUsers(): Promise<SessionUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, user_roles(name)")
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    role: (row.user_roles as unknown as { name: RoleName }).name,
  }));
}
