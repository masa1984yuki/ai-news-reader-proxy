CREATE TABLE `dailySummaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`summaryDate` timestamp NOT NULL,
	`summaries` text NOT NULL,
	`sourceType` enum('economy','technology') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailySummaries_id` PRIMARY KEY(`id`)
);
