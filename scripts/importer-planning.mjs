#!/usr/bin/env node
// Réécrit server/donnees/planning.ts à partir d'un export CSV du classeur
// « [HE16] Planning Annuel Réunions — toutes sections ».
//
// Comment obtenir le CSV :
//   Google Sheets → l'onglet de la saison → Fichier → Télécharger →
//   Valeurs séparées par des virgules (.csv)
//
// Usage :
//   node scripts/importer-planning.mjs planning.csv [annee-de-depart]
//
// L'année de départ vaut par défaut celle du mois d'août à l'ouverture de la
// saison. Le script en déduit le passage à l'année suivante au changement de
// janvier.
//
// Deux garde-fous, ajoutés le 28/09/2026 après une importation ratée :
//   - l'export du classeur contient plusieurs saisons empilées. Le script
//     s'arrête à la fin de la première : sans ça, les saisons suivantes se
//     retrouvaient datées de 2028 et 2029.
//   - les réunions ont lieu le SAMEDI. Toute date qui tombe un autre jour est
//     signalée : c'est le signe que l'année de départ est fausse.
//
// Le fichier produit est lu par le serveur seulement. Il ne doit pas revenir
// dans app/data/ : le planning des sections n'est pas public.

import { readFileSync, writeFileSync } from 'node:fs'

const [, , fichier, anneeArg] = process.argv

if (!fichier) {
  console.error('Usage : node scripts/importer-planning.mjs <planning.csv> [annee]')
  process.exit(1)
}

// Les sept colonnes de section du classeur, dans l'ordre, avec le nom utilisé
// côté site (voir app/data/sections.ts).
const SECTIONS = ['nutons', 'lutins', 'louveteaux', 'guides', 'scouts', 'horizons', 'route']

// Correspondance libellé → type, calquée sur les codes du classeur.
const TYPES = [
  ['relâche', 'relache'],
  ['grande sortie', 'grande-sortie'],
  ['gs :', 'grande-sortie'],
  ['hike', 'hike'],
  ['réunion spéciale', 'speciale'],
  ['rs :', 'speciale'],
  ['ru :', 'unite'],
  ['bar', 'bar'],
  ['réunion normale', 'normale'],
  ['rn :', 'normale'],
]

function typer(libelle) {
  const t = libelle.toLowerCase()
  for (const [cle, valeur] of TYPES) if (t.includes(cle)) return valeur
  return t ? 'normale' : null
}

// Analyseur CSV minimal, qui gère les guillemets et les virgules internes.
function lireCsv(texte) {
  const lignes = []
  let ligne = []
  let champ = ''
  let dansGuillemets = false

  for (let i = 0; i < texte.length; i++) {
    const c = texte[i]
    if (dansGuillemets) {
      if (c === '"') {
        if (texte[i + 1] === '"') {
          champ += '"'
          i++
        } else dansGuillemets = false
      } else champ += c
    } else if (c === '"') dansGuillemets = true
    else if (c === ',') {
      ligne.push(champ)
      champ = ''
    } else if (c === '\n') {
      ligne.push(champ)
      lignes.push(ligne)
      ligne = []
      champ = ''
    } else if (c !== '\r') champ += c
  }
  if (champ || ligne.length) {
    ligne.push(champ)
    lignes.push(ligne)
  }
  return lignes
}

const lignes = lireCsv(readFileSync(fichier, 'utf8'))

// On repère l'en-tête, puis on lit tout ce qui suit.
const iEntete = lignes.findIndex((l) => l.some((c) => c.trim() === 'Saison') && l.some((c) => c.trim() === 'Date'))
if (iEntete < 0) {
  console.error('En-tête introuvable : le CSV doit contenir une ligne avec « Saison » et « Date ».')
  process.exit(1)
}

const entete = lignes[iEntete].map((c) => c.trim())
const col = (nom) => entete.findIndex((c) => c.toLowerCase() === nom.toLowerCase())

