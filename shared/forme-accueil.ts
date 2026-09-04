// ---------------------------------------------------------------------------
// La silhouette de l'accueil, en pixels.
//
// Relevée sur Desktop-7 : le tracé exact de l'encart est celui exporté par
// Figma, et le découpage de la photo a été ajusté sur l'image du calque
// « main » — les deux masques se recouvrent à 99,95 %.
//
// Elle est en PIXELS, et pas en proportions, parce que c'est ainsi que la page
// est construite : l'écran d'accueil fait exactement la taille de la fenêtre,
// les blocs des côtés gardent leurs dimensions, et c'est le panneau central qui
// s'étire. Un découpage proportionnel étirerait aussi l'entaille de la barre
// d'outils et l'encoche de l'encart, qui doivent rester à la taille de ce
// qu'elles logent. On recalcule donc le tracé à chaque changement de taille.
//
// Toutes les mesures sont des multiples de 16, comme le reste de la maquette.
// ---------------------------------------------------------------------------

/** Rayon des coins du panneau. */
export const RAYON = 64
/** Gouttière : ce que le fond de page laisse voir entre deux blocs. */
export const GOUTTIERE = 32

/** L'encart du jour : taille fixe, calé en bas à gauche du panneau. */
export const ENCART = { largeur: 409, hauteur: 420 }

/** L'entaille du coin supérieur droit, où se loge la barre d'outils (256×64). */
export const ENTAILLE = { largeur: 256 + GOUTTIERE, hauteur: 64 + GOUTTIERE, rayon: 48 }

// Les deux pentes de l'encart, telles que Figma les exporte : « x = m·y + c ».
// La douce en haut (deux et demie d'avancée pour une de descente), la raide à
// droite (une avancée pour presque trois de descente).
const PENTE_HAUT = (294.14 - 84.0289) / (87.7859 - 4.31154)
const PENTE_DROITE = (405.041 - 329.935) / (333.567 - 125.189)

/** Le tracé de l'encart, tel qu'exporté par Figma, posé en bas à gauche. */
export function cheminEncart(_largeur: number, hauteur: number): string {
  const y = hauteur - ENCART.hauteur
  const p = (a: number, b: number) => `${a.toFixed(2)},${(b + y).toFixed(2)}`
  return (
    `M${p(405.041, 333.567)}` +
    `C${p(420.126, 375.42)} ${p(390.231, 420)} ${p(347.081, 420)}` +
    `H61.8638` +
    `C${p(27.6974, 420)} ${p(0, 391.327)} ${p(0, 355.956)}` +
    `V${(64.1036 + y).toFixed(2)}` +
    `C${p(0, 19.1792)} ${p(43.5146, -11.7843)} ${p(84.0289, 4.31154)}` +
    `L${p(294.14, 87.7859)}` +
    `C${p(310.699, 94.3647)} ${p(323.734, 107.985)} ${p(329.935, 125.189)}` +
    `L${p(405.041, 333.567)}Z`
  )
}

type Sommet = [number, number, number] // x, y, rayon

/** Les sommets de la photo : rectangle arrondi, moins ses deux morsures. */
function sommetsPhoto(L: number, H: number): Sommet[] {
  // Les pentes de l'encoche sont celles de l'encart, écartées d'une gouttière.
  const hautEncart = H - ENCART.hauteur
  const cHaut =
    84.0289 - PENTE_HAUT * (hautEncart + 4.31154) + GOUTTIERE * Math.hypot(1, PENTE_HAUT)
  const cDroite =
    329.935 - PENTE_DROITE * (hautEncart + 125.189) + GOUTTIERE * Math.hypot(1, PENTE_DROITE)

  const ySommetGauche = -cHaut / PENTE_HAUT // là où la pente douce touche le bord gauche
  const yJoint = (cDroite - cHaut) / (PENTE_HAUT - PENTE_DROITE)
  const xJoint = PENTE_HAUT * yJoint + cHaut
  const xBas = PENTE_DROITE * H + cDroite // là où la pente raide touche le bas

  return [
    [0, 0, RAYON],
    [L - ENTAILLE.largeur, 0, ENTAILLE.rayon],
    [L - ENTAILLE.largeur, ENTAILLE.hauteur, ENTAILLE.rayon],
    [L, ENTAILLE.hauteur, RAYON],
    [L, H, RAYON],
    [xBas, H, RAYON],
    [xJoint, yJoint, RAYON],
    [0, ySommetGauche, RAYON],
  ]
}

/** Un polygone dont chaque sommet est adouci par un arc de cercle. */
function arrondir(sommets: Sommet[]): string {
  const n = sommets.length
  const bouts = sommets.map(([x, y, r], i) => {
    const [px, py] = sommets[(i - 1 + n) % n]!
    const [nx, ny] = sommets[(i + 1) % n]!
    const l1 = Math.hypot(px - x, py - y)
    const l2 = Math.hypot(nx - x, ny - y)
    const u1: [number, number] = [(px - x) / l1, (py - y) / l1]
    const u2: [number, number] = [(nx - x) / l2, (ny - y) / l2]
    const angle = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])))
    const t = Math.min(r / Math.tan(angle / 2), l1 / 2.0001, l2 / 2.0001)
    const rr = t * Math.tan(angle / 2)
    const croix = u1[0] * u2[1] - u1[1] * u2[0]
    return {
      a: [x + u1[0] * t, y + u1[1] * t] as [number, number],
      b: [x + u2[0] * t, y + u2[1] * t] as [number, number],
      rr,
      sens: croix < 0 ? 1 : 0,
    }
  })
  const f = (p: [number, number]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`
  let d = `M${f(bouts[0]!.a)}`
  bouts.forEach((c, i) => {
    if (i > 0) d += ` L${f(c.a)}`
    d += ` A${c.rr.toFixed(2)},${c.rr.toFixed(2)} 0 0 ${c.sens} ${f(c.b)}`
  })
  return d + ' Z'
}

/** Le tracé de la photo pour un panneau de L × H pixels. */
export function cheminPhoto(L: number, H: number): string {
  return arrondir(sommetsPhoto(L, H))
}
