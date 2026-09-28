import { describe, it, expect } from 'vitest'
import { calculerCotisations, totalCotisations, baremeParDefaut } from '../shared/cotisations'

// ---------------------------------------------------------------------------
// Le barème d'affiliation de la fédération.
//
// C'est de l'argent réclamé à des familles : chaque cas du barème publié a son
// test. Le jour où la fédération change ses montants, ces tests tombent et
// disent exactement quoi corriger.
//
// Source : https://www.guides.be/animateur/administratif/montant-des-cotisations
// ---------------------------------------------------------------------------

const saison = { saisonDebut: '2026-09-01' }
const enfant = (cle: string, sectionSlug = 'lutins', reste: Record<string, unknown> = {}) => ({
  cle, sectionSlug, deposeeLe: '2026-09-15', ...reste,
})

describe('barème de la fédération', () => {
  it('un enfant seul paie le tarif plein', () => {
    const [l] = calculerCotisations([enfant('a')], saison)
    expect(l!.montantCentimes).toBe(5750)
    expect(l!.motif).toBe('plein')
  })

  it('deux enfants : le tarif famille s’applique aux DEUX, pas au second seulement', () => {
    const lignes = calculerCotisations([enfant('a'), enfant('b', 'nutons')], saison)
    expect(lignes.map((l) => l.montantCentimes)).toEqual([4600, 4600])
    expect(totalCotisations(lignes)).toBe(9200)
    // L'erreur qu'on ne veut pas : 57,50 + 46 = 103,50.
    expect(totalCotisations(lignes)).not.toBe(10350)
  })

  it('trois enfants ou plus : tous à 39 €', () => {
    const lignes = calculerCotisations(
      [enfant('a'), enfant('b', 'nutons'), enfant('c', 'guides'), enfant('d', 'scouts')],
      saison,
    )
    for (const l of lignes) expect(l.montantCentimes).toBe(3900)
  })

  it('compte les frères et sœurs inscrits chez les Scouts', () => {
    const [l] = calculerCotisations([enfant('a')], { ...saison, membresAilleurs: 1 })
    expect(l!.montantCentimes).toBe(4600)
  })

  it('la Route paie l’assurance seule', () => {
    const [l] = calculerCotisations([enfant('a', 'route')], saison)
    expect(l!.montantCentimes).toBe(1825)
    expect(l!.motif).toBe('route')
  })

  it('un aîné à la Route ne fait pas basculer son cadet au tarif famille', () => {
    const lignes = calculerCotisations([enfant('aine', 'route'), enfant('cadet')], saison)
    expect(lignes[0]!.montantCentimes).toBe(1825)
    // Le cadet reste seul au barème ordinaire : tarif plein.
    expect(lignes[1]!.montantCentimes).toBe(5750)
  })

  it('une inscription déposée après le 1er avril passe à l’assurance seule', () => {
    const [l] = calculerCotisations(
      [enfant('a', 'lutins', { deposeeLe: '2027-04-14' })],
      saison,
    )
    expect(l!.montantCentimes).toBe(1825)
    expect(l!.motif).toBe('tardive')
  })

  it('le 31 mars est encore à l’heure, le 1er avril non', () => {
    const [avant] = calculerCotisations([enfant('a', 'lutins', { deposeeLe: '2027-03-31' })], saison)
    const [apres] = calculerCotisations([enfant('a', 'lutins', { deposeeLe: '2027-04-01' })], saison)
    expect(avant!.motif).toBe('plein')
    expect(apres!.motif).toBe('tardive')
  })

  it('le tarif social remplace le tarif famille', () => {
    const lignes = calculerCotisations(
      [enfant('a', 'lutins', { tarifSocial: true }), enfant('b', 'nutons', { tarifSocial: true })],
      saison,
    )
    for (const l of lignes) {
      expect(l.montantCentimes).toBe(500)
      expect(l.motif).toBe('social')
    }
  })

  it('un animateur breveté a cinq euros de moins', () => {
    const [l] = calculerCotisations([enfant('a', 'horizons', { brevete: true })], saison)
    expect(l!.montantCentimes).toBe(5750 - 500)
    expect(l!.reductionBrevet).toBe(true)
  })

  it('la réduction brevet ne creuse pas le tarif social', () => {
    const [l] = calculerCotisations(
      [enfant('a', 'horizons', { brevete: true, tarifSocial: true })],
      saison,
    )
    expect(l!.montantCentimes).toBe(500)
  })

  it('donne à chaque montant une explication lisible', () => {
    const lignes = calculerCotisations([enfant('a'), enfant('b')], saison)
    expect(lignes[0]!.explication).toContain('deux membres')
  })

  it('le barème par défaut correspond à celui publié pour 2026-2027', () => {
    expect(baremeParDefaut.pleinCentimes).toBe(5750)
    expect(baremeParDefaut.famille2Centimes).toBe(4600)
    expect(baremeParDefaut.famille3PlusCentimes).toBe(3900)
    expect(baremeParDefaut.socialCentimes).toBe(500)
    expect(baremeParDefaut.reduitCentimes).toBe(1825)
  })
})
