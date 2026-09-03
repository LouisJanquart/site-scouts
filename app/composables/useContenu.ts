import type { JourPlanning } from '#shared/planning'

// ---------------------------------------------------------------------------
// Le contenu réservé, côté navigateur.
//
// Il ne vient plus d'un fichier importé — il n'y en a plus dans le paquet
// public — mais de /api/contenu, qui décide ce qu'on a le droit de voir. Le
// chargement se fait dans app/plugins/contenu.ts ; ici on ne fait que lire.
//
// Conséquence à garder en tête : le contenu peut être vide le temps d'une
// requête. Toute page qui l'affiche doit supporter de commencer avec des
// tableaux vides.
// ---------------------------------------------------------------------------

export interface ContenuReserve {
  role: string
  saison: string
  planning: JourPlanning[]
  evenements: any[]
  actus: any[]
  documents: any[]
  categoriesDocuments: { cle: string; nom: string }[]
  staff: {
    prenom: string
    totem: string | null
    section: string
    chefDeStaff?: boolean
    note?: string
  }[]
  adressesDeSection: Record<string, string>
  totalChefs: number
}

export function contenuVide(): ContenuReserve {
  return {
    role: 'visiteur',
    saison: '',
    planning: [],
    evenements: [],
    actus: [],
    documents: [],
    categoriesDocuments: [],
    staff: [],
    adressesDeSection: {},
    totalChefs: 0,
  }
}

export function useContenu() {
  const contenu = useState<ContenuReserve>('contenu-reserve', contenuVide)

  /** À appeler après une connexion ou une déconnexion. */
  async function rafraichir() {
    try {
      contenu.value = await $fetch<ContenuReserve>('/api/contenu', {
        credentials: 'same-origin',
      })
    } catch {
      /* on garde ce qu'on a */
    }
  }

  return {
    contenu,
    rafraichir,
    chargement: computed(() => contenu.value.planning.length === 0),
    planning: computed(() => contenu.value.planning),
    evenements: computed(() => contenu.value.evenements),
    actus: computed(() => contenu.value.actus),
    documents: computed(() => contenu.value.documents),
    staff: computed(() => contenu.value.staff),
    saison: computed(() => contenu.value.saison),
    adressesDeSection: computed(() => contenu.value.adressesDeSection),
    totalChefs: computed(() => contenu.value.totalChefs),
    chefsDeSection: (slug: string) =>
      contenu.value.staff.filter((c) => c.section === slug),
  }
}
