// Chaque requête arrive avec, ou sans, une session. On la lit une fois et on la
// range dans le contexte : tout le reste du serveur y lit event.context.compte.
export default defineEventHandler(async (event) => {
  // Sans cookie, il n'y a rien à lire : on n'ouvre même pas la base. C'est ce
  // qui permet aux pages publiques de rester gratuites en base de données.
  if (!getCookie(event, 'fleurus_session')) return
  try {
    event.context.compte = await lireSession(event)
  } catch (e) {
    console.error('[session] lecture impossible', e)
  }
})
