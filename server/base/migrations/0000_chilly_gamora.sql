CREATE TABLE "comptes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"personne_id" uuid NOT NULL,
	"email" text NOT NULL,
	"empreinte" text NOT NULL,
	"email_verifie_le" timestamp with time zone,
	"doit_changer_mdp" boolean DEFAULT false NOT NULL,
	"derniere_connexion_le" timestamp with time zone,
	"desactive_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jetons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compte_id" uuid NOT NULL,
	"type" text NOT NULL,
	"empreinte_jeton" text NOT NULL,
	"expire_le" timestamp with time zone NOT NULL,
	"utilise_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personnes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prenom" text NOT NULL,
	"nom" text NOT NULL,
	"totem" text,
	"date_naissance" date,
	"genre" text,
	"email" text,
	"telephone" text,
	"rue" text,
	"numero" text,
	"code_postal" text,
	"localite" text,
	"pays" text DEFAULT 'BE',
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL,
	"anonymisee_le" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "roles_compte" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compte_id" uuid NOT NULL,
	"role" text NOT NULL,
	"section_slug" text,
	"attribue_le" timestamp with time zone DEFAULT now() NOT NULL,
	"attribue_par" uuid,
	"retire_le" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compte_id" uuid NOT NULL,
	"empreinte_jeton" text NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"expire_le" timestamp with time zone NOT NULL,
	"derniere_activite_le" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text,
	"agent" text
);
--> statement-breakpoint
CREATE TABLE "tentatives_connexion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"ip" text,
	"reussie" boolean NOT NULL,
	"quand" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"personne_id" uuid NOT NULL,
	"famille_id" uuid NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts_urgence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anime_id" uuid NOT NULL,
	"nom" text NOT NULL,
	"lien" text,
	"telephone" text NOT NULL,
	"ordre" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "familles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anime_id" uuid NOT NULL,
	"saison_id" uuid NOT NULL,
	"section_slug" text NOT NULL,
	"statut" text DEFAULT 'brouillon' NOT NULL,
	"nouvelle" boolean DEFAULT true NOT NULL,
	"cotisation_due_centimes" integer DEFAULT 0 NOT NULL,
	"deposee_le" timestamp with time zone,
	"validee_le" timestamp with time zone,
	"validee_par" uuid,
	"motif_refus" text,
	"remarque_famille" text,
	"remarque_staff" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responsables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"famille_id" uuid NOT NULL,
	"personne_id" uuid NOT NULL,
	"lien" text DEFAULT 'parent' NOT NULL,
	"autorite_parentale" boolean DEFAULT true NOT NULL,
	"destinataire_facture" boolean DEFAULT false NOT NULL,
	"ordre_appel" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saisons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"libelle" text NOT NULL,
	"debut" date NOT NULL,
	"fin" date NOT NULL,
	"cotisation_centimes" integer DEFAULT 0 NOT NULL,
	"cotisation_fratrie_centimes" integer,
	"ouverture_inscriptions" timestamp with time zone,
	"cloture_inscriptions" timestamp with time zone,
	"active" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consentements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inscription_id" uuid NOT NULL,
	"type" text NOT NULL,
	"accorde" boolean NOT NULL,
	"version_texte" text NOT NULL,
	"libelle_signe" text NOT NULL,
	"donne_le" timestamp with time zone DEFAULT now() NOT NULL,
	"donne_par" uuid,
	"ip" text,
	"revoque_le" timestamp with time zone,
	"revoque_par" uuid
);
--> statement-breakpoint
CREATE TABLE "demandes_rgpd" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compte_id" uuid,
	"email_demandeur" text,
	"type" text NOT NULL,
	"objet" text,
	"statut" text DEFAULT 'recue' NOT NULL,
	"reponse" text,
	"demandee_le" timestamp with time zone DEFAULT now() NOT NULL,
	"echeance_le" timestamp with time zone NOT NULL,
	"traitee_le" timestamp with time zone,
	"traitee_par" uuid
);
--> statement-breakpoint
CREATE TABLE "fiches_sante" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anime_id" uuid NOT NULL,
	"saison_id" uuid NOT NULL,
	"contenu_chiffre" "bytea" NOT NULL,
	"vecteur" "bytea" NOT NULL,
	"sceau" "bytea" NOT NULL,
	"version_cle" integer DEFAULT 1 NOT NULL,
	"a_un_point_d_attention" boolean DEFAULT false NOT NULL,
	"sait_nager" boolean,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL,
	"maj_par" uuid
);
--> statement-breakpoint
CREATE TABLE "journal_acces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compte_id" uuid,
	"action" text NOT NULL,
	"cible" text NOT NULL,
	"cible_id" uuid,
	"detail" text,
	"ip" text,
	"quand" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paiements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inscription_id" uuid NOT NULL,
	"montant_centimes" integer NOT NULL,
	"devise" text DEFAULT 'EUR' NOT NULL,
	"moyen" text NOT NULL,
	"statut" text DEFAULT 'ouvert' NOT NULL,
	"reference_mollie" text,
	"communication" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"paye_le" timestamp with time zone,
	"rembourse_le" timestamp with time zone,
	"brut" jsonb,
	"pointe_par" uuid
);
--> statement-breakpoint
ALTER TABLE "comptes" ADD CONSTRAINT "comptes_personne_id_personnes_id_fk" FOREIGN KEY ("personne_id") REFERENCES "public"."personnes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jetons" ADD CONSTRAINT "jetons_compte_id_comptes_id_fk" FOREIGN KEY ("compte_id") REFERENCES "public"."comptes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_compte" ADD CONSTRAINT "roles_compte_compte_id_comptes_id_fk" FOREIGN KEY ("compte_id") REFERENCES "public"."comptes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_compte" ADD CONSTRAINT "roles_compte_attribue_par_comptes_id_fk" FOREIGN KEY ("attribue_par") REFERENCES "public"."comptes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_compte_id_comptes_id_fk" FOREIGN KEY ("compte_id") REFERENCES "public"."comptes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animes" ADD CONSTRAINT "animes_personne_id_personnes_id_fk" FOREIGN KEY ("personne_id") REFERENCES "public"."personnes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animes" ADD CONSTRAINT "animes_famille_id_familles_id_fk" FOREIGN KEY ("famille_id") REFERENCES "public"."familles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts_urgence" ADD CONSTRAINT "contacts_urgence_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_saison_id_saisons_id_fk" FOREIGN KEY ("saison_id") REFERENCES "public"."saisons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_validee_par_comptes_id_fk" FOREIGN KEY ("validee_par") REFERENCES "public"."comptes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsables" ADD CONSTRAINT "responsables_famille_id_familles_id_fk" FOREIGN KEY ("famille_id") REFERENCES "public"."familles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsables" ADD CONSTRAINT "responsables_personne_id_personnes_id_fk" FOREIGN KEY ("personne_id") REFERENCES "public"."personnes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentements" ADD CONSTRAINT "consentements_inscription_id_inscriptions_id_fk" FOREIGN KEY ("inscription_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentements" ADD CONSTRAINT "consentements_donne_par_personnes_id_fk" FOREIGN KEY ("donne_par") REFERENCES "public"."personnes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentements" ADD CONSTRAINT "consentements_revoque_par_personnes_id_fk" FOREIGN KEY ("revoque_par") REFERENCES "public"."personnes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_rgpd" ADD CONSTRAINT "demandes_rgpd_compte_id_comptes_id_fk" FOREIGN KEY ("compte_id") REFERENCES "public"."comptes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes_rgpd" ADD CONSTRAINT "demandes_rgpd_traitee_par_comptes_id_fk" FOREIGN KEY ("traitee_par") REFERENCES "public"."comptes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiches_sante" ADD CONSTRAINT "fiches_sante_anime_id_animes_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."animes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiches_sante" ADD CONSTRAINT "fiches_sante_saison_id_saisons_id_fk" FOREIGN KEY ("saison_id") REFERENCES "public"."saisons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiches_sante" ADD CONSTRAINT "fiches_sante_maj_par_comptes_id_fk" FOREIGN KEY ("maj_par") REFERENCES "public"."comptes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_acces" ADD CONSTRAINT "journal_acces_compte_id_comptes_id_fk" FOREIGN KEY ("compte_id") REFERENCES "public"."comptes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_inscription_id_inscriptions_id_fk" FOREIGN KEY ("inscription_id") REFERENCES "public"."inscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_pointe_par_comptes_id_fk" FOREIGN KEY ("pointe_par") REFERENCES "public"."comptes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "comptes_email_idx" ON "comptes" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "comptes_personne_idx" ON "comptes" USING btree ("personne_id");--> statement-breakpoint
CREATE UNIQUE INDEX "jetons_empreinte_idx" ON "jetons" USING btree ("empreinte_jeton");--> statement-breakpoint
CREATE INDEX "personnes_nom_idx" ON "personnes" USING btree ("nom","prenom");--> statement-breakpoint
CREATE INDEX "personnes_email_idx" ON "personnes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "roles_compte_idx" ON "roles_compte" USING btree ("compte_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_jeton_idx" ON "sessions" USING btree ("empreinte_jeton");--> statement-breakpoint
CREATE INDEX "sessions_compte_idx" ON "sessions" USING btree ("compte_id");--> statement-breakpoint
CREATE INDEX "tentatives_quand_idx" ON "tentatives_connexion" USING btree ("quand");--> statement-breakpoint
CREATE INDEX "tentatives_email_idx" ON "tentatives_connexion" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "animes_personne_idx" ON "animes" USING btree ("personne_id");--> statement-breakpoint
CREATE INDEX "animes_famille_idx" ON "animes" USING btree ("famille_id");--> statement-breakpoint
CREATE INDEX "contacts_urgence_anime_idx" ON "contacts_urgence" USING btree ("anime_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inscriptions_anime_saison_idx" ON "inscriptions" USING btree ("anime_id","saison_id");--> statement-breakpoint
CREATE INDEX "inscriptions_section_idx" ON "inscriptions" USING btree ("saison_id","section_slug");--> statement-breakpoint
CREATE INDEX "inscriptions_statut_idx" ON "inscriptions" USING btree ("statut");--> statement-breakpoint
CREATE UNIQUE INDEX "responsables_famille_personne_idx" ON "responsables" USING btree ("famille_id","personne_id");--> statement-breakpoint
CREATE INDEX "responsables_personne_idx" ON "responsables" USING btree ("personne_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saisons_libelle_idx" ON "saisons" USING btree ("libelle");--> statement-breakpoint
CREATE INDEX "consentements_inscription_idx" ON "consentements" USING btree ("inscription_id");--> statement-breakpoint
CREATE INDEX "consentements_type_idx" ON "consentements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "demandes_rgpd_statut_idx" ON "demandes_rgpd" USING btree ("statut");--> statement-breakpoint
CREATE UNIQUE INDEX "fiches_sante_anime_saison_idx" ON "fiches_sante" USING btree ("anime_id","saison_id");--> statement-breakpoint
CREATE INDEX "journal_cible_idx" ON "journal_acces" USING btree ("cible","cible_id");--> statement-breakpoint
CREATE INDEX "journal_quand_idx" ON "journal_acces" USING btree ("quand");--> statement-breakpoint
CREATE INDEX "journal_compte_idx" ON "journal_acces" USING btree ("compte_id");--> statement-breakpoint
CREATE INDEX "paiements_inscription_idx" ON "paiements" USING btree ("inscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "paiements_mollie_idx" ON "paiements" USING btree ("reference_mollie");--> statement-breakpoint
CREATE INDEX "paiements_communication_idx" ON "paiements" USING btree ("communication");