// Le même chiffrement que server/utils/chiffrement.ts, mais utilisable depuis un
// script en ligne de commande, où les fonctions auto-importées de Nitro
// (createError) n'existent pas.
import { createCipheriv, randomBytes, createHash } from 'node:crypto'

export function chiffrer(valeur: unknown) {
  const brut = process.env.NUXT_CLE_SANTE
  if (!brut) throw new Error('NUXT_CLE_SANTE manquante.')
  const essai = Buffer.from(brut, 'base64')
  const cle = essai.length === 32 ? essai : createHash('sha256').update(brut).digest()
  const vecteur = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', cle, vecteur)
  const contenuChiffre = Buffer.concat([c.update(JSON.stringify(valeur), 'utf8'), c.final()])
  return { contenuChiffre, vecteur, sceau: c.getAuthTag(), versionCle: 1 }
}
