CREATE TABLE `config` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`password_hash` text,
	`updated_at` text
);
--> statement-breakpoint
INSERT OR IGNORE INTO `config` (`id`) VALUES ('default');
--> statement-breakpoint
CREATE TABLE `eventi` (
	`id` text PRIMARY KEY NOT NULL,
	`titolo` text NOT NULL,
	`descrizione` text,
	`data_inizio` text NOT NULL,
	`data_fine` text NOT NULL,
	`tipo` text NOT NULL,
	`creato_da` text,
	`creato_il` text NOT NULL,
	`modificato_il` text NOT NULL
);
