import { planning } from '../donnees/planning'
import { evenementsVisibles } from '../donnees/evenements'
import { sections } from '../../app/data/sections'

// Deux niveaux de flux, comme partout ailleurs sur ce site :
//
//   privé   — le programme complet de la section, dimanche par dimanche, avec
//             les remarques du classeur. Réservé aux familles, servi contre une
//             clé personnelle.
//   public  — seulement les rendez-vous ouverts au dehors. Une famille qui
//             découvre l'unité peut mettre les portes ouvertes dans son agenda
//             sans avoir de compte, et c'est très bien.

// Génération des flux iCalendar. Chaque section a le sien, plus un flux
// « unité » avec les seuls grands rendez-vous. Ces fichiers sont produits au
// build et servis en statique : on peut donc s'y abonner depuis Google
// Agenda, Apple Calendrier ou Outlook.
//
// À terme, la source doit être le classeur partagé plutôt que cette copie.

function echapper(v: string) {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function horaires(horaire: 'ete' | 'hiver' | null) {
  return horaire === 'hiver' ? { debut: '140000', fin: '170000' } : { debut: '140000', fin: '173000' }
}

// Le repli à 75 octets exigé par la RFC 5545.
function plier(ligne: string) {
  if (ligne.length <= 73) return ligne
  const morceaux: string[] = []
  let reste = ligne
  morceaux.push(reste.slice(0, 73))
  reste = reste.slice(73)
  while (reste.length) {
    morceaux.push(' ' + reste.slice(0, 72))
    reste = reste.slice(72)
  }
  return morceaux.join('\r\n')
}

/** Les dates des rendez-vous ouverts au dehors, indexées par date. */
function rendezVousPublics(): Map<string, string> {
  return new Map(evenementsVisibles('visiteur').map((e) => [e.date, e.titre]))
}

export function fluxSection(slug: string, complet = false): string | null {
  const section = sections.find((s) => s.slug === slug)
  if (!section) return null
  const publics = complet ? null : rendezVousPublics()

  const lignes: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//16e Fleurus//Planning//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${echapper(`16e Fleurus — ${section.nom}`)}`,
    'X-WR-TIMEZONE:Europe/Brussels',
  ]

  const cle = section.cleplanning

  for (const jour of planning) {
    let titre: string | null
    const details: string[] = []

    if (complet) {
      const entree = cle ? jour.sections[cle] : undefined
      titre = entree?.libelle ?? (cle ? null : jour.evenement)
      if (jour.evenement) details.push(`Événement d'unité : ${jour.evenement}`)
      if (jour.remarque) details.push(jour.remarque)
      if (jour.occupation) details.push(`Local : ${jour.occupation}`)
    } else {
      // Sans clé : seulement les rendez-vous ouverts au dehors, sans le
      // programme de la section ni les remarques internes.
      titre = publics!.get(jour.date) ?? null
    }
    if (!titre) continue

    const d = jour.date.replace(/-/g, '')
    const { debut, fin } = horaires(jour.horaire)

    lignes.push(
      'BEGIN:VEVENT',
      `UID:${slug}-${jour.date}@16efleurus`,
      `DTSTAMP:${d}T120000Z`,
      `DTSTART;TZID=Europe/Brussels:${d}T${debut}`,
      `DTEND;TZID=Europe/Brussels:${d}T${fin}`,
      plier(`SUMMARY:${echapper(titre)}`),
      details.length ? plier(`DESCRIPTION:${echapper(details.join(' — '))}`) : 'DESCRIPTION:',
      'END:VEVENT',
    )
  }

  lignes.push('END:VCALENDAR')
  return lignes.join('\r\n')
}

export function fluxUnite(complet = false): string {
  const publics = complet ? null : rendezVousPublics()
  const lignes: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//16e Fleurus//Unité//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:16e Fleurus — unité',
    'X-WR-TIMEZONE:Europe/Brussels',
  ]

  for (const jour of planning) {
    const titre = complet ? jour.evenement : (publics!.get(jour.date) ?? null)
    if (!titre) continue
    const d = jour.date.replace(/-/g, '')
    const { debut, fin } = horaires(jour.horaire)
    lignes.push(
      'BEGIN:VEVENT',
      `UID:unite-${jour.date}@16efleurus`,
      `DTSTAMP:${d}T120000Z`,
      `DTSTART;TZID=Europe/Brussels:${d}T${debut}`,
      `DTEND;TZID=Europe/Brussels:${d}T${fin}`,
      plier(`SUMMARY:${echapper(titre)}`),
      complet && jour.remarque ? plier(`DESCRIPTION:${echapper(jour.remarque)}`) : 'DESCRIPTION:',
      'END:VEVENT',
    )
  }

  lignes.push('END:VCALENDAR')
  return lignes.join('\r\n')
}
