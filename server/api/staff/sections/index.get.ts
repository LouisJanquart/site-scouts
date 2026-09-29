// Ce que le back office montre : la valeur servie (fichier + corrections), le
// texte d'origine à côté, et la liste des champs réellement modifiés — pour
// qu'on voie d'un coup d'œil ce qui a été touché, et par qui.
import { sections as tableSections } from '../../../base/schema'
import { sections as sectionsParDefaut } from '../../../../app/data/sections'

const CHAMPS = ['nom', 'nomCourt', 'ages', 'resume', 'description', 'photo', 'animee'] as const

export default defineEventHandler(async (event) => {
  const u = exigerStaff(event)
  const mesSections = sectionsDuStaff(u)

  const servies = await sectionsFusionnees({ frais: true })
  const enBase = await useBaseDeDonnees().select().from(tableSections)

  const liste = servies
    .filter((s) => !mesSections || mesSections.includes(s.slug))
    .map((s) => {
      const ligne = enBase.find((l) => l.slug === s.slug)
      const modifie = ligne
        ? CHAMPS.filter((c) => ligne[c] !== null && ligne[c] !== undefined)
        : []
      return {
        ...s,
        origine: sectionsParDefaut.find((d) => d.slug === s.slug) ?? null,
        modifie,
        majLe: modifie.length ? ligne?.majLe : null,
      }
    })

  return { sections: liste, toutesLesSections: !mesSections }
})
