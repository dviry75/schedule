CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "ScheduleStatus" AS ENUM ('pending', 'running', 'success', 'failed', 'cancelled', 'expired');
CREATE TYPE "HttpMethod" AS ENUM ('POST');
CREATE TYPE "CreatedSource" AS ENUM ('api', 'ui', 'manual_resend');
CREATE TYPE "ExecutionType" AS ENUM ('executed', 'skipped_timeout');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "organizations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organization_members" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "Role" NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members"("organization_id");
CREATE INDEX "organization_members_user_id_idx" ON "organization_members"("user_id");

CREATE TABLE "schedules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "created_by_user_id" UUID NOT NULL,
  "webhook_url" TEXT NOT NULL,
  "http_method" "HttpMethod" NOT NULL DEFAULT 'POST',
  "payload" JSONB NOT NULL,
  "next_run_at" TIMESTAMPTZ(6) NOT NULL,
  "status" "ScheduleStatus" NOT NULL,
  "retry_count" INTEGER NOT NULL DEFAULT 0,
  "max_retries" INTEGER NOT NULL DEFAULT 3,
  "locked_at" TIMESTAMPTZ(6),
  "last_error" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ(6),
  "created_source" "CreatedSource" NOT NULL,
  CONSTRAINT "schedules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "schedules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "schedules_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "schedules_status_next_run_at_idx" ON "schedules"("status", "next_run_at");
CREATE INDEX "schedules_organization_id_idx" ON "schedules"("organization_id");
CREATE INDEX "schedules_locked_at_idx" ON "schedules"("locked_at");
CREATE INDEX "schedules_pending_next_run_partial_idx" ON "schedules"("next_run_at") WHERE "status" = 'pending';

CREATE TABLE "execution_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "schedule_id" UUID NOT NULL,
  "executed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "status_code" INTEGER,
  "duration_ms" INTEGER NOT NULL,
  "success" BOOLEAN NOT NULL,
  "execution_type" "ExecutionType" NOT NULL,
  CONSTRAINT "execution_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "execution_logs_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "execution_logs_schedule_id_idx" ON "execution_logs"("schedule_id");
CREATE INDEX "execution_logs_executed_at_idx" ON "execution_logs"("executed_at");
