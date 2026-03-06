import { cn } from "@/lib/utils";
import type { ScheduleStatus } from "@/data/mock";

const statusConfig: Record<ScheduleStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/20" },
  running: { label: "Running", className: "bg-primary/15 text-primary border-primary/20" },
  completed: { label: "Completed", className: "bg-success/15 text-success border-success/20" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/20" },
  cancelled: { label: "Cancelled", className: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20" },
};

export function StatusBadge({ status }: { status: ScheduleStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium font-mono",
        config.className
      )}
    >
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
        "bg-warning": status === "pending",
        "bg-primary animate-pulse": status === "running",
        "bg-success": status === "completed",
        "bg-destructive": status === "failed",
        "bg-muted-foreground": status === "cancelled",
      })} />
      {config.label}
    </span>
  );
}
