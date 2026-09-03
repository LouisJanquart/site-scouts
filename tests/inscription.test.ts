import { describe, it, expect, beforeAll } from 'vitest'
import { navigateur, ouvrirLaSaison, dossier, sql } from './aide'

// Le parcours d'inscription : ce qui doit passer, et ce qui doit être refusé.

beforeAll(ouvrirLaSaison)

describe('dépôt d’un dossier', () => {
  it('refuse un dossier sans les autorisations indispensables', async () => {
    const n = navigateur()
    const d = dossier('Sans', 'Autorisation')
    d.consentements['soins-medicaux'] = false
    const r = await n.appel('/api/inscriptions', { method: 'POST', body: JSON.stringify(d) })
    expect(r.statut).toBe(422)
  })

  it('refuse une section qui ne correspond pas à l’âge', async () => {
    const n = navigateur()
    const d = dossier('Trop', 'Petit', 'guides', '2020-01-01')
    const r = await n.appel('/api/inscriptions', { method: 'POST', body: JSON.stringify(d) })
    expect(r.statut).toBe(422)
  })

  it('refuse un mot de passe trop court', async () => {
    const n = navigateur()
    const d = dossier('Mot', 'Depasse')
    d.motDePasse = 'court'
    const r = await n.appel('/api/inscriptions', { method: 'POST', body: JSON.stringify(d) })
    expect(r.statut).toBe(422)
  })

  it('refuse de rattacher un dossier à un compte existant sans connexion', async () => {
    const un = navigateur()
    await un.appel('/api/inscriptions', {
      method: 'POST',
      body: JSON.stringify(dossier('Premier', 'Rattache')),
    })
    const deux = navigateur()
    const r = await deux.appel('/api/inscriptions', {
      method: 'POST',
      body: JSON.stringify(dossier('Second', 'Rattache')),
    })
    expect(r.statut).toBe(409)
  })

  it('chiffre la fiche santé : rien de lisible en base', async () => {
    const n = navigateur()
    await n.appel('/api/inscriptions', {
      method: 'POST',
      body: JSON.stringify(dossier('Chiffre', 'Sante')),
    })
    const lignes = await sql<{ brut: string }[]>`
      select encode(contenu_chiffre, 'escape') as brut from fiches_sante
    `
    for (const l of lignes) {
      expect(l.brut).not.toContain('Arachides')
      expect(l.brut).not.toContain('Asthme')
    }
  })

  it('garde le texte exact de chaque autorisation signée', async () => {
    const lignes = await sql<{ libelle_signe: string; version_texte: string }[]>`
      select libelle_signe, version_texte from consentements where type = 'soins-medicaux' limit 1
    `
    expect(lignes[0]!.libelle_signe).toContain('soins médicaux urgents')
    expect(lignes[0]!.version_texte).toBe('2026-09')
  })

  it('applique la dégressivité au deuxième enfant de la famille', async () => {
    const n = navigateur()
    const premier = await n.appel('/api/inscriptions', {
      method: 'POST',
      body: JSON.stringify(dossier('Aine', 'Fratrie')),
    })
    expect(premier.corps.montantCentimes).toBe(8000)
    // Le parent est maintenant connecté : le second enfant rejoint la famille.
    const second = await n.appel('/api/inscriptions', {
      method: 'POST',
      body: JSON.stringify({ ...dossier('Cadet', 'Fratrie', 'nutons', '2020-04-04'), motDePasse: undefined }),
    })
    expect(second.statut).toBe(200)
    expect(second.corps.montantCentimes).toBe(6500)
  })

  it('produit une communication structurée valide', async () => {
    const [p] = await sql<{ communication: string }[]>`
      select communication from paiements where communication is not null limit 1
    `
    const chiffres = p!.communication.replace(/[^0-9]/g, '')
    expect(chiffres).toHaveLength(12)
    const controle = Number(chiffres.slice(0, 10)) % 97 || 97
    expect(Number(chiffres.slice(10))).toBe(controle)
  })
})

describe('connexion', () => {
  it('donne le même message que le compte existe ou non', async () => {
    const n = navigateur()
    const inconnu = await n.appel('/api/auth/connexion', {
      method: 'POST',
      body: JSON.stringify({ email: 'personne@example.be', motDePasse: 'peu-importe-ici' }),
    })
    const mauvais = await n.appel('/api/auth/connexion', {
      method: 'POST',
      body: JSON.stringify({ email: 'sante@example.be', motDePasse: 'mauvais-mot-de-passe' }),
    })
    expect(inconnu.statut).toBe(401)
    expect(mauvais.statut).toBe(401)
    expect(inconnu.corps.statusMessage ?? inconnu.corps.message).toBe(
      mauvais.corps.statusMessage ?? mauvais.corps.message,
    )
  })

  it('freine après une série d’échecs', async () => {
    const n = navigateur()
    let dernier = 0
    for (let i = 0; i < 12; i++) {
      const r = await n.appel('/api/auth/connexion', {
        method: 'POST',
        body: JSON.stringify({ email: 'freinage@example.be', motDePasse: `essai-${i}-faux` }),
      })
      dernier = r.statut
      if (dernier === 429) break
    }
    expect(dernier).toBe(429)
  })
})
