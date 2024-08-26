CREATE INDEX `idx_apps_github_workflow_run_id` ON `apps` (`github_workflow_run_id`);--> statement-breakpoint
ALTER TABLE `apps` DROP COLUMN `github_workflow_job_id`;