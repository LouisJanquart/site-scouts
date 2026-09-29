CREATE TABLE "sections" (
	"slug" text PRIMARY KEY NOT NULL,
	"nom" text,
	"nom_court" text,
	"ages" text,
	"resume" text,
	"description" text,
	"photo" text,
	"animee" boolean,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_par" uuid
);
--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_maj_par_personnes_id_fk" FOREIGN KEY ("maj_par") REFERENCES "public"."personnes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sections_maj_idx" ON "sections" USING btree ("maj_le");