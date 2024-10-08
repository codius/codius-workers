CREATE TABLE `apps` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`github_owner` text NOT NULL,
	`repo` text NOT NULL,
	`branch` text NOT NULL,
	`commit_hash` text NOT NULL,
	`directory` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`github_workflow_job_id` integer,
	`github_workflow_run_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` integer NOT NULL,
	`stripe_checkout_session_id` text NOT NULL,
	`app_id` text NOT NULL,
	`user_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`github_id` integer NOT NULL,
	`username` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_apps_user_id` ON `apps` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `apps_user_id_github_owner_repo_commit_hash_directory_deleted_at_unique` ON `apps` (`user_id`,`github_owner`,`repo`,`commit_hash`,`directory`,`deleted_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_github_id_unique` ON `users` (`github_id`);