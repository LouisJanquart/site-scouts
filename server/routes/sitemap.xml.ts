import { sections } from '../../app/data/sections'
import { evenementsVisibles } from '../donnees/evenements'
import { actusVisibles } from '../donnees/actus'

export default defineEventHandler((event) => {
  const base = 'https://16efleurus.netlify.app'
  const urls = [
    '/', '/sections', '/events', '/actus', '/calendrier',
    '/infos', '/documents', '/photos', '/a-propos',
    ...sections.map((s) => `/sections/${s.slug}`),
    ...evenementsVisibles('visiteur').map((e) => `/events/${e.slug}`),
    ...actusVisibles('visiteur').map((a) => `/actus/${a.slug}`),
  ]
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}
</urlset>`
})
