import { planning } from '../../app/data/planning'
import { sections } from '../../app/data/sections'

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

export function fluxSection(slug: string): string | null {
  const section = sections.find((s) => s.slug === slug)
  if (!section) return null

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
    const entree = cle ? jour.sections[cle] : undefined
    const titre = entree?.libelle ?? (cle ? null : jour.evenement)
    if (!titre) continue

    const d = jour.date.replace(/-/g, '')
    const { debut, fin } = horaires(jour.horaire)
    const details: string[] = []
    if (jour.evenement) details.push(`Événement d'unité : ${jour.evenement}`)
    if (jour.remarque) details.push(jour.remarque)
    if (jour.occupation) details.push(`Local : ${jour.occupation}`)

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

export function fluxUnite(): string {
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
    if (!jour.evenement) continue
    const d = jour.date.replace(/-/g, '')
    const { debut, fin } = horaires(jour.horaire)
    lignes.push(
      'BEGIN:VEVENT',
      `UID:unite-${jour.date}@16efleurus`,
      `DTSTAMP:${d}T120000Z`,
      `DTSTART;TZID=Europe/Brussels:${d}T${debut}`,
      `DTEND;TZID=Europe/Brussels:${d}T${fin}`,
      plier(`SUMMARY:${echapper(jour.evenement)}`),
      jour.remarque ? plier(`DESCRIPTION:${echapper(jour.remarque)}`) : 'DESCRIPTION:',
      'END:VEVENT',
    )
  }

  lignes.push('END:VCALENDAR')
  return lignes.join('\r\n')
}
