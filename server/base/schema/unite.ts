import { pgTable, uuid, text, timestamp, boolean, date, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { personnes, comptes } from './comptes'

// ---------------------------------------------------------------------------
// La vie de l'unité : les saisons, les familles, les animés, les inscriptions.
// ---------------------------------------------------------------------------

// Une saison scoute va de septembre à août. C'est elle qui porte le barème des
// cotisations et les dates d'ouverture des inscriptions.
export const saisons = pgTable(
  'saisons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    libelle: text('libelle').notNull(), // « 2026-2027 »
    debut: date('debut').notNull(),
    fin: date('fin').notNull(),
    // Le barème d'affiliation de la fédération, tel qu'il s'applique cette
    // saison-là. Laissé vide, c'est celui de shared/cotisations.ts qui sert.
    // Le stocker permet au staff d'unité de corriger un montant sans attendre
    // un déploiement — et de garder la trace du barème réellement appliqué une
    // fois la saison passée.
    bareme: jsonb('bareme'),
    // Ce que l'unité ajoute par enfant, au-delà de l'affiliation, pour le
    // matériel et le local. En centimes, comme partout où il est question
    // d'argent : pas de flottant.
    supplementLocalCentimes: integer('supplement_local_centimes').notNull().default(0),
    ouvertureInscriptions: timestamp('ouverture_inscriptions', { withTimezone: true }),
    clotureInscriptions: timestamp('cloture_inscriptions', { withTimezone: true }),
    active: boolean('active').notNull().default(false),
  },
  (t) => [uniqueIndex('saisons_libelle_idx').on(t.libelle)],
)

// Une famille regroupe une fratrie et ses responsables. C'est l'unité de
// facturation (dégressivité) et de correspondance.
export const familles = pgTable('familles', {
  id: uuid('id').primaryKey().defaultRandom(),
  nom: text('nom').notNull(),
  // Le tarif social ne se demande pas dans le formulaire : il s'accorde, par le
  // staff d'unité, après une conversation. C'est volontaire — personne ne
  // devrait avoir à cocher « je suis en difficulté » devant un écran.
  tarifSocial: boolean('tarif_social').notNull().default(false),
  tarifSocialAccordeLe: timestamp('tarif_social_accorde_le', { withTimezone: true }),
  // Frères et sœurs inscrits dans une AUTRE unité affiliée aux Scouts. La
  // fédération les compte dans le tarif famille ; le site, qui ne voit que ses
  // propres inscrits, ne peut pas le deviner. Renseigné à la main par le staff.
  membresAilleurs: integer('membres_ailleurs').notNull().default(0),
  creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
})

export const animes = pgTable(
  'animes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    personneId: uuid('personne_id')
      .notNull()
      .references(() => personnes.id, { onDelete: 'restrict' }),
    familleId: uuid('famille_id')
      .notNull()
      .references(() => familles.id, { onDelete: 'restrict' }),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('animes_personne_idx').on(t.personneId), index('animes_famille_idx').on(t.familleId)],
)

// Le lien entre un adulte et une famille. « autoriteParentale » décide qui peut
// signer les autorisations ; « destinataireFacture » qui reçoit l'appel de
// cotisation ; « ordreAppel » dans quel ordre on téléphone en cas de pépin.
export const responsables = pgTable(
  'responsables',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familleId: uuid('famille_id')
      .notNull()
      .references(() => familles.id, { onDelete: 'cascade' }),
    personneId: uuid('personne_id')
      .notNull()
      .references(() => personnes.id, { onDelete: 'restrict' }),
    lien: text('lien').notNull().default('parent'), // mere | pere | parent | tuteur | autre
    autoriteParentale: boolean('autorite_parentale').notNull().default(true),
    destinataireFacture: boolean('destinataire_facture').notNull().default(false),
    ordreAppel: integer('ordre_appel').notNull().default(1),
  },
  (t) => [
    uniqueIndex('responsables_famille_personne_idx').on(t.familleId, t.personneId),
    index('responsables_personne_idx').on(t.personneId),
  ],
)

// Une inscription, c'est un animé, une saison, une section, un statut.
export const inscriptions = pgTable(
  'inscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    animeId: uuid('anime_id')
      .notNull()
      .references(() => animes.id, { onDelete: 'cascade' }),
    saisonId: uuid('saison_id')
      .notNull()
      .references(() => saisons.id, { onDelete: 'restrict' }),
    sectionSlug: text('section_slug').notNull(),
    // brouillon → envoyee → en-attente-paiement → validee
    //                    ↘ refusee / annulee
    statut: text('statut').notNull().default('brouillon'),
    // Un rappel : nouvel arrivant ou renouvellement. Change le suivi côté staff.
    nouvelle: boolean('nouvelle').notNull().default(true),
    cotisationDueCentimes: integer('cotisation_due_centimes').notNull().default(0),
    // Pourquoi ce montant-là : plein, famille-2, famille-3, social, route,
    // tardive. Affiché à la famille et au trésorier — un montant sans raison
    // est un montant qu'on conteste.
    motifTarif: text('motif_tarif'),
    // L'animé est un animateur breveté (cas des Pios et de la Route).
    brevete: boolean('brevete').notNull().default(false),
    deposeeLe: timestamp('deposee_le', { withTimezone: true }),
    valideeLe: timestamp('validee_le', { withTimezone: true }),
    valideePar: uuid('validee_par').references(() => comptes.id, { onDelete: 'set null' }),
    motifRefus: text('motif_refus'),
    remarqueFamille: text('remarque_famille'),
    remarqueStaff: text('remarque_staff'),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    majLe: timestamp('maj_le', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('inscriptions_anime_saison_idx').on(t.animeId, t.saisonId),
    index('inscriptions_section_idx').on(t.saisonId, t.sectionSlug),
    index('inscriptions_statut_idx').on(t.statut),
  ],
)

// Les personnes à appeler s'il arrive quelque chose, en plus des responsables.
export const contactsUrgence = pgTable(
  'contacts_urgence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    animeId: uuid('anime_id')
      .notNull()
      .references(() => animes.id, { onDelete: 'cascade' }),
    nom: text('nom').notNull(),
    lien: text('lien'),
    telephone: text('telephone').notNull(),
    ordre: integer('ordre').notNull().default(1),
  },
  (t) => [index('contacts_urgence_anime_idx').on(t.animeId)],
)

export type Saison = typeof saisons.$inferSelect
export type Anime = typeof animes.$inferSelect
export type Inscription = typeof inscriptions.$inferSelect
