import { and, eq, gt, isNull } from 'drizzle-orm'
import { jetons } from '../base/schema'

// Les jetons à usage unique. Même principe que les sessions : la base ne garde
// que l'empreinte, et un jeton consommé est marqué, pas supprimé — on veut
// pouvoir dire « ce lien a déjà servi » plutôt que « lien inconnu ».

export type TypeJeton = 'verification' | 'reinitialisation' | 'invitation'

const DUREES_HEURES: Record<TypeJeton, number> = {
  verification: 72,
  reinitialisation: 2,
  invitation: 24 * 14,
}

export async function emettreJeton(compteId: string, type: TypeJeton) {
  const jeton = creerJeton()
  await useBaseDeDonnees().insert(jetons).values({
    compteId,
    type,
    empreinteJeton: empreinteJeton(jeton),
    expireLe: new Date(Date.now() + DUREES_HEURES[type] * 3600_000),
  })
  return jeton
}

export async function consommerJeton(jeton: string, type: TypeJeton) {
  const base = useBaseDeDonnees()
  const [ligne] = await base
    .select()
    .from(jetons)
    .where(
      and(
        eq(jetons.empreinteJeton, empreinteJeton(jeton)),
        eq(jetons.type, type),
        isNull(jetons.utiliseLe),
        gt(jetons.expireLe, new Date()),
      ),
    )
    .limit(1)
  if (!ligne) return null
  await base.update(jetons).set({ utiliseLe: new Date() }).where(eq(jetons.id, ligne.id))
  return ligne.compteId
}
