// Tout le contenu réservé en une requête, filtré selon le compte.
//
// Une seule route plutôt que six : les pages en ont besoin par grappes — le
// tableau de bord veut le planning, les événements et les actus d'un coup — et
// une requête vaut mieux que six sur une connexion mobile un dimanche soir.
export default defineEventHandler((event) => {
  const contenu = contenuPour(event)

  // Un visiteur reçoit toujours la même réponse : elle peut être mise en cache
  // par le navigateur. Une réponse qui dépend du compte, jamais.
  setHeader(
    event,
    'cache-control',
    contenu.role === 'visiteur' ? 'public, max-age=300' : 'private, no-store',
  )

  return contenu
})
