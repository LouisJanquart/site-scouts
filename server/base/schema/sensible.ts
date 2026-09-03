import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, customType, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { comptes, personnes } from './comptes'
import { animes, inscriptions, saisons } from './unite'

const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType: () => 'bytea',
})

// ---------------------------------------------------------------------------
// Ce qui ne doit pas se lire à l'œil nu.
//
// La fiche santé est une donnée de l'article 9 du RGPD : allergies, traitements,
// vaccinations. On ne la range pas en clair. Le contenu est un objet JSON
// chiffré en AES-256-GCM avec une clé qui vit dans l'environnement du serveur,
// pas dans la base : voler la base ne suffit pas à lire les fiches.
//
// Conséquence assumée : on ne peut pas faire de recherche SQL là-dedans. C'est
// voulu. Les seules choses restées en clair sont deux drapeaux dont les chefs
// ont besoin d'un coup d'œil sur le terrain, et qui ne disent rien de précis.
// ---------------------------------------------------------------------------
export const fichesSante = pgTable(
  'fiches_sante',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    animeId: uuid('anime_id')
      .notNull()
      .references(() => animes.id, { onDelete: 'cascade' }),
    saisonId: uuid('saison_id')
      .notNull()
      .references(() => saisons.id, { onDelete: 'cascade' }),

    contenuChiffre: bytea('contenu_chiffre').notNull(),
    vecteur: bytea('vecteur').notNull(),
    sceau: bytea('sceau').notNull(),
    // Numéro de version de la clé, pour pouvoir en changer sans tout casser.
    versionCle: integer('version_cle').notNull().default(1),

    // Les deux seuls drapeaux en clair : ils déclenchent « va lire la fiche »,
    // ils ne disent pas quoi.
    aUnPointDAttention: boolean('a_un_point_d_attention').notNull().default(false),
    saitNager: boolean('sait_nager'),

    majLe: timestamp('maj_le', { withTimezone: true }).notNull().defaultNow(),
    majPar: uuid('maj_par').references(() => comptes.id, { onDelete: 'set null' }),
  },
  (t) => [uniqueIndex('fiches_sante_anime_saison_idx').on(t.animeId, t.saisonId)],
)

// ---------------------------------------------------------------------------
// Consentements.
//
// Un consentement se prouve : qui, quoi, quand, sur quelle version du texte.
// D'où la copie du libellé exact au moment de la signature — si le règlement
// change l'an prochain, ce qui a été accepté cette année reste lisible.
//
// Et il se retire : « revoqueLe » n'efface rien, il ferme. L'historique est la
// preuve, la ligne active est le droit.
// ---------------------------------------------------------------------------
export const consentements = pgTable(
  'consentements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inscriptionId: uuid('inscription_id')
      .notNull()
      .references(() => inscriptions.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    accorde: boolean('accorde').notNull(),
    versionTexte: text('version_texte').notNull(),
    libelleSigne: text('libelle_signe').notNull(),
    donneLe: timestamp('donne_le', { withTimezone: true }).notNull().defaultNow(),
    donnePar: uuid('donne_par').references(() => personnes.id, { onDelete: 'set null' }),
    ip: text('ip'),
    revoqueLe: timestamp('revoque_le', { withTimezone: true }),
    revoquePar: uuid('revoque_par').references(() => personnes.id, { onDelete: 'set null' }),
  },
  (t) => [
    index('consentements_inscription_idx').on(t.inscriptionId),
    index('consentements_type_idx').on(t.type),
  ],
)

// ---------------------------------------------------------------------------
// Argent.
// ---------------------------------------------------------------------------
export const paiements = pgTable(
  'paiements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inscriptionId: uuid('inscription_id')
      .notNull()
      .references(() => inscriptions.id, { onDelete: 'cascade' }),
    montantCentimes: integer('montant_centimes').notNull(),
    devise: text('devise').notNull().default('EUR'),
    moyen: text('moyen').notNull(), // mollie | virement | especes
    // ouvert | en-cours | paye | echoue | expire | annule | rembourse
    statut: text('statut').notNull().default('ouvert'),
    referenceMollie: text('reference_mollie'),
    // La communication structurée belge : +++123/4567/89012+++
    communication: text('communication'),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    payeLe: timestamp('paye_le', { withTimezone: true }),
    rembourseLe: timestamp('rembourse_le', { withTimezone: true }),
    // Le corps brut renvoyé par Mollie, gardé pour la comptabilité.
    brut: jsonb('brut'),
    pointePar: uuid('pointe_par').references(() => comptes.id, { onDelete: 'set null' }),
  },
  (t) => [
    index('paiements_inscription_idx').on(t.inscriptionId),
    uniqueIndex('paiements_mollie_idx').on(t.referenceMollie),
    index('paiements_communication_idx').on(t.communication),
  ],
)

// ---------------------------------------------------------------------------
// RGPD : la trace, et les demandes.
//
// Le journal répond à la question « qui a ouvert la fiche santé de mon fils ? ».
// Il n'est pas décoratif : sans lui, on ne peut pas répondre.
// ---------------------------------------------------------------------------
export const journalAcces = pgTable(
  'journal_acces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    compteId: uuid('compte_id').references(() => comptes.id, { onDelete: 'set null' }),
    action: text('action').notNull(), // lecture | creation | modification | suppression | export
    cible: text('cible').notNull(), // fiche-sante | inscription | anime | paiement…
    cibleId: uuid('cible_id'),
    detail: text('detail'),
    ip: text('ip'),
    quand: timestamp('quand', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('journal_cible_idx').on(t.cible, t.cibleId),
    index('journal_quand_idx').on(t.quand),
    index('journal_compte_idx').on(t.compteId),
  ],
)

export const demandesRgpd = pgTable(
  'demandes_rgpd',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    compteId: uuid('compte_id').references(() => comptes.id, { onDelete: 'set null' }),
    // Au cas où la demande vient de quelqu'un qui n'a pas (plus) de compte.
    emailDemandeur: text('email_demandeur'),
    type: text('type').notNull(), // acces | rectification | effacement | portabilite | opposition
    objet: text('objet'),
    statut: text('statut').notNull().default('recue'), // recue | en-cours | traitee | refusee
    reponse: text('reponse'),
    demandeeLe: timestamp('demandee_le', { withTimezone: true }).notNull().defaultNow(),
    // Le RGPD donne un mois. La date d'échéance est calculée à la réception.
    echeanceLe: timestamp('echeance_le', { withTimezone: true }).notNull(),
    traiteeLe: timestamp('traitee_le', { withTimezone: true }),
    traiteePar: uuid('traitee_par').references(() => comptes.id, { onDelete: 'set null' }),
  },
  (t) => [index('demandes_rgpd_statut_idx').on(t.statut)],
)

export type FicheSante = typeof fichesSante.$inferSelect
export type Consentement = typeof consentements.$inferSelect
export type Paiement = typeof paiements.$inferSelect