const iSaison = col('Saison')
const iDate = col('Date')
const iRemarque = col('Remarque')
const iEvenement = col('Evenement')
const iOccupation = col('Occupation Local')
const iRangement = col('Rangement Local')
// Les colonnes de section portent les noms du classeur.
const nomsClasseur = ['Nutons', 'Lutins', 'Loups', 'Guides', 'Scouts', 'Horizons', 'Route']
const iSections = nomsClasseur.map(col)

let annee = anneeArg ? Number(anneeArg) : new Date().getFullYear()
let moisPrecedent = 8
const jours = []

for (const l of lignes.slice(iEntete + 1)) {
  const brut = (l[iDate] ?? '').trim()
  const m = brut.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!m) continue

  const jour = Number(m[1])
  const mois = Number(m[2])

  // Une saison va d'août à mai. Un mois d'août ou plus tard après un mois de
  // printemps, c'est l'onglet de la saison suivante qui commence : on arrête.
  if (mois >= 8 && moisPrecedent <= 6 && jours.length) {
    console.warn(
      `Le CSV contient une autre saison à partir du ${jour}/${mois} : elle n'a pas été lue. Relancez avec son année de départ pour l'importer.`,
    )
    break
  }
  if (mois < moisPrecedent) annee++
  moisPrecedent = mois

  const saison = (l[iSaison] ?? '').trim()
  const sections = {}
  iSections.forEach((idx, k) => {
    if (idx < 0) return
    const libelle = (l[idx] ?? '').replace(/\[merged\]/g, '').trim().replace(/\s+/g, ' ')
    if (libelle) sections[SECTIONS[k]] = { libelle, type: typer(libelle) }
  })

  const entree = {
    date: `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`,
    horaire: /Ét[ée]/i.test(saison) ? 'ete' : /Hiver/i.test(saison) ? 'hiver' : null,
    remarque: (l[iRemarque] ?? '').trim() || null,
    evenement: (l[iEvenement] ?? '').trim() || null,
    occupation: (l[iOccupation] ?? '').trim() || null,
    rangement: iRangement >= 0 ? (l[iRangement] ?? '').trim() || null : null,
    sections,
  }

  if (entree.evenement || entree.remarque || entree.occupation || Object.keys(sections).length) {
    jours.push(entree)
  }
}

if (!jours.length) {
  console.error('Aucune date lue. Vérifiez que le CSV correspond bien à un onglet de saison.')
  process.exit(1)
}

// Les réunions ont lieu le samedi. Si les dates tombent ailleurs, c'est
// l'année de départ qui est fausse : le calendrier glisse d'un jour par an.
const horsSamedi = jours.filter((j) => new Date(`${j.date}T12:00:00Z`).getUTCDay() !== 6)
if (horsSamedi.length) {
  console.warn(
    `${horsSamedi.length} date(s) ne tombent pas un samedi, à commencer par ${horsSamedi[0].date}.`,
  )
  console.warn("Vérifiez l'année passée en argument avant de vous servir du fichier.")
}

const premiere = jours[0].date.slice(0, 4)
const derniere = jours.at(-1).date.slice(0, 4)
const saison = premiere === derniere ? premiere : `${premiere}-${derniere}`

const entete_ts = `// Planning de la saison ${saison}, transcrit depuis le classeur
// « [HE16] Planning Annuel Réunions — toutes sections » partagé par
// scout.fleu@gmail.com. Source unique de vérité : le classeur. Les réunions
// ont lieu le samedi après-midi.
//
// Ce fichier est généré et RÉSERVÉ : il reste dans server/donnees/ et sort par
// /api/contenu, filtré selon le compte. Ne pas l'éditer à la main :
//   node scripts/importer-planning.mjs <export.csv> [annee-de-depart]

export type { TypeReunion, JourPlanning } from '../../shared/planning'
import type { JourPlanning } from '../../shared/planning'

export const saison = '${saison}'

export const planning: JourPlanning[] = `

writeFileSync('server/donnees/planning.ts', entete_ts + JSON.stringify(jours, null, 2) + '\n')
console.log(`${jours.length} dates écrites dans server/donnees/planning.ts (saison ${saison})`)
