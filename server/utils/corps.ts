import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

// Lecture et validation du corps d'une requête.
//
// Zod renvoie une erreur riche ; on la traduit en quelque chose qu'un formulaire
// sait afficher : un message général, et un message par champ.
export async function lireCorps<T>(event: H3Event, forme: ZodType<T>): Promise<T> {
  const brut = await readBody(event).catch(() => ({}))
  const r = forme.safeParse(brut)
  if (!r.success) {
    const champs: Record<string, string> = {}
    for (const p of r.error.issues) {
      const cle = p.path.join('.')
      if (cle && !champs[cle]) champs[cle] = p.message
    }
    throw createError({
      statusCode: 422,
      statusMessage: 'Le formulaire comporte des erreurs.',
      data: { champs },
    })
  }
  return r.data
}
