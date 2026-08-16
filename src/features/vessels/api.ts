import { supabase } from "@/lib/supabase/client";
import type { Vessel } from "./types";

export async function fetchVessels(): Promise<Vessel[]> {
  const { data, error } = await supabase
    .from("vessels")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Vessel[];
}

export async function createVessel(name: string): Promise<Vessel> {
  const { data, error } = await supabase
    .from("vessels")
    .insert({ name })
    .select("id, name, created_at")
    .single();

  if (error) throw error;
  return data as Vessel;
}
