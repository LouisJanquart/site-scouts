ALTER TABLE "comptes" ADD COLUMN "jeton_calendrier" text;--> statement-breakpoint
CREATE UNIQUE INDEX "comptes_jeton_calendrier_idx" ON "comptes" USING btree ("jeton_calendrier");
