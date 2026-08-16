import { supabase } from "@/lib/supabase/client";
import type { WorkOrder } from "./types";

export type WorkOrderWithNames = WorkOrder & {
  crewName: string;
  vesselName: string;
};

/*
Two FKs point at users, so the assigned-crew embed needs the explicit FK name.
*/
const WORK_ORDER_SELECT =
  "*, assigned_crew:users!work_orders_assigned_crew_user_id_fkey(name), vessels(name)";

type WorkOrderRow = WorkOrder & {
  assigned_crew: { name: string };
  vessels: { name: string };
};

function toWorkOrderWithNames(row: WorkOrderRow): WorkOrderWithNames {
  const { assigned_crew, vessels, ...workOrder } = row;
  return {
    ...workOrder,
    crewName: assigned_crew.name,
    vesselName: vessels.name,
  };
}

export async function fetchWorkOrdersCreatedBy(
  creatorUserId: string,
): Promise<WorkOrderWithNames[]> {
  const { data, error } = await supabase
    .from("work_orders")
    .select(WORK_ORDER_SELECT)
    .eq("creator_user_id", creatorUserId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as WorkOrderRow[]).map(toWorkOrderWithNames);
}

export async function createWorkOrder(input: {
  creatorUserId: string;
  assignedCrewUserId: string;
  vesselId: string;
  title: string;
  issue: string;
}): Promise<void> {
  // status is omitted on purpose: the column defaults to 'Open' server-side.
  const { error } = await supabase.from("work_orders").insert({
    creator_user_id: input.creatorUserId,
    assigned_crew_user_id: input.assignedCrewUserId,
    vessel_id: input.vesselId,
    title: input.title,
    issue: input.issue,
  });

  if (error) throw error;
}
