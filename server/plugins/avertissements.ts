// Ce qui doit sauter aux yeux au démarrage.
//
// Un serveur qui tourne avec un simulateur de paiement, ou sans clé de
// chiffrement, ne doit jamais le faire en silence : c'est comme ça qu'une
// installation de test finit par accueillir de vraies familles.
export default defineNitroPlugin(() => {
  const dire = (s: string) => console.warn(`\n  ${s}\n`)

  if (modeDemo()) {
    dire(
      '⚠  SIMULATEUR DE PAIEMENT ACTIF — aucun argent ne circule.\n' +
        '   Renseignez NUXT_MOLLIE_CLE pour encaisser pour de vrai.',
    )
  }
  if (!process.env.NUXT_CLE_SANTE) {
    dire('⚠  NUXT_CLE_SANTE absente — les fiches santé ne pourront pas être enregistrées.')
  }
  if (!process.env.NUXT_SMTP_HOTE) {
    dire('⚠  SMTP non configuré — les courriels s’affichent dans cette console au lieu de partir.')
  }
})
