import { fluxSection, fluxUnite } from '../../utils/ics'

// Les flux iCalendar.
//
// Ils étaient prérendus en fichiers publics : le programme complet de la saison
// se lisait à huit adresses évidentes, sans compte. Ils sont maintenant servis à
// la demande, contre une clé personnelle passée dans l'adresse — voir
// server/utils/calendrierPrive.ts pour pourquoi une clé et pas un cookie.
//
// Sans clé valable, on ne refuse pas sèchement : on sert le calendrier des
// rendez-vous ouverts au dehors. Une famille qui découvre l'unité peut ainsi
// mettre les portes ouvertes dans son agenda, et c'est très bien.
export default defineEventHandler(async (event) => {
  // Selon la version de Nitro, le paramètre peut arriver avec ou sans son
  // extension : on normalise plutôt que de dépendre du comportement exact.
  const brut = getRouterParam(event, 'slug') ?? ''
  const slug = decodeURIComponent(brut).replace(/\.ics$/i, '')

  const cle = String(getQuery(event).cle ?? '')
  let autorise = false
  try {
    autorise = Boolean(cle) && Boolean(await compteDeLaCle(cle))
  } catch {
    // Base injoignable : on retombe sur le flux public plutôt que de rendre
    // une erreur à une application d'agenda, qui se désabonnerait.
    autorise = false
  }

  const contenu = slug === 'unite' ? fluxUnite(autorise) : fluxSection(slug, autorise)
  if (!contenu) {
    throw createError({ statusCode: 404, statusMessage: `Calendrier inconnu : ${slug}` })
  }

  setHeader(event, 'content-type', 'text/calendar; charset=utf-8')
  // Un flux personnel ne se met pas en cache chez un intermédiaire.
  setHeader(event, 'cache-control', autorise ? 'private, max-age=900' : 'public, max-age=3600')
  setHeader(event, 'content-disposition', `inline; filename="16e-fleurus-${slug}.ics"`)
  return contenu
})
