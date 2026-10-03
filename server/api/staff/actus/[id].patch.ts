import { eq } from 'drizzle-orm'
import { actus } from '../../../base/schema'

// Modifier une actu. Deux vérifications, pas une : le staff doit avoir la main
// sur l'actu telle qu'elle EST, et sur ce qu'elle DEVIENT — sinon un chef
// pourrait reprendre une actu d'unité en y cochant sa section.
//
// L'adresse (slug) ne change pas : elle a peut-être déjà été partagée.
export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const id = getRouterParam(event, 'id')!
  const base = useBaseDeDonnees()

  const [avant] = await base.select().from(actus).where(eq(actus.id, id)).limit(1)
  if (!avant) throw createError({ statusCode: 404, statusMessage: 'Actu introuvable.' })
  exigerDroitDePublier(u, avant.sections ?? [])

  const recu = await lireCorps(event, formeActu)
  const sections = [...new Set(recu.sections)]
  verifierSections(sections)
  exigerDroitDePublier(u, sections)

  await base
    .update(actus)
    .set({
      titre: recu.titre,
      date: recu.date,
      sections,
      chapo: recu.chapo,
      corps: enParagraphes(recu.corps),
      public: recu.public,
      statut: recu.statut,
      // Un staff l'a ouverte et enregistrée : elle n'est plus « à relire ».
      aRelire: false,
      majLe: new Date(),
      majPar: u.personneId,
    })
    .where(eq(actus.id, id))

  viderLeCacheDesPublications()
  await journaliser(event, 'modification', 'actu', id, `${avant.slug} (${recu.statut})`)
  return { ok: true }
})
