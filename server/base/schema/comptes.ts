import {
  pgTable, uuid, text, timestamp, boolean, date, integer, index, uniqueIndex,
} from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// Identité et accès.
//
// Une PERSONNE est un être humain : un enfant, un parent, un chef. Un COMPTE
// est un moyen de se connecter. Les deux sont séparés volontairement :
//   - un animé de huit ans existe dans la base sans jamais avoir de compte ;
//   - un chef qui est aussi parent d'un animé n'a qu'une personne, un compte,
//     et deux rôles ;
//   - effacer un compte (droit à l'oubli côté accès) ne fait pas disparaître
//     l'historique d'inscription, qui a sa propre durée de conservation.
// ---------------------------------------------------------------------------

export const personnes = pgTable(
  'personnes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prenom: text('prenom').notNull(),
    nom: text('nom').notNull(),
    // Le totem, quand il y en a un. C'est le nom d'usage dans l'unité.
    totem: text('totem'),
    dateNaissance: date('date_naissance'),
    // Champ libre et facultatif : on ne fait pas de case à cocher normative.
    genre: text('genre'),
    email: text('email'),
    telephone: text('telephone'),
    rue: text('rue'),
    numero: text('numero'),
    codePostal: text('code_postal'),
    localite: text('localite'),
    pays: text('pays').default('BE'),
    // Numéro de registre national : JAMAIS stocké. Voir docs/rgpd.md.
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    majLe: timestamp('maj_le', { withTimezone: true }).notNull().defaultNow(),
    // Anonymisation : on garde la ligne (elle porte des liens comptables) mais
    // on vide les champs nominatifs. Voir purgerDonneesExpirees().
    anonymiseeLe: timestamp('anonymisee_le', { withTimezone: true }),
  },
  (t) => [
    index('personnes_nom_idx').on(t.nom, t.prenom),
    index('personnes_email_idx').on(t.email),
  ],
)

export const comptes = pgTable(
  'comptes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    personneId: uuid('personne_id')
      .notNull()
      .references(() => personnes.id, { onDelete: 'cascade' }),
    // Toujours rangé en minuscules : c'est l'identifiant de connexion.
    email: text('email').notNull(),
    // scrypt, salt compris, dans une seule chaîne. Voir server/utils/motDePasse.ts.
    empreinte: text('empreinte').notNull(),
    emailVerifieLe: timestamp('email_verifie_le', { withTimezone: true }),
    // Posé quand le compte a été créé par un tiers (invitation d'un chef).
    doitChangerMdp: boolean('doit_changer_mdp').notNull().default(false),
    derniereConnexionLe: timestamp('derniere_connexion_le', { withTimezone: true }),
    desactiveLe: timestamp('desactive_le', { withTimezone: true }),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('comptes_email_idx').on(t.email),
    uniqueIndex('comptes_personne_idx').on(t.personneId),
  ],
)

// Les rôles sont cumulables : un chef peut être parent, un CU est aussi chef.
// Un rôle « chef » est toujours attaché à une section ; « cu » ne l'est pas.
export const rolesCompte = pgTable(
  'roles_compte',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    compteId: uuid('compte_id')
      .notNull()
      .references(() => comptes.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // parent | anime | chef | cu | tresorier
    sectionSlug: text('section_slug'),
    attribueLe: timestamp('attribue_le', { withTimezone: true }).notNull().defaultNow(),
    attribuePar: uuid('attribue_par').references(() => comptes.id, { onDelete: 'set null' }),
    retireLe: timestamp('retire_le', { withTimezone: true }),
  },
  (t) => [index('roles_compte_idx').on(t.compteId)],
)

// Une session = un jeton dans un cookie. On ne range que son empreinte : une
// fuite de la base ne permet pas de rejouer les sessions en cours.
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    compteId: uuid('compte_id')
      .notNull()
      .references(() => comptes.id, { onDelete: 'cascade' }),
    empreinteJeton: text('empreinte_jeton').notNull(),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    expireLe: timestamp('expire_le', { withTimezone: true }).notNull(),
    derniereActiviteLe: timestamp('derniere_activite_le', { withTimezone: true })
      .notNull()
      .defaultNow(),
    ip: text('ip'),
    agent: text('agent'),
  },
  (t) => [
    uniqueIndex('sessions_jeton_idx').on(t.empreinteJeton),
    index('sessions_compte_idx').on(t.compteId),
  ],
)

// Jetons à usage unique : vérification d'adresse, mot de passe oublié,
// invitation d'un chef. Même principe : on ne range que l'empreinte.
export const jetons = pgTable(
  'jetons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    compteId: uuid('compte_id')
      .notNull()
      .references(() => comptes.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // verification | reinitialisation | invitation
    empreinteJeton: text('empreinte_jeton').notNull(),
    expireLe: timestamp('expire_le', { withTimezone: true }).notNull(),
    utiliseLe: timestamp('utilise_le', { withTimezone: true }),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('jetons_empreinte_idx').on(t.empreinteJeton)],
)

// Limitation des essais : sur l'adresse ET sur l'IP, pour freiner à la fois le
// bourrage de mots de passe sur un compte et le balayage d'adresses.
export const tentativesConnexion = pgTable(
  'tentatives_connexion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email'),
    ip: text('ip'),
    reussie: boolean('reussie').notNull(),
    quand: timestamp('quand', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('tentatives_quand_idx').on(t.quand), index('tentatives_email_idx').on(t.email)],
)

export type Personne = typeof personnes.$inferSelect
export type Compte = typeof comptes.$inferSelect
export type RoleCompte = typeof rolesCompte.$inferSelect
