// Réservé au staff. Même remarque : l'API refuse de toute façon.
export default defineNuxtRouteMiddleware(async (to) => {
  const { charger, connecte, estStaff } = useCompte()
  await charger()
  if (!connecte.value) return navigateTo(`/connexion?suite=${encodeURIComponent(to.fullPath)}`)
  if (!estStaff.value) {
    throw createError({ statusCode: 403, statusMessage: 'Cette partie du site est réservée au staff.' })
  }
})
