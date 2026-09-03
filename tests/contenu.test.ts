import { describe, it, expect, beforeAll } from 'vitest'
import { navigateur, ouvrirLaSaison, dossier } from './aide'

// ---------------------------------------------------------------------------
// Ce que le serveur accepte d'envoyer, et à qui.
//
// Le contenu réservé — le planning des sections, les intitulés internes du
// classeur, les adresses des staffs, les actus et rendez-vous réservés —
// vivait dans le paquet JavaScript public. Le sélecteur de rôle le masquait à
// l'écran ; n'importe qui pouvait le lire en ouvrant les outils de
// développement.
//
// Ces tests vérifient qu'il n'y est plus. Ils sont écrits du point de vue de
// quelqu'un qui interroge l'API directement, sans passer par l'interface —
// c'est exactement ce que fera la première personne curieuse.
// ---------------------------------------------------------------------------

let famille: ReturnType<typeof navigateur>
const anonyme = navigateur()

beforeAll(async () => {
  await ouvrirLaSaison()
  famille = navigateur()
  await famille.appel('/api/inscriptions', {
    method: 'POST',
    body: JSON.stringify(dossier('Contenu', 'Famille')),
  })
})

describe('un visiteur non connecté', () => {
  it('ne reçoit pas le programme des sections', async () => {
    const r = await anonyme.appel('/api/contenu')
    expect(r.statut).toBe(200)
    expect(r.corps.role).toBe('visiteur')
    expect(r.corps.planning.length).toBeGreaterThan(0)
    for (const jour of r.corps.planning) {
      expect(jour.sections).toEqual({})
      expect(jour.remarque).toBeNull()
      expect(jour.occupation).toBeNull()
      expect(jour.rangement).toBeNull()
    }
  })

  it('garde quand même les dates et les horaires, qui sont publics', async () => {
    const r = await anonyme.appel('/api/contenu')
    const premier = r.corps.planning[0]
    expect(premier.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(['ete', 'hiver', null]).toContain(premier.horaire)
  })

  it('ne reçoit aucun intitulé d’événement réservé', async () => {
    const r = await anonyme.appel('/api/contenu')
    const brut = JSON.stringify(r.corps)
    // Ces libellés viennent du classeur interne : ils ne doivent pas sortir.
    expect(brut).not.toContain('Portes Ouvertes + CU')
    expect(brut).not.toContain('Saint-Nicolas')
    expect(brut).not.toContain('Veillée de Noël')
  })

  it('ne reçoit ni le staff ni les adresses de section', async () => {
    const r = await anonyme.appel('/api/contenu')
    expect(r.corps.staff).toEqual([])
    expect(r.corps.adressesDeSection).toEqual({})
    expect(JSON.stringify(r.corps)).not.toContain('@gmail.com')
    // Le décompte, lui, est public : il est affiché sur la page « à propos ».
    expect(r.corps.totalChefs).toBeGreaterThan(0)
  })

  it('ne reçoit que les rendez-vous ouverts au dehors', async () => {
    const r = await anonyme.appel('/api/contenu')
    for (const e of r.corps.evenements) expect(e.public).toBe('tous')
  })

  it('ne reçoit pas les documents réservés', async () => {
    const r = await anonyme.appel('/api/contenu')
    for (const d of r.corps.documents) expect(d.public ?? 'tous').toBe('tous')
  })
})

describe('une famille connectée', () => {
  it('reçoit le programme complet des sections', async () => {
    const r = await famille.appel('/api/contenu')
    expect(r.corps.role).not.toBe('visiteur')
    const avecSections = r.corps.planning.filter(
      (j: any) => Object.keys(j.sections).length > 0,
    )
    expect(avecSections.length).toBeGreaterThan(0)
  })

  it('reçoit le staff et les adresses de section', async () => {
    const r = await famille.appel('/api/contenu')
    expect(r.corps.staff.length).toBeGreaterThan(0)
    expect(Object.keys(r.corps.adressesDeSection).length).toBeGreaterThan(0)
  })

  it('ne reçoit toujours AUCUNE coordonnée personnelle de chef', async () => {
    // Le mécanisme d'accès existe désormais ; le consentement des 63 chefs,
    // non. Tant qu'il manque, ces données ne sont pas dans le site.
    const r = await famille.appel('/api/contenu')
    for (const c of r.corps.staff) {
      expect(Object.keys(c).sort()).toEqual(
        expect.arrayContaining(['prenom', 'section']),
      )
      expect(c).not.toHaveProperty('nom')
      expect(c).not.toHaveProperty('telephone')
      expect(c).not.toHaveProperty('email')
    }
  })
})

describe('les flux iCalendar', () => {
  it('ne livrent que les rendez-vous publics sans clé', async () => {
    const r = await anonyme.appel('/calendriers/lutins.ics')
    expect(r.statut).toBe(200)
    expect(String(r.corps)).toContain('BEGIN:VCALENDAR')
    expect(String(r.corps)).not.toContain('Portes Ouvertes + CU')
  })

  it('refusent une clé inventée', async () => {
    const r = await anonyme.appel('/calendriers/lutins.ics?cle=' + 'x'.repeat(40))
    expect(String(r.corps)).not.toContain('Portes Ouvertes + CU')
  })

  it('livrent le programme complet avec la clé du compte', async () => {
    const c = await famille.appel('/api/mon-espace/calendrier')
    expect(c.statut).toBe(200)
    expect(c.corps.cle).toBeTruthy()
    const r = await anonyme.appel(`/calendriers/lutins.ics?cle=${c.corps.cle}`)
    expect(String(r.corps)).toContain('BEGIN:VEVENT')
    expect(String(r.corps).length).toBeGreaterThan(1000)
  })

  it('coupent les anciens abonnements quand on change de clé', async () => {
    const avant = await famille.appel('/api/mon-espace/calendrier')
    const apres = await famille.appel('/api/mon-espace/calendrier', { method: 'POST' })
    expect(apres.corps.cle).not.toBe(avant.corps.cle)
    const ancien = await anonyme.appel(`/calendriers/lutins.ics?cle=${avant.corps.cle}`)
    expect(String(ancien.corps)).not.toContain('Portes Ouvertes + CU')
  })
})
