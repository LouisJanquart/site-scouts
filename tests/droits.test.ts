import { describe, it, expect, beforeAll } from 'vitest'
import { navigateur, ouvrirLaSaison, dossier, donnerRole, sql } from './aide'

// ---------------------------------------------------------------------------
// Les règles d'accès.
//
// C'est le test le plus important du projet. Il ne vérifie pas que le site est
// joli : il vérifie qu'un parent ne peut pas lire la fiche santé de l'enfant du
// voisin, et qu'un chef de section ne peut pas lire celle d'une autre section.
//
// Chaque cas est écrit comme une phrase : « un X ne doit pas pouvoir Y ».
// ---------------------------------------------------------------------------

let dubois: ReturnType<typeof navigateur>
let lemaire: ReturnType<typeof navigateur>
let cheffeLutins: ReturnType<typeof navigateur>
let cu: ReturnType<typeof navigateur>
let anonyme: ReturnType<typeof navigateur>

let animeDubois: string
let animeLemaire: string
let inscriptionDubois: string

beforeAll(async () => {
  await ouvrirLaSaison()

  // Deux familles sans aucun lien entre elles.
  dubois = navigateur()
  const r1 = await dubois.appel('/api/inscriptions', {
    method: 'POST',
    body: JSON.stringify(dossier('Nina', 'Dubois', 'lutins')),
  })
  expect(r1.statut).toBe(200)
  inscriptionDubois = r1.corps.inscriptionId

  lemaire = navigateur()
  const r2 = await lemaire.appel('/api/inscriptions', {
    method: 'POST',
    body: JSON.stringify(dossier('Élise', 'Lemaire', 'guides', '2012-01-22')),
  })
  expect(r2.statut).toBe(200)

  const lignes = await sql<{ id: string; prenom: string }[]>`
    select a.id, p.prenom from animes a join personnes p on p.id = a.personne_id
  `
  animeDubois = lignes.find((l) => l.prenom === 'Nina')!.id
  animeLemaire = lignes.find((l) => l.prenom === 'Élise')!.id

  // Une cheffe de Lutins, et un CU. On leur fabrique un compte via une
  // inscription, puis on leur donne le rôle — c'est exactement ce que fera le
  // CU depuis le back office.
  cheffeLutins = navigateur()
  await cheffeLutins.appel('/api/inscriptions', {
    method: 'POST',
    body: JSON.stringify(dossier('Jeanne', 'Cheffe', 'lutins', '2015-05-05')),
  })
  await donnerRole('cheffe@example.be', 'chef', 'lutins')

  cu = navigateur()
  await cu.appel('/api/inscriptions', {
    method: 'POST',
    body: JSON.stringify(dossier('Paul', 'Unite', 'lutins', '2015-06-06')),
  })
  await donnerRole('unite@example.be', 'cu')

  anonyme = navigateur()
})

describe('sans compte', () => {
  it('ne peut pas ouvrir un dossier', async () => {
    const r = await anonyme.appel(`/api/animes/${animeDubois}`)
    expect(r.statut).toBe(401)
  })

  it('ne peut pas ouvrir une fiche santé', async () => {
    const r = await anonyme.appel(`/api/animes/${animeDubois}/sante`)
    expect(r.statut).toBe(401)
  })

  it('ne peut pas lister les animés du staff', async () => {
    const r = await anonyme.appel('/api/staff/animes')
    expect(r.statut).toBe(401)
  })

  it('voit quand même la saison, qui est publique', async () => {
    const r = await anonyme.appel('/api/saison')
    expect(r.statut).toBe(200)
    expect(r.corps.ouverte).toBe(true)
  })
})

describe('un parent', () => {
  it('ouvre le dossier de son enfant', async () => {
    const r = await dubois.appel(`/api/animes/${animeDubois}`)
    expect(r.statut).toBe(200)
    expect(r.corps.anime.prenom).toBe('Nina')
    expect(r.corps.motif).toBe('responsable')
  })

  it('lit la fiche santé de son enfant', async () => {
    const r = await dubois.appel(`/api/animes/${animeDubois}/sante`)
    expect(r.statut).toBe(200)
    expect(r.corps.contenu.allergies).toContain('Arachides')
  })

  it('NE VOIT PAS le dossier de l’enfant d’une autre famille', async () => {
    const r = await dubois.appel(`/api/animes/${animeLemaire}`)
    // 404 et non 403 : on ne confirme même pas que ce dossier existe.
    expect(r.statut).toBe(404)
  })

  it('NE LIT PAS la fiche santé de l’enfant d’une autre famille', async () => {
    const r = await dubois.appel(`/api/animes/${animeLemaire}/sante`)
    expect(r.statut).toBe(404)
  })

  it('n’entre pas dans le back office', async () => {
    const r = await dubois.appel('/api/staff/animes')
    expect(r.statut).toBe(403)
  })

  it('ne voit pas les cotisations de l’unité', async () => {
    const r = await dubois.appel('/api/staff/paiements')
    expect(r.statut).toBe(403)
  })

  it('ne distribue pas les rôles', async () => {
    const r = await dubois.appel('/api/staff/comptes/role', {
      method: 'POST',
      body: JSON.stringify({ compteId: crypto.randomUUID(), role: 'cu', action: 'ajouter' }),
    })
    expect(r.statut).toBe(403)
  })
})

