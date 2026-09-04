// Quatre publics, quatre vues.
//
// Ce composable ne DÉCIDE plus rien et ne se règle plus à la main : il reflète
// la session. Le rôle est celui que le serveur a mis dans /api/contenu, calculé
// à partir du cookie — donc la même source que le contenu affiché. Pas de
// second appel, pas de réglage local, et aucun moyen de « se mettre chef »
// depuis le navigateur.
//
// Ce qu'il masque n'est de toute façon pas ce qui protège : la protection est
// dans server/utils/droits.ts, refaite à chaque requête. Ici on ne fait que
// choisir quoi montrer d'un contenu que le serveur a déjà filtré.

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
    description: 'Voit en plus les contacts des staffs, les documents et les photos.',
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
    icone: 'lys',
  },
]

export function useRole() {
  const { contenu } = useContenu()

  const role = computed<Role>(() => {
    const r = contenu.value.role
    return r === 'parent' || r === 'anime' || r === 'chef' ? r : 'visiteur'
  })

  const estConnecte = computed(() => role.value !== 'visiteur')
  const estChef = computed(() => role.value === 'chef')
  const voitLesContacts = computed(() => role.value !== 'visiteur')
  const voitLesPhotos = computed(() => role.value !== 'visiteur')
  const voitLesDocumentsStaff = computed(() => role.value === 'chef')

  // Le calendrier des sections est réservé aux familles. Un visiteur voit que
  // l'unité se réunit le dimanche et à quelle heure, pas ce que chaque section
  // fait chaque semaine.
  const voitLeCalendrier = computed(() => role.value !== 'visiteur')
  const voitLeStaff = computed(() => role.value !== 'visiteur')
  const voitLesEvenementsInternes = computed(() => role.value !== 'visiteur')

  const definition = computed(
    () => rolesDisponibles.find((r) => r.cle === role.value) ?? rolesDisponibles[0]!,
  )

  return {
    role,
    definition,
    estConnecte,
    estChef,
    voitLesContacts,
    voitLesPhotos,
    voitLesDocumentsStaff,
    voitLeCalendrier,
    voitLeStaff,
    voitLesEvenementsInternes,
  }
}
