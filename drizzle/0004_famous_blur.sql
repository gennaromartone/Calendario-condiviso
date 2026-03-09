ALTER TABLE `utenti` ADD `login_identifier` text;--> statement-breakpoint
CREATE UNIQUE INDEX `utenti_login_identifier_unique` ON `utenti` (`login_identifier`);