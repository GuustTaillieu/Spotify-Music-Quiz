CREATE TABLE `user_follows` (
	`follower_id` integer NOT NULL,
	`following_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`follower_id`, `following_id`),
	FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`spotifyId` text NOT NULL,
	`name` text NOT NULL,
	`imageUrl` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quiz_attendees` (
	`quiz_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`quiz_id`, `user_id`),
	FOREIGN KEY (`quiz_id`) REFERENCES `quizes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quiz_attendees_quiz_id_idx` ON `quiz_attendees` (`quiz_id`);--> statement-breakpoint
CREATE INDEX `quiz_attendees_user_id_idx` ON `quiz_attendees` (`user_id`);--> statement-breakpoint
CREATE TABLE `quiz_favorites` (
	`quiz_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`quiz_id`, `user_id`),
	FOREIGN KEY (`quiz_id`) REFERENCES `quizes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quiz_favorites_quiz_id_idx` ON `quiz_favorites` (`quiz_id`);--> statement-breakpoint
CREATE INDEX `quiz_favorites_user_id_idx` ON `quiz_favorites` (`user_id`);--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`quiz_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`quiz_id`, `question_id`),
	FOREIGN KEY (`quiz_id`) REFERENCES `quizes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quiz_questions_quiz_id_idx` ON `quiz_questions` (`quiz_id`);--> statement-breakpoint
CREATE INDEX `quiz_questions_question_id_idx` ON `quiz_questions` (`question_id`);--> statement-breakpoint
CREATE TABLE `quizes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`image_url` text,
	`user_id` integer NOT NULL,
	`public` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quizes_user_id_idx` ON `quizes` (`user_id`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quiz_id` integer NOT NULL,
	`question_type` text NOT NULL,
	`spotify_id` text NOT NULL,
	`timestamp` text,
	`user_id` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `questions_quiz_id_idx` ON `questions` (`quiz_id`);--> statement-breakpoint
CREATE INDEX `questions_user_id_idx` ON `questions` (`user_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`quiz_id` integer,
	`from_user_id` integer NOT NULL,
	`user_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_quiz_id_idx` ON `notifications` (`quiz_id`);--> statement-breakpoint
CREATE INDEX `notifications_from_user_id_idx` ON `notifications` (`from_user_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);
