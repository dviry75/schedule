import { Activity, AlertTriangle, CheckCircle2, Clock, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardStats, mockExecutionLogs, mockChartData } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const stats = [
  { label: "Active Schedules", value: dashboardStats.activeSchedules, icon: Clock, color: "text-primary" },
  { label: "Executed Today", value: dashboardStats.executedToday, icon: CheckCircle2, color: "text-success" },
  { label: "Failed Today", value: dashboardStats.failedToday, icon: AlertTriangle, color: "text-destructive" },
  { label: "Skipped Today", value: dashboardStats.skippedToday, icon: Timer, color: "text-warning" },
];

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Control Center</h1>
        <p className="text-sm text-muted-foreground">System overview and execution metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold font-mono text-foreground">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">Execution Rate</h2>
              <p className="text-xs text-muted-foreground">Executions per minute — last 30 min</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="execGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
                  interval={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(217, 33%, 17%)",
                    border: "1px solid hsl(215, 25%, 27%)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "hsl(210, 40%, 98%)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="executions"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={1.5}
                  fill="url(#execGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h2 className="text-sm font-medium text-foreground mb-4">Recent Executions</h2>
          <div className="space-y-3">
            {mockExecutionLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-1.5 w-1.5 rounded-full ${log.success ? "bg-success" : "bg-destructive"}`} />
                  <span className="text-xs font-mono text-muted-foreground">{log.schedule_id}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-mono ${log.success ? "text-success" : "text-destructive"}`}>
                    {log.response_status || "TIMEOUT"}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{log.duration_ms}ms</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.executed_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
