export type ScheduleStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type ExecutionType = "executed" | "skipped_timeout";
export type MemberRole = "Owner" | "Admin" | "Member";

export interface Schedule {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  created_by_email: string;
  webhook_url: string;
  http_method: string;
  payload: Record<string, unknown>;
  next_run_at: string;
  status: ScheduleStatus;
  retry_count: number;
  locked_at: string | null;
  created_at: string;
}

export interface ExecutionLog {
  id: string;
  schedule_id: string;
  executed_at: string;
  response_status: number;
  duration_ms: number;
  execution_type: ExecutionType;
  success: boolean;
}

export interface ApiKey {
  id: string;
  organization_id: string;
  key_preview: string;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OrgMember {
  id: string;
  email: string;
  role: MemberRole;
  is_active: boolean;
  joined_at: string;
}

export const mockSchedules: Schedule[] = [
  {
    id: "sch_8f42b1c3",
    organization_id: "org_001",
    created_by_user_id: "usr_001",
    created_by_email: "admin@acme.io",
    webhook_url: "https://api.acme.io/webhooks/process-payments",
    http_method: "POST",
    payload: { action: "process", batch_size: 100, priority: "high" },
    next_run_at: "2026-02-27T14:30:00Z",
    status: "pending",
    retry_count: 0,
    locked_at: null,
    created_at: "2026-02-20T08:00:00Z",
  },
  {
    id: "sch_5d9e4a7b",
    organization_id: "org_001",
    created_by_user_id: "usr_002",
    created_by_email: "ops@acme.io",
    webhook_url: "https://api.acme.io/webhooks/sync-inventory",
    http_method: "PUT",
    payload: { sync_type: "full", region: "us-east-1" },
    next_run_at: "2026-02-27T15:00:00Z",
    status: "running",
    retry_count: 1,
    locked_at: "2026-02-27T14:58:00Z",
    created_at: "2026-02-19T12:00:00Z",
  },
  {
    id: "sch_b2e19c3f",
    organization_id: "org_001",
    created_by_user_id: "usr_001",
    created_by_email: "admin@acme.io",
    webhook_url: "https://api.acme.io/webhooks/generate-reports",
    http_method: "POST",
    payload: { report_type: "daily", format: "pdf" },
    next_run_at: "2026-02-27T18:00:00Z",
    status: "completed",
    retry_count: 0,
    locked_at: null,
    created_at: "2026-02-18T09:30:00Z",
  },
  {
    id: "sch_4d5a6e7b",
    organization_id: "org_001",
    created_by_user_id: "usr_003",
    created_by_email: "dev@acme.io",
    webhook_url: "https://api.acme.io/webhooks/cleanup-sessions",
    http_method: "DELETE",
    payload: { older_than_hours: 24 },
    next_run_at: "2026-02-27T20:00:00Z",
    status: "failed",
    retry_count: 3,
    locked_at: null,
    created_at: "2026-02-17T16:00:00Z",
  },
  {
    id: "sch_9c3f4d5a",
    organization_id: "org_001",
    created_by_user_id: "usr_002",
    created_by_email: "ops@acme.io",
    webhook_url: "https://api.acme.io/webhooks/send-notifications",
    http_method: "POST",
    payload: { channel: "email", template: "weekly-digest" },
    next_run_at: "2026-02-28T06:00:00Z",
    status: "cancelled",
    retry_count: 0,
    locked_at: null,
    created_at: "2026-02-16T11:00:00Z",
  },
  {
    id: "sch_6e7b8f42",
    organization_id: "org_001",
    created_by_user_id: "usr_001",
    created_by_email: "admin@acme.io",
    webhook_url: "https://api.acme.io/webhooks/data-backup",
    http_method: "POST",
    payload: { storage: "s3", compress: true },
    next_run_at: "2026-02-27T22:00:00Z",
    status: "pending",
    retry_count: 0,
    locked_at: null,
    created_at: "2026-02-15T07:45:00Z",
  },
];

export const mockExecutionLogs: ExecutionLog[] = [
  { id: "log_001", schedule_id: "sch_8f42b1c3", executed_at: "2026-02-27T14:00:00Z", response_status: 200, duration_ms: 342, execution_type: "executed", success: true },
  { id: "log_002", schedule_id: "sch_5d9e4a7b", executed_at: "2026-02-27T14:30:00Z", response_status: 500, duration_ms: 1203, execution_type: "executed", success: false },
  { id: "log_003", schedule_id: "sch_b2e19c3f", executed_at: "2026-02-27T13:00:00Z", response_status: 200, duration_ms: 156, execution_type: "executed", success: true },
  { id: "log_004", schedule_id: "sch_4d5a6e7b", executed_at: "2026-02-27T12:00:00Z", response_status: 0, duration_ms: 30000, execution_type: "skipped_timeout", success: false },
  { id: "log_005", schedule_id: "sch_8f42b1c3", executed_at: "2026-02-27T13:00:00Z", response_status: 200, duration_ms: 289, execution_type: "executed", success: true },
  { id: "log_006", schedule_id: "sch_9c3f4d5a", executed_at: "2026-02-27T11:00:00Z", response_status: 200, duration_ms: 445, execution_type: "executed", success: true },
  { id: "log_007", schedule_id: "sch_6e7b8f42", executed_at: "2026-02-27T10:00:00Z", response_status: 200, duration_ms: 678, execution_type: "executed", success: true },
  { id: "log_008", schedule_id: "sch_5d9e4a7b", executed_at: "2026-02-27T09:30:00Z", response_status: 200, duration_ms: 312, execution_type: "executed", success: true },
];

export const mockApiKeys: ApiKey[] = [
  { id: "key_001", organization_id: "org_001", key_preview: "sk_live_...x4Bf", last_used_at: "2026-02-27T14:00:00Z", is_active: true, created_at: "2026-01-15T08:00:00Z" },
  { id: "key_002", organization_id: "org_001", key_preview: "sk_live_...m9Kz", last_used_at: "2026-02-25T09:00:00Z", is_active: true, created_at: "2026-02-01T10:00:00Z" },
  { id: "key_003", organization_id: "org_001", key_preview: "sk_test_...q2Wr", last_used_at: null, is_active: false, created_at: "2026-01-10T12:00:00Z" },
];

export const mockMembers: OrgMember[] = [
  { id: "usr_001", email: "admin@acme.io", role: "Owner", is_active: true, joined_at: "2025-12-01T08:00:00Z" },
  { id: "usr_002", email: "ops@acme.io", role: "Admin", is_active: true, joined_at: "2026-01-05T10:00:00Z" },
  { id: "usr_003", email: "dev@acme.io", role: "Member", is_active: true, joined_at: "2026-01-20T14:00:00Z" },
  { id: "usr_004", email: "intern@acme.io", role: "Member", is_active: false, joined_at: "2026-02-10T09:00:00Z" },
];

export const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  executions: Math.floor(Math.random() * 12) + 1,
  failures: Math.floor(Math.random() * 3),
}));

export const dashboardStats = {
  activeSchedules: 4,
  executedToday: 847,
  failedToday: 12,
  skippedToday: 3,
};
