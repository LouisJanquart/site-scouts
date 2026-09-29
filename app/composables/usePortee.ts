import { bornesSections } from '#shared/orientation'

// La portée du back office : « toute l'unité » ou une section.
//
// Elle est partagée par tous les modules et suit l'adresse (?section=lutins),
// pour qu'un lien envoyé à quelqu'un ouvre la même vue. Attention à ce qu'elle
// est et n'est pas : un filtre d'affichage. Les droits, eux, sont refaits par
// le serveur à chaque requête — un chef qui bricole l'adresse ne verra jamais
// une autre section que la sienne, l'API la lui refuse.
export function usePortee() {
  const { estCU, mesSections } = useCompte()
  const route = useRoute()
  const router = useRouter()

  const portee = useState<string>('gestion-portee', () => '')

  // L'adresse fait foi à l'arrivée, l'état ensuite.
  const depuisAdresse = String(route.query.section ?? '')
  if (depuisAdresse && depuisAdresse !== portee.value) portee.value = depuisAdresse

  const sectionsPossibles = computed(() =>
    estCU.value ? bornesSections.map((s) => s.slug) : mesSections.value,
  )

  const nomDeSection = (slug: string) =>
    bornesSections.find((s) => s.slug === slug)?.nom ?? slug

  const nomPortee = computed(() =>
    portee.value
      ? nomDeSection(portee.value)
      : estCU.value
        ? 'Toute l’unité'
        : sectionsPossibles.value.length > 1
          ? 'Mes sections'
          : nomDeSection(sectionsPossibles.value[0] ?? ''),
  )

  function choisir(slug: string) {
    portee.value = slug
    router.replace({ query: { ...route.query, section: slug || undefined } })
  }

  /** Est-ce que cette ligne entre dans la portée choisie ? */
  function concerne(slug?: string | null) {
    return !portee.value || slug === portee.value
  }

  return { portee, sectionsPossibles, nomDeSection, nomPortee, choisir, concerne }
}
