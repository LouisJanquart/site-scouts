import { and, eq } from 'drizzle-orm'
import { santeSchema } from '../../../../shared/inscription'
import { fichesSante, saisons } from '../../../base/schema'

// Mise à jour de la fiche santé. Un parent peut corriger celle de son enfant,
// un chef aussi (il arrive qu'un parent dise une allergie de vive voix en
// arrivant au camp). L'animé lui-même, non.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const motif = await exigerAccesAnime(event, id)
  if (motif === 'lui-meme') {
    throw createError({ statusCode: 403, statusMessage: 'La fiche santé se modifie par un parent ou un chef.' })
  }

  const contenu = await lireCorps(event, santeSchema)
  const base = useBaseDeDonnees()
  const u = exigerSession(event)

  const [saison] = await base.select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) throw createError({ statusCode: 409, statusMessage: 'Aucune saison active.' })

  const coffre = chiffrer(contenu)
  const pointDAttention = Boolean(
    contenu.allergies.length || contenu.traitements.length ||
      contenu.regimesAlimentaires.length || contenu.antecedents,
  )

  const valeurs = {
    contenuChiffre: coffre.contenuChiffre,
    vecteur: coffre.vecteur,
    sceau: coffre.sceau,
    versionCle: coffre.versionCle,
    aUnPointDAttention: pointDAttention,
    saitNager: contenu.saitNager ?? null,
    majLe: new Date(),
    majPar: u.id,
  }

  const modifiees = await base
    .update(fichesSante)
    .set(valeurs)
    .where(and(eq(fichesSante.animeId, id), eq(fichesSante.saisonId, saison.id)))
    .returning({ id: fichesSante.id })

  if (!modifiees.length) {
    await base.insert(fichesSante).values({ animeId: id, saisonId: saison.id, ...valeurs })
  }

  await journaliser(event, 'modification', 'fiche-sante', id, `motif: ${motif}`)
  return { ok: true }
})
