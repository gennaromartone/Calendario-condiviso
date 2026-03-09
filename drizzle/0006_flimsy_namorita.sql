CREATE TABLE `notifiche` (
	`id` text PRIMARY KEY NOT NULL,
	`utente_id` text NOT NULL,
	`tipo` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`titolo` text NOT NULL,
	`autore_id` text NOT NULL,
	`letta` integer NOT NULL,
	`creato_il` text NOT NULL,
	FOREIGN KEY (`utente_id`) REFERENCES `utenti`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`autore_id`) REFERENCES `utenti`(`id`) ON UPDATE no action ON DELETE no action
);
