import type { H3Event } from 'h3'
import { journalAcces } from '../base/schema'

// Le journal d'accès. Il répond à une question précise, qu'un parent a le droit
// de poser : « qui a ouvert la fiche de mon enfant, et quand ? »
//
// On y écrit toute consultation de donnée sensible et toute écriture. Jamais le
// contenu lui-même — seulement qui, quoi, quand.

export type ActionJournal = 'lecture' | 'creation' | 'modification' | 'suppression' | 'export'

export async function journaliser(
  event: H3Event | null,
  action: ActionJournal,
  cible: string,
  cibleId?: string | null,
  detail?: string,
) {
  try {
    await useBaseDeDonnees()
      .insert(journalAcces)
      .values({
        compteId: event?.context.compte?.id ?? null,
        action,
        cible,
        cibleId: cibleId ?? null,
        detail: detail ?? null,
        ip: event ? adresseIp(event) : null,
      })
  } catch (e) {
    // Le journal ne doit jamais faire échouer l'action qu'il observe : on trace
    // dans les logs du serveur et on continue.
    console.error('[journal] écriture impossible', e)
  }
}

export function adresseIp(event: H3Event): string | null {
  const entete = getRequestHeader(event, 'x-forwarded-for')
  if (entete) return entete.split(',')[0]!.trim()
  return getRequestIP(event, { xForwardedFor: true }) ?? null
}