describe('un chef de section', () => {
  it('voit les animés de sa section', async () => {
    const r = await cheffeLutins.appel('/api/staff/animes')
    expect(r.statut).toBe(200)
    const prenoms = r.corps.animes.map((a: any) => a.prenom)
    expect(prenoms).toContain('Nina')
  })

  it('NE VOIT PAS les animés d’une autre section', async () => {
    const r = await cheffeLutins.appel('/api/staff/animes')
    const prenoms = r.corps.animes.map((a: any) => a.prenom)
    expect(prenoms).not.toContain('Élise')
  })

  it('ne peut pas forcer une autre section par l’adresse', async () => {
    const r = await cheffeLutins.appel('/api/staff/animes?section=guides')
    expect(r.statut).toBe(403)
  })

  it('lit la fiche santé d’un animé de sa section', async () => {
    const r = await cheffeLutins.appel(`/api/animes/${animeDubois}/sante`)
    expect(r.statut).toBe(200)
    expect(r.corps.contenu.allergies).toContain('Arachides')
  })

  it('NE LIT PAS la fiche santé d’une autre section', async () => {
    const r = await cheffeLutins.appel(`/api/animes/${animeLemaire}/sante`)
    expect(r.statut).toBe(404)
  })

  it('ne voit pas les cotisations', async () => {
    const r = await cheffeLutins.appel('/api/staff/paiements')
    expect(r.statut).toBe(403)
  })

  it('laisse une trace quand il ouvre une fiche santé', async () => {
    await cheffeLutins.appel(`/api/animes/${animeDubois}/sante`)
    const trace = await sql`
      select * from journal_acces where cible = 'fiche-sante' and cible_id = ${animeDubois}
    `
    expect(trace.length).toBeGreaterThan(0)
    // Et la famille peut la voir.
    const vue = await dubois.appel('/api/mon-espace/journal')
    expect(vue.statut).toBe(200)
    expect(vue.corps.acces.some((a: any) => a.cible === 'fiche-sante')).toBe(true)
  })
})

describe('le staff d’unité', () => {
  it('voit toutes les sections', async () => {
    const r = await cu.appel('/api/staff/animes')
    expect(r.statut).toBe(200)
    const prenoms = r.corps.animes.map((a: any) => a.prenom)
    expect(prenoms).toContain('Nina')
    expect(prenoms).toContain('Élise')
  })

  it('voit les cotisations', async () => {
    const r = await cu.appel('/api/staff/paiements')
    expect(r.statut).toBe(200)
    expect(r.corps.total.du).toBeGreaterThan(0)
  })

  it('ne peut pas se retirer son propre rôle de CU', async () => {
    const moi = await cu.appel('/api/auth/moi')
    const [ligne] = await sql<{ id: string }[]>`select id from comptes where email = 'unite@example.be'`
    const r = await cu.appel('/api/staff/comptes/role', {
      method: 'POST',
      body: JSON.stringify({ compteId: ligne!.id, role: 'cu', action: 'retirer' }),
    })
    expect(moi.corps.connecte).toBe(true)
    expect(r.statut).toBe(409)
  })
})

describe('un animé', () => {
  it('ne lit pas sa propre fiche santé', async () => {
    // On rattache le compte de la famille Dubois à l'animé lui-même, pour
    // simuler un animé qui se connecte.
    const [personne] = await sql<{ id: string }[]>`
      select personne_id as id from animes where id = ${animeDubois}
    `
    const [compte] = await sql<{ id: string }[]>`
      select id from comptes where email = 'dubois@example.be'
    `
    await sql`update comptes set personne_id = ${personne!.id} where id = ${compte!.id}`

    const lui = navigateur()
    const c = await lui.appel('/api/auth/connexion', {
      method: 'POST',
      body: JSON.stringify({ email: 'dubois@example.be', motDePasse: 'un-mot-de-passe-tres-long' }),
    })
    expect(c.statut).toBe(200)

    const dossierLu = await lui.appel(`/api/animes/${animeDubois}`)
    expect(dossierLu.statut).toBe(200)
    expect(dossierLu.corps.motif).toBe('lui-meme')

    const fiche = await lui.appel(`/api/animes/${animeDubois}/sante`)
    expect(fiche.statut).toBe(403)
  })
})
