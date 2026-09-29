// Les sections, fusionnées : le fichier pour les valeurs par défaut, la base
// pour ce que les staffs ont corrigé. Public, comme le contenu qu'elle sert :
// le nom d'une section et son résumé sont sur les affiches de l'unité.
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=60')
  return { sections: await sectionsFusionnees() }
})
