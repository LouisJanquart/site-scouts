import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto'

// ---------------------------------------------------------------------------
// Chiffrement des données de santé (article 9 du RGPD).
//
// AES-256-GCM : confidentialité et intégrité d'un coup. La clé vient de
// l'environnement du serveur, jamais de la base. Une sauvegarde de la base qui
// fuiterait ne contient donc rien de lisible sur la santé des enfants.
//
// Contrepartie assumée : perdre la clé, c'est perdre les fiches. Elle doit être
// sauvegardée ailleurs que sur le serveur. Voir docs/exploitation.md.
// ---------------------------------------------------------------------------

export interface Coffre {
  contenuChiffre: Buffer
  vecteur: Buffer
  sceau: Buffer
  versionCle: number
}

function cle(): Buffer {
  const brut = process.env.NUXT_CLE_SANTE
  if (!brut) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "La clé de chiffrement des fiches santé n'est pas configurée (NUXT_CLE_SANTE).",
    })
  }
  // On accepte une clé en base64 de 32 octets, ou n'importe quelle phrase assez
  // longue, réduite par SHA-256. La première forme est celle recommandée.
  const essai = Buffer.from(brut, 'base64')
  if (essai.length === 32) return essai
  if (brut.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_CLE_SANTE est trop courte : il faut 32 octets en base64.',
    })
  }
  return createHash('sha256').update(brut).digest()
}

export function chiffrer(valeur: unknown): Coffre {
  const vecteur = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', cle(), vecteur)
  const contenuChiffre = Buffer.concat([
    c.update(JSON.stringify(valeur), 'utf8'),
    c.final(),
  ])
  return { contenuChiffre, vecteur, sceau: c.getAuthTag(), versionCle: 1 }
}

export function dechiffrer<T = unknown>(coffre: Coffre): T {
  const d = createDecipheriv('aes-256-gcm', cle(), Buffer.from(coffre.vecteur))
  d.setAuthTag(Buffer.from(coffre.sceau))
  const clair = Buffer.concat([
    d.update(Buffer.from(coffre.contenuChiffre)),
    d.final(),
  ]).toString('utf8')
  return JSON.parse(clair) as T
}
