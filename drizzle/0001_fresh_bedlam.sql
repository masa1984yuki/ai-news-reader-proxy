CREATE TABLE `collectionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('news','youtube') NOT NULL,
	`status` enum('success','failure') NOT NULL,
	`itemsCollected` int DEFAULT 0,
	`errorMessage` text,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collectionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`summary` text,
	`sourceUrl` text NOT NULL,
	`sourceName` varchar(255),
	`imageUrl` text,
	`category` enum('Claude関連','ChatGPT関連','その他AI') NOT NULL,
	`publishedAt` timestamp,
	`collectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsArticles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `youtubeVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` varchar(255) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`channelId` varchar(255),
	`channelTitle` varchar(255),
	`thumbnailUrl` text,
	`category` enum('Claude関連','ChatGPT関連','その他AI') NOT NULL,
	`publishedAt` timestamp,
	`collectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `youtubeVideos_id` PRIMARY KEY(`id`),
	CONSTRAINT `youtubeVideos_videoId_unique` UNIQUE(`videoId`)
);
