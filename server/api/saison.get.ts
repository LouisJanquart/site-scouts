import { eq } from 'drizzle-orm'
import { saisons } from '../base/schema'

// Ce que le formulaire d'inscription a besoin de savoir avant de commencer :
// y a-t-il une saison ouverte, et combien coûte la cotisation. Rien de privé.
export default defineEventHandler(async () => {
  const [saison] = await useBaseDeDonnees().select().from(saisons).where(eq(saisons.active, true)).limit(1)
  if (!saison) return { ouverte: false as const }

  const maintenant = Date.now()
  const pasEncore = saison.ouvertureInscriptions
    ? maintenant < saison.ouvertureInscriptions.getTime()
    : false
  const close = saison.clotureInscriptions
    ? maintenant > saison.clotureInscriptions.getTime()
    : false

  return {
    ouverte: !pasEncore && !close,
    pasEncore,
    close,
    libelle: saison.libelle,
    debut: saison.debut,
    // Le barème complet, pour que le formulaire puisse annoncer le bon montant
    // avant même que le dossier existe.
    bareme: baremeDeLaSaison(saison),
    supplementLocalCentimes: saison.supplementLocalCentimes,
    ouvertureInscriptions: saison.ouvertureInscriptions,
    clotureInscriptions: saison.clotureInscriptions,
  }
})
