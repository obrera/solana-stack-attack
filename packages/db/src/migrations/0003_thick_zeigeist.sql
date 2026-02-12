CREATE TABLE `burn` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`upgrade_id` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `burn_userId_idx` ON `burn` (`user_id`);--> statement-breakpoint
CREATE INDEX `burn_userId_upgradeId_idx` ON `burn` (`user_id`,`upgrade_id`);