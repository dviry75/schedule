import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, RefreshCw, Copy, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { mockSchedules, type ScheduleStatus } from "@/data/mock";
import { useIsMobile } from "@/hooks/use-mobile";

const statusFilters: (ScheduleStatus | "all")[] = ["all", "pending", "running", "completed", "failed", "cancelled"];

export default function Schedules() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "all">("all");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const filtered = mockSchedules.filter((s) => {
    const matchesSearch = s.id.includes(search) || s.webhook_url.includes(search);
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const truncateUrl = (url: string, len = 40) =>
    url.length > len ? url.slice(0, len) + "…" : url;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Schedules</h1>
          <p className="text-sm text-muted-foreground">{mockSchedules.length} total schedules</p>
        </div>
        <Button size="sm" className="hidden md:flex">
          New Schedule
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by ID or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-sm h-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      {isMobile ? (
        <div className="space-y-2">
          {filtered.map((schedule) => (
            <Card
              key={schedule.id}
              className="bg-card border-border cursor-pointer active:bg-accent/50 transition-colors"
              onClick={() => navigate(`/schedules/${schedule.id}`)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{schedule.id}</span>
                  <StatusBadge status={schedule.status} />
                </div>
                <p className="text-sm text-foreground font-mono truncate">{schedule.webhook_url}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{schedule.http_method}</span>
                  <span>Next: {formatDate(schedule.next_run_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Desktop Table */
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Webhook URL</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Method</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Next Run (UTC)</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Retries</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Created By</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((schedule) => (
                <TableRow
                  key={schedule.id}
                  className="border-border cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/schedules/${schedule.id}`)}
                >
                  <TableCell><StatusBadge status={schedule.status} /></TableCell>
                  <TableCell className="font-mono text-xs text-foreground">{truncateUrl(schedule.webhook_url)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{schedule.http_method}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(schedule.next_run_at)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{schedule.retry_count}/3</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{schedule.created_by_email}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem className="text-xs"><RefreshCw className="h-3 w-3 mr-2" />Resend</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs"><Copy className="h-3 w-3 mr-2" />Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3 w-3 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
