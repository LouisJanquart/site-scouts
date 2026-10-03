// Tout le contenu réservé en une requête, filtré selon le compte.
//
// Une seule route plutôt que six : les pages en ont besoin par grappes — le
// tableau de bord veut le planning, les événements et les actus d'un coup — et
// une requête vaut mieux que six sur une connexion mobile un samedi soir.
export default defineEventHandler(async (event) => {
  const contenu = await contenuPour(event)

  // Un visiteur reçoit toujours la même réponse : elle peut être mise en cache
  // par le navigateur. Une réponse qui dépend du compte, jamais.
  //
  // Et surtout « Vary: Cookie ». Sans lui, la réponse « visiteur » mise en
  // cache avant la connexion était resservie APRÈS : on se connectait, et le
  // site restait en vue publique pendant cinq minutes. Le cache doit être
  // indexé sur le cookie de session, pas seulement sur l'adresse.
  setHeader(event, 'vary', 'Cookie')
  setHeader(
    event,
    'cache-control',
    contenu.role === 'visiteur' ? 'public, max-age=300' : 'private, no-store',
  )

  return contenu
})
