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
import { baremeParDefaut, calculerCotisations } from '../shared/cotisations.ts'

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

  // --- La saison ---------------------------------------------------------
  const libelle = '2026-2027'
  let [saison] = await base.select().from(saisons).where(eq(saisons.libelle, libelle)).limit(1)
  if (!saison) {
    ;[saison] = await base
      .insert(saisons)
      .values({
        libelle,
        debut: '2026-09-01',
        fin: '2027-08-31',
        // Le barème d'affiliation de la fédération. Voir shared/cotisations.ts
        // pour la source et les règles.
        bareme: baremeParDefaut,
        // Ce que l'unité ajoute par enfant, au-delà de l'affiliation, pour le
        // matériel et le local. À trancher par le staff d'unité : mis à zéro
        // pour l'instant, on ne facture pas ce que personne n'a décidé.
        supplementLocalCentimes: 0,
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
  const { familles, animes, responsables, inscriptions, fichesSante, consentements, paiements } = schema
  const { chiffrer } = await import('./chiffrer-hors-nitro.ts')
  const [saison] = await base.select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) return

  // -------------------------------------------------------------------------
  // Un jeu de familles conçu pour montrer le barème à l'œuvre, pas pour faire
  // du nombre. Chacune illustre un cas que le staff d'unité rencontrera :
  // l'enfant unique, la fratrie de deux puis de trois, l'aîné à la Route qui ne
  // fait pas baisser le tarif des cadets, le frère inscrit chez les Scouts que
  // la fédération compte quand même, le tarif social, l'inscription tardive.
  //
  // Les montants ne sont pas écrits ici : ils sont calculés par le même code
  // que le site. Si le barème change, ce jeu de données change avec lui.
  // -------------------------------------------------------------------------
  type Enfant = {
    prenom: string
    naissance: string
    section: string
    genre: 'f' | 'm'
    brevete?: boolean
    tardive?: boolean
  }
  type Cas = {
    nom: string
    parent: [string, string, 'mere' | 'pere']
    localite?: string
    tarifSocial?: boolean
    membresAilleurs?: number
    note?: string
    enfants: Enfant[]
  }

  const jeux: Cas[] = [
    {
      nom: 'Nkosi', parent: ['Awa', 'awa.nkosi@example.be', 'mere'],
      note: 'enfant unique, tarif plein',
      enfants: [{ prenom: 'Samuel', naissance: '2020-06-30', section: 'nutons', genre: 'm' }],
    },
    {
      nom: 'Dubois', parent: ['Claire', 'claire.dubois@example.be', 'mere'],
      note: 'deux enfants : les DEUX passent au tarif famille',
      enfants: [
        { prenom: 'Nina', naissance: '2016-04-12', section: 'lutins', genre: 'f' },
        { prenom: 'Tom', naissance: '2015-09-03', section: 'louveteaux', genre: 'm' },
      ],
    },
    {
      nom: 'Lemaire', parent: ['Marc', 'marc.lemaire@example.be', 'pere'],
      note: 'trois enfants, trois sections différentes',
      enfants: [
        { prenom: 'Élise', naissance: '2012-01-22', section: 'guides', genre: 'f' },
        { prenom: 'Jules', naissance: '2014-07-09', section: 'louveteaux', genre: 'm' },
        { prenom: 'Alice', naissance: '2020-02-14', section: 'nutons', genre: 'f' },
      ],
    },
    {
      nom: 'Vandenberghe', parent: ['Sofie', 'sofie.vandenberghe@example.be', 'mere'],
      localite: 'Wanfercée-Baulet',
      note: 'quatre enfants',
      enfants: [
        { prenom: 'Lou', naissance: '2011-11-08', section: 'scouts', genre: 'm' },
        { prenom: 'Manon', naissance: '2013-03-27', section: 'guides', genre: 'f' },
        { prenom: 'Basile', naissance: '2016-08-19', section: 'louveteaux', genre: 'm' },
        { prenom: 'Colette', naissance: '2019-12-05', section: 'nutons', genre: 'f' },
      ],
    },
    {
      nom: 'Peeters', parent: ['Isabelle', 'isabelle.peeters@example.be', 'mere'],
      membresAilleurs: 1,
      note: 'un enfant ici, un frère chez les Scouts : tarif famille quand même',
      enfants: [{ prenom: 'Margaux', naissance: '2013-05-16', section: 'guides', genre: 'f' }],
    },
    {
      nom: 'Bertrand', parent: ['Philippe', 'philippe.bertrand@example.be', 'pere'],
      note: 'aîné à la Route (assurance seule) : il ne fait pas baisser le tarif des cadets',
      enfants: [
        { prenom: 'Antoine', naissance: '2006-04-03', section: 'route', genre: 'm' },
        { prenom: 'Camille', naissance: '2015-10-21', section: 'lutins', genre: 'f' },
      ],
    },
    {
      nom: 'Diallo', parent: ['Fatou', 'fatou.diallo@example.be', 'mere'],
      tarifSocial: true,
      note: 'tarif social accordé par le staff d’unité',
      enfants: [
        { prenom: 'Ibrahim', naissance: '2014-02-11', section: 'louveteaux', genre: 'm' },
        { prenom: 'Aïssatou', naissance: '2017-06-25', section: 'lutins', genre: 'f' },
      ],
    },
    {
      nom: 'Wauters', parent: ['Nathalie', 'nathalie.wauters@example.be', 'mere'],
      note: 'inscription déposée après le 1er avril : assurance seule',
      enfants: [{ prenom: 'Théo', naissance: '2012-09-30', section: 'scouts', genre: 'm', tardive: true }],
    },
    {
      nom: 'Renard', parent: ['Céline', 'celine.renard@example.be', 'mere'],
      note: 'une Pio animatrice brevetée : cinq euros de moins',
      enfants: [{ prenom: 'Léa', naissance: '2009-03-18', section: 'pios', genre: 'f', brevete: true }],
    },
    {
      nom: 'Moreau', parent: ['Julien', 'julien.moreau@example.be', 'pere'],
      enfants: [
        { prenom: 'Gaspard', naissance: '2017-01-07', section: 'louveteaux', genre: 'm' },
        { prenom: 'Rose', naissance: '2019-05-23', section: 'nutons', genre: 'f' },
      ],
    },
    {
      nom: 'Simon', parent: ['Anne', 'anne.simon@example.be', 'mere'],
      localite: 'Lambusart',
      enfants: [{ prenom: 'Zoé', naissance: '2018-11-02', section: 'lutins', genre: 'f' }],
    },
    {
      nom: 'Gilson', parent: ['Damien', 'damien.gilson@example.be', 'pere'],
      enfants: [
        { prenom: 'Noé', naissance: '2010-08-14', section: 'scouts', genre: 'm' },
        { prenom: 'Lila', naissance: '2011-04-29', section: 'guides', genre: 'f' },
        { prenom: 'Ari', naissance: '2018-02-08', section: 'louveteaux', genre: 'm' },
      ],
    },
    {
      nom: 'Habran', parent: ['Véronique', 'veronique.habran@example.be', 'mere'],
      enfants: [{ prenom: 'Emma', naissance: '2009-10-11', section: 'pios', genre: 'f' }],
    },
    {
      nom: 'Toussaint', parent: ['Sarah', 'sarah.toussaint@example.be', 'mere'],
      localite: 'Fleurus',
      enfants: [
        { prenom: 'Nour', naissance: '2016-12-19', section: 'lutins', genre: 'f' },
        { prenom: 'Adam', naissance: '2019-08-04', section: 'nutons', genre: 'm' },
      ],
    },
  ]

  // Quelques fiches santé variées : la plupart sans rien à signaler, quelques-unes
  // avec de quoi faire apparaître le drapeau côté chef.
  const santes = [
    { allergies: [], regimesAlimentaires: [], traitements: [], saitNager: true },
    { allergies: ['Arachides'], regimesAlimentaires: [], traitements: [], saitNager: true,
      antecedents: 'Réaction sévère : trousse d’urgence dans son sac.' },
    { allergies: [], regimesAlimentaires: ['Sans porc'], traitements: [], saitNager: false },
    { allergies: ['Piqûres de guêpe'], regimesAlimentaires: [], saitNager: true,
      traitements: [{ libelle: 'Ventoline', posologie: 'en cas de crise', autonome: true }] },
    { allergies: [], regimesAlimentaires: ['Végétarien'], traitements: [], saitNager: true },
    { allergies: [], regimesAlimentaires: [], traitements: [], saitNager: false,
      remarques: 'Dort mal la première nuit de camp.' },
  ]

  const apresLePremierAvril = new Date('2027-04-14T10:00:00Z')
  let i = 0

  for (const cas of jeux) {
    const [famille] = await base
      .insert(familles)
      .values({
        nom: cas.nom,
        tarifSocial: cas.tarifSocial ?? false,
        tarifSocialAccordeLe: cas.tarifSocial ? new Date() : null,
        membresAilleurs: cas.membresAilleurs ?? 0,
      })
      .returning()

    const localite = cas.localite ?? 'Fleurus'
    const [pp] = await base
      .insert(personnes)
      .values({
        prenom: cas.parent[0], nom: cas.nom, email: cas.parent[1],
        telephone: `+3247${String(1000000 + i * 13457).slice(0, 7)}`,
        rue: 'Rue de l’Exemple', numero: String(10 + i), codePostal: '6220', localite,
      })
      .returning()
    const [cc] = await base
      .insert(comptes)
      .values({
        personneId: pp!.id, email: cas.parent[1],
        empreinte: await hacher('essai-de-mot-de-passe'), emailVerifieLe: new Date(),
      })
      .returning()
    await base.insert(rolesCompte).values({ compteId: cc!.id, role: 'parent' })
    await base.insert(responsables).values({
      familleId: famille!.id, personneId: pp!.id, lien: cas.parent[2],
      autoriteParentale: true, destinataireFacture: true, ordreAppel: 1,
    })

    const deposees: { id: string; enfant: Enfant }[] = []

    for (const e of cas.enfants) {
      const [pe] = await base
        .insert(personnes)
        .values({
          prenom: e.prenom, nom: cas.nom, dateNaissance: e.naissance, genre: e.genre,
          rue: 'Rue de l’Exemple', numero: String(10 + i), codePostal: '6220', localite,
        })
        .returning()
      const [a] = await base
        .insert(animes)
        .values({ personneId: pe!.id, familleId: famille!.id })
        .returning()
      const [ins] = await base
        .insert(inscriptions)
        .values({
          animeId: a!.id, saisonId: saison.id, sectionSlug: e.section,
          statut: 'validee', cotisationDueCentimes: 0,
          brevete: e.brevete ?? false,
          deposeeLe: e.tardive ? apresLePremierAvril : new Date('2026-09-01T12:00:00Z'),
          valideeLe: new Date(),
        })
        .returning()
      deposees.push({ id: ins!.id, enfant: e })

      const contenu = santes[i % santes.length]!
      const coffre = chiffrer(contenu)
      await base.insert(fichesSante).values({
        animeId: a!.id, saisonId: saison.id,
        contenuChiffre: coffre.contenuChiffre, vecteur: coffre.vecteur, sceau: coffre.sceau,
        aUnPointDAttention: Boolean(
          contenu.allergies.length || contenu.traitements.length ||
          contenu.regimesAlimentaires.length || (contenu as any).antecedents,
        ),
        saitNager: contenu.saitNager,
      })
      await base.insert(consentements).values({
        inscriptionId: ins!.id, type: 'participation', accorde: true,
        versionTexte: '2026-09', libelleSigne: 'Participation aux activités', donnePar: pp!.id,
      })
      i++
    }

    // Le calcul, avec le même code que le site.
    const lignes = calculerCotisations(
      deposees.map((d) => ({
        cle: d.id,
        sectionSlug: d.enfant.section,
        deposeeLe: d.enfant.tardive ? '2027-04-14' : '2026-09-01',
        tarifSocial: cas.tarifSocial,
        brevete: d.enfant.brevete,
      })),
      {
        bareme: (saison.bareme as any) ?? baremeParDefaut,
        membresAilleurs: cas.membresAilleurs ?? 0,
        saisonDebut: String(saison.debut),
      },
    )

    const detail: string[] = []
    for (const l of lignes) {
      const montant = l.montantCentimes + (l.motif === 'social' ? 0 : saison.supplementLocalCentimes)
      await base
        .update(inscriptions)
        .set({ cotisationDueCentimes: montant, motifTarif: l.motif })
        .where(eq(inscriptions.id, l.cle))

      // Une famille sur trois a déjà payé : de quoi voir les deux états dans
      // le suivi de caisse.
      const paye = deposees.findIndex((d) => d.id === l.cle) % 3 !== 2
      await base.insert(paiements).values({
        inscriptionId: l.cle,
        montantCentimes: montant,
        moyen: paye ? 'virement' : 'virement',
        statut: paye ? 'paye' : 'ouvert',
        payeLe: paye ? new Date() : null,
        communication: communicationStructuree(2026 * 1_000_000 + Math.floor(Math.random() * 1e6)),
      })

      const nom = deposees.find((d) => d.id === l.cle)!.enfant.prenom
      detail.push(`${nom} ${(montant / 100).toFixed(2)} € (${l.motif})`)
    }

    console.log(`· ${cas.nom} — ${detail.join(', ')}${cas.note ? `  ← ${cas.note}` : ''}`)
  }

  console.log('\n  Toutes ces familles ont le mot de passe : essai-de-mot-de-passe')
}

// La communication structurée belge, recopiée ici : le script tourne hors de
// Nitro, où les fonctions auto-importées n'existent pas.
function communicationStructuree(numero: number): string {
  const base10 = String(Math.abs(Math.trunc(numero))).padStart(10, '0').slice(-10)
  const reste = Number(base10) % 97 || 97
  const douze = base10 + String(reste).padStart(2, '0')
  return `+++${douze.slice(0, 3)}/${douze.slice(3, 7)}/${douze.slice(7)}+++`
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
