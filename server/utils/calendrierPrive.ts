import { eq } from 'drizzle-orm'
import { comptes } from '../base/schema'

// ---------------------------------------------------------------------------
// La clé des flux iCal.
//
// Une application d'agenda — Google Agenda, Apple Calendrier, Outlook —
// s'abonne à une adresse et la relit toute seule, sans navigateur et donc sans
// cookie. Il n'y a pas de session à présenter : le seul moyen connu de servir
// un flux privé est de mettre un secret dans l'adresse.
//
// C'est exactement ce que fait Google Agenda avec son « adresse secrète », et
// ça a les mêmes limites : qui a l'adresse a le flux, pour toujours. D'où deux
// choses : la clé est propre à chaque compte, et elle se change d'un bouton —
// ce qui coupe tous les abonnements existants de ce compte, et c'est le but.
// ---------------------------------------------------------------------------

export async function cleCalendrier(compteId: string): Promise<string> {
  const base = useBaseDeDonnees()
  const [compte] = await base
    .select({ cle: comptes.jetonCalendrier })
    .from(comptes)
    .where(eq(comptes.id, compteId))
    .limit(1)
  if (compte?.cle) return compte.cle

  const cle = creerJeton()
  await base.update(comptes).set({ jetonCalendrier: cle }).where(eq(comptes.id, compteId))
  return cle
}

export async function renouvelerCleCalendrier(compteId: string): Promise<string> {
  const cle = creerJeton()
  await useBaseDeDonnees()
    .update(comptes)
    .set({ jetonCalendrier: cle })
    .where(eq(comptes.id, compteId))
  return cle
}

/** Le compte auquel appartient une clé, s'il existe et s'il est actif. */
export async function compteDeLaCle(cle: string) {
  if (!cle || cle.length < 20) return null
  const [compte] = await useBaseDeDonnees()
    .select({ id: comptes.id, desactiveLe: comptes.desactiveLe })
    .from(comptes)
    .where(eq(comptes.jetonCalendrier, cle))
    .limit(1)
  if (!compte || compte.desactiveLe) return null
  return compte
}
