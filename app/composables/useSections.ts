import { sections as sectionsParDefaut, type Section } from '~/data/sections'

// Les sections telles qu'elles s'affichent.
//
// Le fichier importé reste la valeur sûre : il est dans le paquet, donc
// disponible tout de suite, même hors ligne et même si la base dort. Dès que
// /api/sections répond, ses textes remplacent les textes d'origine — ce sont
// ceux que les staffs ont corrigés eux-mêmes.
export function useSections() {
  const etat = useState<Section[] | null>('sections', () => null)

  async function charger() {
    try {
      const r = await $fetch<{ sections: Section[] }>('/api/sections')
      etat.value = r.sections
    } catch {
      /* on garde le fichier */
    }
  }

  const sections = computed(() => etat.value ?? sectionsParDefaut)
  const parSlug = computed(() => Object.fromEntries(sections.value.map((s) => [s.slug, s])))
  const sectionsAnimees = computed(() => sections.value.filter((s) => s.animee))

  return { sections, parSlug, sectionsAnimees, charger }
}
