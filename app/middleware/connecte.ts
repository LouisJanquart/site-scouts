// Garde de navigation : rediriger vers la connexion plutôt que d'afficher une
// page vide. Ce n'est qu'un confort — la protection réelle est dans l'API.
export default defineNuxtRouteMiddleware(async (to) => {
  const { charger, connecte } = useCompte()
  await charger()
  if (!connecte.value) {
    return navigateTo(`/connexion?suite=${encodeURIComponent(to.fullPath)}`)
  }
})
