CREATE TABLE `distributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`totalAmount` varchar(64) NOT NULL,
	`activeWallets` int NOT NULL DEFAULT 0,
	`zakatPercentage` varchar(16) NOT NULL DEFAULT '7.77',
	`distributionCycles` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `distributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sovereignHashtags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hashtag` varchar(64) NOT NULL,
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sovereignHashtags_id` PRIMARY KEY(`id`),
	CONSTRAINT `sovereignHashtags_hashtag_unique` UNIQUE(`hashtag`)
);
