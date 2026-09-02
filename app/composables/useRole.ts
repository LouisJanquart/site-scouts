// Quatre publics, quatre vues. Tant qu'il n'y a pas d'authentification, le
// rôle est un simple état local que l'on peut changer depuis le sélecteur en
// bas de l'écran. Rien de ce que ce composable masque n'est protégé : voir la
// note en tête de app/data/staff.ts.

export type Role = 'visiteur' | 'parent' | 'anime' | 'chef'

export interface DefinitionRole {
  cle: Role
  nom: string
  description: string
  icone: string
}

export const rolesDisponibles: DefinitionRole[] = [
  {
    cle: 'visiteur',
    nom: 'Visiteur',
    description: "Quelqu'un qui découvre l'unité. Ne voit que les pages publiques.",
    icone: 'profil',
  },
  {
    cle: 'parent',
    nom: 'Parent',
    description: "Voit en plus les contacts des staffs, les documents et les photos.",
    icone: 'main',
  },
  {
    cle: 'anime',
    nom: 'Animé',
    description: 'Voit sa section, les photos et les ressources qui le concernent.',
    icone: 'etoile',
  },
  {
    cle: 'chef',
    nom: 'Chef',
    description: "Accès complet : documents de staff, comptes rendus, ressources d'animation.",
    icone: 'bouclier',
  },
]

const CLE_STOCKAGE = '16e-role'

export function useRole() {
  const role = useState<Role>('role', () => 'visiteur')

  // Restauration à la volée, protégée : certains contextes (navigation privée,
  // stockage désactivé) font lever une exception au simple accès.
  onMounted(() => {
    try {
      const enregistre = localStorage.getItem(CLE_STOCKAGE) as Role | null
      if (enregistre && rolesDisponibles.some((r) => r.cle === enregistre)) {
        role.value = enregistre
      }
    } catch {
      // tant pis, on reste sur « visiteur »
    }
  })

  function definirRole(nouveau: Role) {
    role.value = nouveau
    try {
      localStorage.setItem(CLE_STOCKAGE, nouveau)
    } catch {
      // sans persistance, le choix ne vaut que pour la session
    }
  }

  const estConnecte = computed(() => role.value !== 'visiteur')
  const estChef = computed(() => role.value === 'chef')
  const voitLesContacts = computed(() => role.value !== 'visiteur')
  const voitLesPhotos = computed(() => role.value !== 'visiteur')
  const voitLesDocumentsStaff = computed(() => role.value === 'chef')

  const definition = computed(
    () => rolesDisponibles.find((r) => r.cle === role.value) ?? rolesDisponibles[0]!,
  )

  return {
    role,
    definition,
    definirRole,
    estConnecte,
    estChef,
    voitLesContacts,
    voitLesPhotos,
    voitLesDocumentsStaff,
  }
}
