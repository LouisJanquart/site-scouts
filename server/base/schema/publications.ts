import { pgTable, uuid, text, timestamp, boolean, date, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { personnes } from './comptes'

// ---------------------------------------------------------------------------
// Les actus et les événements, publiés par les staffs.
//
// À la différence des sections, la base est ici la SEULE source. Les fichiers
// server/donnees/actus.ts et evenements.ts n'ont servi qu'à la remplir une
// première fois (scripts/importer-publications.ts) : une actu, ça se crée et
// ça se supprime, ce n'est pas une correction posée sur un texte d'origine.
//
// Qui publie quoi (vérifié dans server/utils/publications.ts) :
//   - un chef, pour SA section, sans validation ;
//   - le staff d'unité, pour toute l'unité ou n'importe quelle section.
// Une actu sans section, ou qui en vise plusieurs, parle au nom de l'unité :
// elle revient au staff d'unité.
//
// « public » dit qui peut la lire : tous (visiteurs compris), parents, animes,
// chefs. « statut » dit si elle est en ligne : un brouillon ne sort que dans le
// back office.
// ---------------------------------------------------------------------------

export const actus = pgTable(
  'actus',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    titre: text('titre').notNull(),
    date: date('date').notNull(),
    // Les sections concernées. Vide = toute l'unité.
    sections: jsonb('sections').$type<string[]>().notNull().default([]),
    chapo: text('chapo').notNull().default(''),
    // Un paragraphe par entrée : c'est ce que les pages affichent, et ça évite
    // de stocker du HTML écrit par n'importe qui.
    corps: jsonb('corps').$type<string[]>().notNull().default([]),
    public: text('public').notNull().default('tous'), // tous | parents | animes | chefs
    statut: text('statut').notNull().default('brouillon'), // brouillon | publie
    // Vrai pour ce qui vient de l'import et que personne n'a encore relu : la
    // page publique affiche alors l'avertissement « à relire ».
    aRelire: boolean('a_relire').notNull().default(false),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    creePar: uuid('cree_par').references(() => personnes.id, { onDelete: 'set null' }),
    majLe: timestamp('maj_le', { withTimezone: true }).notNull().defaultNow(),
    majPar: uuid('maj_par').references(() => personnes.id, { onDelete: 'set null' }),
  },
  (t) => [uniqueIndex('actus_slug_idx').on(t.slug), index('actus_date_idx').on(t.date)],
)

export const evenements = pgTable(
  'evenements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    titre: text('titre').notNull(),
    date: date('date').notNull(),
    dateFin: date('date_fin'),
    heure: text('heure'), // « 14:00 – 17:30 », texte libre
    lieu: text('lieu').notNull().default(''),
    // Une seule section, ou null pour un rendez-vous d'unité.
    section: text('section'),
    resume: text('resume').notNull().default(''),
    description: text('description').notNull().default(''),
    public: text('public').notNull().default('tous'),
    inscription: boolean('inscription').notNull().default(false),
    photo: text('photo'),
    statut: text('statut').notNull().default('brouillon'),
    aRelire: boolean('a_relire').notNull().default(false),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    creePar: uuid('cree_par').references(() => personnes.id, { onDelete: 'set null' }),
    majLe: timestamp('maj_le', { withTimezone: true }).notNull().defaultNow(),
    majPar: uuid('maj_par').references(() => personnes.id, { onDelete: 'set null' }),
  },
  (t) => [
    uniqueIndex('evenements_slug_idx').on(t.slug),
    index('evenements_date_idx').on(t.date),
    index('evenements_section_idx').on(t.section),
  ],
)

export type ActuEnBase = typeof actus.$inferSelect
export type EvenementEnBase = typeof evenements.$inferSelect
