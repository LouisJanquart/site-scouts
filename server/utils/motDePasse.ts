import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

// ---------------------------------------------------------------------------
// Mots de passe.
//
// scrypt, de la bibliothèque standard de Node. Pas de dépendance native, donc
// rien à recompiler le jour où l'on change d'hébergeur — ce qui compte pour un
// projet d'unité qui va vivre plus longtemps que ses développeurs.
//
// Les paramètres sont ceux recommandés par l'OWASP : N = 2^17, r = 8, p = 1.
// Ils sont rangés DANS l'empreinte, si bien qu'on peut les durcir plus tard
// sans invalider les mots de passe existants.
// ---------------------------------------------------------------------------

const N = 2 ** 17
const R = 8
const P = 1
const LONGUEUR = 64

export async function hacherMotDePasse(clair: string): Promise<string> {
  const sel = randomBytes(16)
  const derive = (await scryptAsync(clair.normalize('NFKC'), sel, LONGUEUR, {
    N, r: R, p: P, maxmem: 256 * 1024 * 1024,
  })) as Buffer
  return `scrypt$${N}$${R}$${P}$${sel.toString('base64')}$${derive.toString('base64')}`
}

export async function verifierMotDePasse(clair: string, empreinte: string): Promise<boolean> {
  const parts = empreinte.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, n, r, p, selB64, attenduB64] = parts
  const sel = Buffer.from(selB64!, 'base64')
  const attendu = Buffer.from(attenduB64!, 'base64')
  try {
    const derive = (await scryptAsync(clair.normalize('NFKC'), sel, attendu.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024,
    })) as Buffer
    return timingSafeEqual(derive, attendu)
  } catch {
    return false
  }
}

// Un mot de passe faible sur un site qui porte des fiches santé d'enfants, non.
// La règle est celle de l'ANSSI et du NIST : de la longueur avant tout, et un
// refus des mots de passe déjà vus mille fois — pas de charabia obligatoire.
const TROP_COURANTS = new Set([
  'motdepasse', 'password', '123456789', 'azertyuiop', 'qwertyuiop', 'scouts123',
  'baden-powell', 'badenpowell', 'motdepasse1', 'jetaime', 'soleil123', 'fleurus',
  '16efleurus', 'scoutisme', 'toujoursprêt', 'toujourspret', 'azerty123',
])

export function critiquerMotDePasse(clair: string, indices: string[] = []): string | null {
  const m = clair.normalize('NFKC')
  if (m.length < 10) return 'Le mot de passe doit faire au moins 10 caractères.'
  if (m.length > 200) return 'Le mot de passe ne peut pas dépasser 200 caractères.'
  const bas = m.toLowerCase()
  if (TROP_COURANTS.has(bas.replace(/[^a-z0-9]/g, ''))) {
    return 'Ce mot de passe est trop répandu. Prenez plutôt une phrase que vous seul connaissez.'
  }
  for (const indice of indices) {
    if (indice && indice.length >= 4 && bas.includes(indice.toLowerCase())) {
      return 'Le mot de passe ne doit pas contenir votre nom ni votre adresse e-mail.'
    }
  }
  if (/^(.)\1+$/.test(m)) return 'Le mot de passe ne peut pas être une seule lettre répétée.'
  return null
}

// Jetons de session, de vérification, de réinitialisation.
export function creerJeton(): string {
  return randomBytes(32).toString('base64url')
}

export function empreinteJeton(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex')
}
