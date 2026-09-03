// La communication structurée belge : +++123/4567/89012+++
//
// Douze chiffres : dix libres, puis deux de contrôle qui valent le reste de la
// division des dix premiers par 97 (et 97 quand ce reste vaut zéro). C'est ce
// que la banque vérifie ; une communication mal formée est rejetée à la saisie.
export function communicationStructuree(numero: number): string {
  const base = String(Math.abs(Math.trunc(numero))).padStart(10, '0').slice(-10)
  const reste = Number(base) % 97 || 97
  const douze = base + String(reste).padStart(2, '0')
  return `+++${douze.slice(0, 3)}/${douze.slice(3, 7)}/${douze.slice(7)}+++`
}

// Un numéro de dossier lisible et non devinable : l'année de la saison, puis un
// tirage. On ne prend pas un compteur qui s'incrémente : il dirait à chacun
// combien d'enfants sont inscrits.
export function numeroDossier(anneeSaison: number): number {
  return anneeSaison * 1_000_000 + Math.floor(Math.random() * 1_000_000)
}
