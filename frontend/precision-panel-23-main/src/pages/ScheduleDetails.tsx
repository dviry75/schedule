import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { mockSchedules, mockExecutionLogs } from "@/data/mock";

export default function ScheduleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const schedule = mockSchedules.find((s) => s.id === id);

  if (!schedule) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Schedule not found.
      </div>
    );
  }

  const logs = mockExecutionLogs.filter((l) => l.schedule_id === schedule.id);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });

  const metaFields = [
    { label: "ID", value: schedule.id },
    { label: "Status", value: <StatusBadge status={schedule.status} /> },
    { label: "Webhook", value: schedule.webhook_url },
    { label: "Method", value: schedule.http_method },
    { label: "Next Run", value: formatDate(schedule.next_run_at) },
    { label: "Retry Count", value: `${schedule.retry_count} / 3` },
    { label: "Created By", value: schedule.created_by_email },
    { label: "Created At", value: formatDate(schedule.created_at) },
    { label: "Locked At", value: schedule.locked_at ? formatDate(schedule.locked_at) : "—" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/schedules")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-sm font-mono text-foreground">{schedule.id}</h1>
            <p className="text-xs text-muted-foreground">{schedule.webhook_url}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs border-border">
            <RefreshCw className="h-3 w-3 mr-1.5" />Resend
          </Button>
          <Button variant="outline" size="sm" className="text-xs border-border">
            <Copy className="h-3 w-3 mr-1.5" />Duplicate
          </Button>
          <Button variant="outline" size="sm" className="text-xs border-border text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3 mr-1.5" />Delete
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Metadata</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            {metaFields.map((field) => (
              <div key={field.label} className="flex items-start justify-between sm:flex-col sm:gap-1">
                <span className="text-xs text-muted-foreground">{field.label}</span>
                <span className="text-sm font-mono text-foreground text-right sm:text-left break-all">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payload */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Payload</h2>
          <pre className="bg-background rounded-md border border-border p-4 text-xs font-mono text-foreground overflow-x-auto">
            {JSON.stringify(schedule.payload, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Execution Logs</h2>
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No executions yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${log.success ? "bg-success" : "bg-destructive"}`} />
                    <span className="text-xs font-mono text-muted-foreground">
                      {log.execution_type === "skipped_timeout" ? "Skipped (timeout)" : `HTTP ${log.response_status}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground">{log.duration_ms}ms</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.executed_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
