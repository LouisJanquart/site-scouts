import { parSlug } from '~/data/sections'

// La section consultée, déduite de l'adresse.
//
// Les pages d'une section sont des routes imbriquées : « /sections/lutins »,
// « /sections/lutins/agenda », etc. Le parent tient l'en-tête et les onglets,
// chaque enfant tient son contenu. Tous ont besoin de la même section : plutôt
// que de la passer de main en main, chacun la relit ici.
export function useSectionCourante() {
  const route = useRoute()
  const slug = computed(() => String(route.params.slug))
  const section = computed(() => parSlug[slug.value] ?? null)
  return { slug, section }
}
