import { and, desc, eq } from 'drizzle-orm'
import { fichesSante, saisons } from '../../../base/schema'

// La fiche santé, déchiffrée. Route à part, contrôle à part, journal
// systématique : c'est la donnée la plus sensible du site.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await exigerAccesFicheSante(event, id) // journalise lui-même

  const [fiche] = await useBaseDeDonnees()
    .select({
      contenuChiffre: fichesSante.contenuChiffre,
      vecteur: fichesSante.vecteur,
      sceau: fichesSante.sceau,
      versionCle: fichesSante.versionCle,
      majLe: fichesSante.majLe,
      saison: saisons.libelle,
    })
    .from(fichesSante)
    .innerJoin(saisons, eq(saisons.id, fichesSante.saisonId))
    .where(eq(fichesSante.animeId, id))
    .orderBy(desc(saisons.debut))
    .limit(1)

  if (!fiche) return { existe: false as const }

  return {
    existe: true as const,
    saison: fiche.saison,
    majLe: fiche.majLe,
    contenu: dechiffrer(fiche),
  }
})
