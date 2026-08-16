import { supabase } from "@/lib/supabase/client";
import type { WorkOrder, WorkOrderStatus } from "./types";

export type WorkOrderWithNames = WorkOrder & {
  crewName: string;
  creatorName: string;
  vesselName: string;
};

/*
Two FKs point at users, so the user embeds need explicit FK names.
*/
const WORK_ORDER_SELECT =
  "*, assigned_crew:users!work_orders_assigned_crew_user_id_fkey(name), creator:users!work_orders_creator_user_id_fkey(name), vessels(name)";

type WorkOrderRow = WorkOrder & {
  assigned_crew: { name: string };
  creator: { name: string };
  vessels: { name: string };
};

function toWorkOrderWithNames(row: WorkOrderRow): WorkOrderWithNames {
  const { assigned_crew, creator, vessels, ...workOrder } = row;
  return {
    ...workOrder,
    crewName: assigned_crew.name,
    creatorName: creator.name,
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

export async function fetchWorkOrdersAssignedTo(
  crewUserId: string,
): Promise<WorkOrderWithNames[]> {
  const { data, error } = await supabase
    .from("work_orders")
    .select(WORK_ORDER_SELECT)
    .eq("assigned_crew_user_id", crewUserId)
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

/**
Attest a Done work order: sets attested_at, fully closing the record.
The filters guard against attesting twice or attesting a non-Done order.
*/
export async function attestWorkOrder(workOrderId: string): Promise<void> {
  const done: WorkOrderStatus = "Done";
  const { error } = await supabase
    .from("work_orders")
    .update({ attested_at: new Date().toISOString() })
    .eq("id", workOrderId)
    .eq("status", done)
    .is("attested_at", null);

  if (error) throw error;
}

/**
Reject a Done work order: records the required reason and returns the
order to the assigned crew as In Progress. Attested orders are final.
*/
export async function rejectWorkOrder(
  workOrderId: string,
  reason: string,
): Promise<void> {
  const from: WorkOrderStatus = "Done";
  const to: WorkOrderStatus = "In Progress";
  const { error } = await supabase
    .from("work_orders")
    .update({ status: to, rejection_reason: reason })
    .eq("id", workOrderId)
    .eq("status", from)
    .is("attested_at", null);

  if (error) throw error;
}

/**
Open -> In Progress. The status filter guards against stale UI state.
*/
export async function startWorkOrder(workOrderId: string): Promise<void> {
  const from: WorkOrderStatus = "Open";
  const to: WorkOrderStatus = "In Progress";
  const { error } = await supabase
    .from("work_orders")
    .update({ status: to })
    .eq("id", workOrderId)
    .eq("status", from);

  if (error) throw error;
}

/**
In Progress -> Done, documenting the solution in the same update.
Clears any previous rejection reason so the resubmission arrives clean.
*/
export async function completeWorkOrder(
  workOrderId: string,
  solution: string,
): Promise<void> {
  const from: WorkOrderStatus = "In Progress";
  const to: WorkOrderStatus = "Done";
  const { error } = await supabase
    .from("work_orders")
    .update({ status: to, solution, rejection_reason: null })
    .eq("id", workOrderId)
    .eq("status", from);

  if (error) throw error;
}
