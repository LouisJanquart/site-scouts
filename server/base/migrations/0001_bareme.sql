ALTER TABLE "familles" ADD COLUMN "tarif_social" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "familles" ADD COLUMN "tarif_social_accorde_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "familles" ADD COLUMN "membres_ailleurs" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "inscriptions" ADD COLUMN "motif_tarif" text;--> statement-breakpoint
ALTER TABLE "inscriptions" ADD COLUMN "brevete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "saisons" ADD COLUMN "bareme" jsonb;--> statement-breakpoint
ALTER TABLE "saisons" ADD COLUMN "supplement_local_centimes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "saisons" DROP COLUMN "cotisation_centimes";--> statement-breakpoint
ALTER TABLE "saisons" DROP COLUMN "cotisation_fratrie_centimes";