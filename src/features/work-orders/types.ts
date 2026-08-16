export const WORK_ORDER_STATUSES = ["Open", "In Progress", "Done"] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

/** Mirrors public.work_orders
 * see supabase/migrations/*_create_work_orders.sql
 * */
export type WorkOrder = {
  id: string;
  creator_user_id: string;
  assigned_crew_user_id: string;
  vessel_id: string;
  title: string;
  issue: string;
  solution: string | null;
  status: WorkOrderStatus;
  rejection_reason: string | null;
  attested_at: string | null;
  created_at: string;
  updated_at: string;
};
