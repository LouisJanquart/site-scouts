// ---------------------------------------------------------------------------
// La géométrie du bento à lignes obliques.
//
// La logique de Louise : on part d'une grille bento classique, on fusionne des
// cases en zones (pas toutes rectangulaires), puis on incline quelques lignes
// INTÉRIEURES pour casser la monotonie. Les bords extérieurs restent droits.
//
// Une composition se décrit donc par des lignes et des zones :
//
//   - une ligne passe par deux points. Chaque point est donné en fraction de la
//     largeur et de la hauteur de la composition, plus un décalage en pixels :
//     [fx, fy, px?, py?] → (fx × L + px, fy × H + py). Elle s'étire avec
//     l'écran au lieu d'être figée à 1312 px.
//   - un coin de zone est l'intersection de deux lignes, chacune décalée d'une
//     demi-gouttière du côté de la zone (+1 vers la droite ou vers le bas, -1
//     vers la gauche ou vers le haut, 0 pour un bord extérieur).
//
// Les quatre bords extérieurs existent d'office : haut, bas, gauche, droite.
// ---------------------------------------------------------------------------

export type PointRel = [number, number, number?, number?]
export type Coin = [string, -1 | 0 | 1, string, -1 | 0 | 1]

export interface ZoneSpec {
  coins: Coin[]
  /** Des quadrilatères où poser le contenu, pour une zone en L par exemple.
   *  Par défaut, la zone elle-même si elle a quatre coins. */
  boites?: Record<string, Coin[]>
}

export interface CompositionSpec {
  lignes: Record<string, [PointRel, PointRel]>
  zones: Record<string, ZoneSpec>
}

type P = { x: number; y: number }

export interface ZoneCalculee {
  nom: string
  points: P[]
  boite: { x: number; y: number; l: number; h: number }
  boites: Record<string, { x: number; y: number; l: number; h: number }>
  chemin: string
}

const DEMI_GOUTTIERE = 16

function resoudre(pt: PointRel, L: number, H: number): P {
  return { x: pt[0] * L + (pt[2] ?? 0), y: pt[1] * H + (pt[3] ?? 0) }
}

function ligne(spec: CompositionSpec, nom: string, L: number, H: number): [P, P] {
  const exterieures: Record<string, [PointRel, PointRel]> = {
    haut: [[0, 0], [1, 0]],
    bas: [[0, 1], [1, 1]],
    gauche: [[0, 0], [0, 1]],
    droite: [[1, 0], [1, 1]],
  }
  const def = spec.lignes[nom] ?? exterieures[nom]
  if (!def) throw new Error(`Ligne inconnue : ${nom}`)
  return [resoudre(def[0], L, H), resoudre(def[1], L, H)]
}

function decaler([a, b]: [P, P], cote: number): [P, P] {
  if (!cote) return [a, b]
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lg = Math.hypot(dx, dy) || 1
  // La normale, orientée vers les x croissants pour une ligne plutôt
  // verticale, vers les y croissants pour une ligne plutôt horizontale.
  let nx = -dy / lg
  let ny = dx / lg
  if (Math.abs(dy) > Math.abs(dx) ? nx < 0 : ny < 0) {
    nx = -nx
    ny = -ny
  }
  const d = cote * DEMI_GOUTTIERE
  return [
    { x: a.x + nx * d, y: a.y + ny * d },
    { x: b.x + nx * d, y: b.y + ny * d },
  ]
}

function croiser([a, b]: [P, P], [c, d]: [P, P]): P {
  const x1 = b.x - a.x
  const y1 = b.y - a.y
  const x2 = d.x - c.x
  const y2 = d.y - c.y
  const den = x1 * y2 - y1 * x2
  if (Math.abs(den) < 1e-9) return a
  const t = ((c.x - a.x) * y2 - (c.y - a.y) * x2) / den
  return { x: a.x + t * x1, y: a.y + t * y1 }
}

function coin(spec: CompositionSpec, c: Coin, L: number, H: number): P {
  return croiser(decaler(ligne(spec, c[0], L, H), c[1]), decaler(ligne(spec, c[2], L, H), c[3]))
}

/** Le plus grand rectangle droit dans un quadrilatère presque droit, donné
 *  dans l'ordre haut-gauche, haut-droite, bas-droite, bas-gauche. */
function rectangleInterieur(q: P[]) {
  const [hg, hd, bd, bg] = q as [P, P, P, P]
  const x = Math.max(hg.x, bg.x)
  const y = Math.max(hg.y, hd.y)
  const l = Math.min(hd.x, bd.x) - x
  const h = Math.min(bg.y, bd.y) - y
  return { x, y, l: Math.max(0, l), h: Math.max(0, h) }
}

/** Le contour arrondi d'un polygone. Le rayon se réduit sur les côtés courts. */
export function cheminArrondi(points: P[], rayon = 36, ox = 0, oy = 0): string {
  const n = points.length
  const f = (v: number) => Math.round(v * 100) / 100
  let d = ''
  for (let i = 0; i < n; i++) {
    const v = points[i]!
    const a0 = points[(i - 1 + n) % n]!
    const b0 = points[(i + 1) % n]!
    const la = Math.hypot(a0.x - v.x, a0.y - v.y)
    const lb = Math.hypot(b0.x - v.x, b0.y - v.y)
    const r = Math.min(rayon, la / 2, lb / 2)
    const a = { x: v.x + ((a0.x - v.x) * r) / la, y: v.y + ((a0.y - v.y) * r) / la }
    const b = { x: v.x + ((b0.x - v.x) * r) / lb, y: v.y + ((b0.y - v.y) * r) / lb }
    const c1 = { x: a.x + (v.x - a.x) * 0.667, y: a.y + (v.y - a.y) * 0.667 }
    const c2 = { x: b.x + (v.x - b.x) * 0.667, y: b.y + (v.y - b.y) * 0.667 }
    d +=
      `${i === 0 ? 'M' : 'L'} ${f(a.x - ox)} ${f(a.y - oy)} ` +
      `C ${f(c1.x - ox)} ${f(c1.y - oy)} ${f(c2.x - ox)} ${f(c2.y - oy)} ${f(b.x - ox)} ${f(b.y - oy)} `
  }
  return d + 'Z'
}

export function calculerComposition(spec: CompositionSpec, L: number, H: number): ZoneCalculee[] {
  return Object.entries(spec.zones).map(([nom, z]) => {
    const points = z.coins.map((c) => coin(spec, c, L, H))
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    const boite = {
      x: Math.min(...xs),
      y: Math.min(...ys),
      l: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
    }
    const defBoites = z.boites ?? (z.coins.length === 4 ? { contenu: z.coins } : {})
    const boites: ZoneCalculee['boites'] = {}
    for (const [k, quad] of Object.entries(defBoites)) {
      const r = rectangleInterieur(quad.map((c) => coin(spec, c, L, H)))
      // En coordonnées de la zone, pas de la composition.
      boites[k] = { x: r.x - boite.x, y: r.y - boite.y, l: r.l, h: r.h }
    }
    return { nom, points, boite, boites, chemin: cheminArrondi(points, 36, boite.x, boite.y) }
  })
}
