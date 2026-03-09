CREATE TABLE `info_importanti` (
	`id` text PRIMARY KEY NOT NULL,
	`titolo` text NOT NULL,
	`tipo` text NOT NULL,
	`valore` text,
	`pinned` integer NOT NULL DEFAULT 0,
	`pinned_at` text,
	`creato_da` text NOT NULL,
	`creato_il` text NOT NULL,
	`modificato_il` text NOT NULL,
	FOREIGN KEY (`creato_da`) REFERENCES `utenti`(`id`) ON UPDATE no action ON DELETE no action
);
