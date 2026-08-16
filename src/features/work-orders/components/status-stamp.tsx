import type { WorkOrderStatus } from "../types";

const STATUS_STYLES: Record<WorkOrderStatus, string> = {
  Open: "border-foreground/60 text-foreground/80",
  "In Progress": "border-navy text-navy",
  Done: "border-done text-done",
};

export function StatusStamp({ status }: { status: WorkOrderStatus }) {
  return (
    <span
      className={`inline-block -rotate-2 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
