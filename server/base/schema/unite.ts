import { pgTable, uuid, text, timestamp, boolean, date, integer, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { personnes, comptes } from './comptes'

// ---------------------------------------------------------------------------
// La vie de l'unité : les saisons, les familles, les animés, les inscriptions.
// ---------------------------------------------------------------------------

// Une saison scoute va de septembre à août. C'est elle qui porte le montant de
// la cotisation et les dates d'ouverture des inscriptions.
export const saisons = pgTable(
  'saisons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    libelle: text('libelle').notNull(), // « 2026-2027 »
    debut: date('debut').notNull(),
    fin: date('fin').notNull(),
    // En centimes, comme partout où il est question d'argent : pas de flottant.
    cotisationCentimes: integer('cotisation_centimes').notNull().default(0),
    // Dégressivité fratrie : montant appliqué au deuxième enfant, au troisième…
    cotisationFratrieCentimes: integer('cotisation_fratrie_centimes'),
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
