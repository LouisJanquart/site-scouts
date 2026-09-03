/**
 * Semer la base : la saison en cours, les comptes du staff d'unité, et — en
 * développement seulement — quelques familles pour avoir de quoi regarder.
 *
 *   npm run base:semer            → saison + comptes staff
 *   npm run base:semer -- --faux  → ajoute des familles fictives
 */
import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'
import * as schema from '../server/base/schema/index.ts'

const scryptAsync = promisify(scrypt)

async function hacher(clair: string) {
  const sel = randomBytes(16)
  const d = (await scryptAsync(clair.normalize('NFKC'), sel, 64, {
    N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024,
  })) as Buffer
  return `scrypt$${2 ** 17}$8$1$${sel.toString('base64')}$${d.toString('base64')}`
}

const url = process.env.NUXT_BASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('NUXT_BASE_URL manquant.')
const sql = postgres(url, { max: 1 })
const base = drizzle(sql, { schema })

const { personnes, comptes, rolesCompte, saisons } = schema

async function main() {
  const faux = process.argv.includes('--faux')

  // --- La saison -----------------------------------------------------------
  const libelle = '2026-2027'
  let [saison] = await base.select().from(saisons).where(eq(saisons.libelle, libelle)).limit(1)
  if (!saison) {
    ;[saison] = await base
      .insert(saisons)
      .values({
        libelle,
        debut: '2026-09-01',
        fin: '2027-08-31',
        // À ajuster par le staff d'unité : ce sont des montants de départ.
        cotisationCentimes: 8000,
        cotisationFratrieCentimes: 6500,
        ouvertureInscriptions: new Date('2026-06-01T00:00:00Z'),
        clotureInscriptions: new Date('2026-11-30T23:59:59Z'),
        active: true,
      })
      .returning()
    console.log('· saison', libelle, 'créée')
  } else {
    console.log('· saison', libelle, 'déjà là')
  }

  // --- Le premier compte CU ------------------------------------------------
  // Mot de passe provisoire, à changer à la première connexion.
  const emailCU = process.env.SEMER_EMAIL_CU ?? 'staffu.16efleurus@gmail.com'
  const [dejaLa] = await base.select().from(comptes).where(eq(comptes.email, emailCU)).limit(1)
  if (!dejaLa) {
    const provisoire = randomBytes(9).toString('base64url')
    const [p] = await base
      .insert(personnes)
      .values({ prenom: 'Staff', nom: 'd’unité', email: emailCU })
      .returning()
    const [c] = await base
      .insert(comptes)
      .values({
        personneId: p!.id,
        email: emailCU,
        empreinte: await hacher(provisoire),
        doitChangerMdp: true,
      })
      .returning()
    await base.insert(rolesCompte).values({ compteId: c!.id, role: 'cu' })
    console.log('· compte CU créé :', emailCU)
    console.log('  mot de passe provisoire :', provisoire)
    console.log('  (à changer à la première connexion — il n’est écrit nulle part ailleurs)')
  } else {
    console.log('· compte CU déjà là')
  }

  if (faux) await semerDesFamillesFictives()
  await sql.end()
}

async function semerDesFamillesFictives() {
  const { familles, animes, responsables, inscriptions, fichesSante, consentements } = schema
  const { chiffrer } = await import('./chiffrer-hors-nitro.ts')
  const [saison] = await base.select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) return

  const jeux = [
    { nom: 'Dubois', parent: ['Claire', 'claire.dubois@example.be'], enfants: [['Nina', '2016-04-12', 'lutins', 'f'], ['Tom', '2014-09-03', 'louveteaux', 'm']] },
    { nom: 'Lemaire', parent: ['Marc', 'marc.lemaire@example.be'], enfants: [['Élise', '2012-01-22', 'guides', 'f']] },
    { nom: 'Nkosi', parent: ['Awa', 'awa.nkosi@example.be'], enfants: [['Samuel', '2019-06-30', 'nutons', 'm']] },
    { nom: 'Vandenberghe', parent: ['Sofie', 'sofie.v@example.be'], enfants: [['Lou', '2011-11-08', 'scouts', 'm']] },
  ] as const

  for (const f of jeux) {
    const [famille] = await base.insert(familles).values({ nom: f.nom }).returning()
    const [pp] = await base
      .insert(personnes)
      .values({ prenom: f.parent[0], nom: f.nom, email: f.parent[1], telephone: '+32470000000',
        rue: 'Rue de l’Exemple', numero: '1', codePostal: '6220', localite: 'Fleurus' })
      .returning()
    const [cc] = await base
      .insert(comptes)
      .values({ personneId: pp!.id, email: f.parent[1], empreinte: await hacher('essai-de-mot-de-passe'), emailVerifieLe: new Date() })
      .returning()
    await base.insert(rolesCompte).values({ compteId: cc!.id, role: 'parent' })
    await base.insert(responsables).values({
      familleId: famille!.id, personneId: pp!.id, lien: 'parent',
      autoriteParentale: true, destinataireFacture: true, ordreAppel: 1,
    })

    for (const [prenom, naissance, section, genre] of f.enfants) {
      const [pe] = await base
        .insert(personnes)
        .values({ prenom, nom: f.nom, dateNaissance: naissance, genre,
          rue: 'Rue de l’Exemple', numero: '1', codePostal: '6220', localite: 'Fleurus' })
        .returning()
      const [a] = await base.insert(animes).values({ personneId: pe!.id, familleId: famille!.id }).returning()
      const [ins] = await base
        .insert(inscriptions)
        .values({
          animeId: a!.id, saisonId: saison.id, sectionSlug: section,
          statut: 'validee', cotisationDueCentimes: saison.cotisationCentimes,
          deposeeLe: new Date(), valideeLe: new Date(),
        })
        .returning()
      const coffre = chiffrer({ allergies: [], regimesAlimentaires: [], traitements: [], saitNager: true })
      await base.insert(fichesSante).values({
        animeId: a!.id, saisonId: saison.id,
        contenuChiffre: coffre.contenuChiffre, vecteur: coffre.vecteur, sceau: coffre.sceau,
        saitNager: true,
      })
      await base.insert(consentements).values({
        inscriptionId: ins!.id, type: 'participation', accorde: true,
        versionTexte: '2026-09', libelleSigne: 'Participation aux activités', donnePar: pp!.id,
      })
    }
    console.log('· famille', f.nom, 'créée (mot de passe : essai-de-mot-de-passe)')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
