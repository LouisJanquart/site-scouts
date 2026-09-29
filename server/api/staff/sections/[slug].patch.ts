import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { sections as tableSections } from '../../../base/schema'
import { sections as sectionsParDefaut } from '../../../../app/data/sections'

// Corriger le texte d'une section.
//
// Un chef corrige SA section, le staff d'unité toutes. On n'écrit que les
// champs envoyés, et on garde qui a touché quoi : ces textes partent sur la
// page publique de la section, ce n'est pas un brouillon privé.
//
// Une chaîne vide veut dire « remets la valeur du fichier », pas « efface » :
// c'est ce qui permet d'annuler une correction sans avoir à la retaper.
const texte = z.string().trim().max(2000).nullish()

const corps = z.object({
  nom: texte,
  nomCourt: texte,
  ages: texte,
  resume: texte,
  description: texte,
  photo: texte,
  animee: z.boolean().nullish(),
})

export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const slug = getRouterParam(event, 'slug')!

  const mesSections = sectionsDuStaff(u)
  if (mesSections && !mesSections.includes(slug)) {
    throw createError({ statusCode: 403, statusMessage: 'Vous n’animez pas cette section.' })
  }

  const recu = await lireCorps(event, corps)
  const defaut = sectionsParDefaut.find((s) => s.slug === slug) as Record<string, unknown> | undefined

  const valeurs: Record<string, unknown> = {}
  for (const [champ, v] of Object.entries(recu)) {
    if (v === undefined) continue
    const valeur = typeof v === 'string' ? (v ? v : null) : (v ?? null)
    // Réécrire à l'identique le texte du fichier n'est pas une correction :
    // sinon le back office annoncerait « trois champs modifiés » pour quelqu'un
    // qui a seulement ouvert le formulaire et cliqué sur Enregistrer.
    valeurs[champ] = defaut && valeur === defaut[champ] ? null : valeur
  }

  if (!Object.keys(valeurs).length) {
    throw createError({ statusCode: 400, statusMessage: 'Rien à enregistrer.' })
  }

  const base = useBaseDeDonnees()
  const marque = { majLe: new Date(), majPar: u.personneId }
  await base
    .insert(tableSections)
    .values({ slug, ...valeurs, ...marque })
    .onConflictDoUpdate({ target: tableSections.slug, set: { ...valeurs, ...marque } })

  // Une ligne dont tous les champs sont revenus à null ne veut plus rien dire :
  // la section n'est plus « modifiée », elle a retrouvé le texte du fichier.
  const [etat] = await base.select().from(tableSections).where(eq(tableSections.slug, slug)).limit(1)
  const plusRien =
    etat &&
    (['nom', 'nomCourt', 'ages', 'resume', 'description', 'photo', 'animee'] as const).every(
      (c) => etat[c] === null,
    )
  if (plusRien) await base.delete(tableSections).where(eq(tableSections.slug, slug))

  viderLeCacheDesSections()
  await journaliser(event, 'modification', 'section', slug, Object.keys(valeurs).join(', '))

  return { ok: true, modifiee: !plusRien }
})
