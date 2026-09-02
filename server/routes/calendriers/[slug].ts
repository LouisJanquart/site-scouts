import { fluxSection, fluxUnite } from '../../utils/ics'

export default defineEventHandler((event) => {
  // Selon la version de Nitro, le paramètre peut arriver avec ou sans son
  // extension : on normalise plutôt que de dépendre du comportement exact.
  const brut = getRouterParam(event, 'slug') ?? ''
  const slug = decodeURIComponent(brut).replace(/\.ics$/i, '')

  const contenu = slug === 'unite' ? fluxUnite() : fluxSection(slug)
  if (!contenu) {
    throw createError({ statusCode: 404, statusMessage: `Calendrier inconnu : ${slug}` })
  }

  setHeader(event, 'content-type', 'text/calendar; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  setHeader(event, 'content-disposition', `inline; filename="16e-fleurus-${slug}.ics"`)
  return contenu
})
