// Qui suis-je ? La réponse sert au client à savoir quoi afficher. Elle ne
// contient rien de plus que l'identité et les rôles : le détail se demande
// route par route, avec son propre contrôle.
export default defineEventHandler((event) => {
  const u = event.context.compte
  if (!u) return { connecte: false as const }
  return {
    connecte: true as const,
    prenom: u.prenom,
    nom: u.nom,
    email: u.email,
    roles: u.roles,
  }
})
