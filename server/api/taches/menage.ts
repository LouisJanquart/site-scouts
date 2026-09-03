// Le ménage RGPD déclenché de l'extérieur, pour les hébergements sans serveur.
//
// Vercel Cron appelle en GET avec « Authorization: Bearer <CRON_SECRET> ». On
// accepte aussi un secret à nous et n'importe quelle méthode, pour tout autre
// planificateur. Sans secret configuré, la route est fermée : une purge que
// n'importe qui peut déclencher n'est pas une purge, c'est une arme.
export default defineEventHandler(async (event) => {
  const attendu = process.env.CRON_SECRET || process.env.NUXT_CRON_SECRET
  if (!attendu) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Le ménage automatique n’est pas configuré (CRON_SECRET absent).',
    })
  }

  const donne =
    getRequestHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '') ??
    getRequestHeader(event, 'x-cron-secret')

  if (donne !== attendu) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé.' })
  }

  const compte = await fairePropre()
  await journaliser(null, 'suppression', 'menage', null, JSON.stringify(compte))
  return { ok: true, ...compte }
})
