-- Auth cleanup: remove username/firstname/lastname, drop unused NextAuth
-- Session + VerificationToken tables (JWT sessions are used), make tag names
-- unique per workspace, add cascading deletes and a few indexes.

-- User: drop username / firstname / lastname
DROP INDEX IF EXISTS "User_username_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "username",
DROP COLUMN IF EXISTS "firstname",
DROP COLUMN IF EXISTS "lastname";

-- Unused NextAuth database-session tables
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "VerificationToken";

-- Tag: unique per workspace instead of globally unique
DROP INDEX IF EXISTS "Tag_name_key";
CREATE UNIQUE INDEX "Tag_workspaceId_name_key" ON "Tag"("workspaceId", "name");

-- Cascading deletes
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" DROP CONSTRAINT "Task_workspaceId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_userId_fkey";
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskVersionId_fkey";
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskVersionId_fkey" FOREIGN KEY ("taskVersionId") REFERENCES "TaskVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskVersion" DROP CONSTRAINT "TaskVersion_taskId_fkey";
ALTER TABLE "TaskVersion" ADD CONSTRAINT "TaskVersion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_taskId_fkey";
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Comment" DROP CONSTRAINT "Comment_taskId_fkey";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "Task_workspaceId_completed_idx" ON "Task"("workspaceId", "completed");
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- Task priority defaults to "no_priority"
ALTER TABLE "Task" ALTER COLUMN "priority" SET DEFAULT 'no_priority';
