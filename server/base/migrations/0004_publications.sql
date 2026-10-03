CREATE TABLE "actus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"date" date NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"chapo" text DEFAULT '' NOT NULL,
	"corps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"public" text DEFAULT 'tous' NOT NULL,
	"statut" text DEFAULT 'brouillon' NOT NULL,
	"a_relire" boolean DEFAULT false NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"cree_par" uuid,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_par" uuid
);
--> statement-breakpoint
CREATE TABLE "evenements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"date" date NOT NULL,
	"date_fin" date,
	"heure" text,
	"lieu" text DEFAULT '' NOT NULL,
	"section" text,
	"resume" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"public" text DEFAULT 'tous' NOT NULL,
	"inscription" boolean DEFAULT false NOT NULL,
	"photo" text,
	"statut" text DEFAULT 'brouillon' NOT NULL,
	"a_relire" boolean DEFAULT false NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"cree_par" uuid,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_par" uuid
);
--> statement-breakpoint
ALTER TABLE "actus" ADD CONSTRAINT "actus_cree_par_personnes_id_fk" FOREIGN KEY ("cree_par") REFERENCES "public"."personnes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actus" ADD CONSTRAINT "actus_maj_par_personnes_id_fk" FOREIGN KEY ("maj_par") REFERENCES "public"."personnes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_cree_par_personnes_id_fk" FOREIGN KEY ("cree_par") REFERENCES "public"."personnes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_maj_par_personnes_id_fk" FOREIGN KEY ("maj_par") REFERENCES "public"."personnes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "actus_slug_idx" ON "actus" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "actus_date_idx" ON "actus" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "evenements_slug_idx" ON "evenements" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "evenements_date_idx" ON "evenements" USING btree ("date");--> statement-breakpoint
CREATE INDEX "evenements_section_idx" ON "evenements" USING btree ("section");