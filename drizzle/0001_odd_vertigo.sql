CREATE TABLE `utenti` (
	`id` text PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`nome` text,
	`affidamento_colore` text,
	`creato_il` text NOT NULL,
	`modificato_il` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `utenti_affidamento_colore_unique` ON `utenti` (`affidamento_colore`);--> statement-breakpoint
INSERT INTO `utenti` ("id", "password_hash", "nome", "creato_il", "modificato_il") VALUES ('migrated-legacy', 'legacy-no-login', 'Migrato (eventi esistenti)', datetime('now'), datetime('now'));--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_eventi` (
	`id` text PRIMARY KEY NOT NULL,
	`titolo` text NOT NULL,
	`descrizione` text,
	`data_inizio` text NOT NULL,
	`data_fine` text NOT NULL,
	`tipo` text NOT NULL,
	`creato_da` text NOT NULL,
	`creato_il` text NOT NULL,
	`modificato_il` text NOT NULL,
	FOREIGN KEY (`creato_da`) REFERENCES `utenti`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_eventi`("id", "titolo", "descrizione", "data_inizio", "data_fine", "tipo", "creato_da", "creato_il", "modificato_il") SELECT "id", "titolo", "descrizione", "data_inizio", "data_fine", "tipo", 'migrated-legacy', "creato_il", "modificato_il" FROM `eventi`;--> statement-breakpoint
DROP TABLE `eventi`;--> statement-breakpoint
ALTER TABLE `__new_eventi` RENAME TO `eventi`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `config` DROP COLUMN `password_hash`;