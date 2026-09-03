import nodemailer from 'nodemailer'

// ---------------------------------------------------------------------------
// L'envoi de courriels.
//
// Un simple SMTP : celui de la boîte de l'unité, ou d'un service d'envoi. Aucun
// service tiers imposé — il suffit de quatre variables d'environnement.
//
// Sans configuration (en développement), on n'envoie rien : on écrit le message
// dans la console du serveur. C'est ce qui permet de dérouler tout le parcours
// d'inscription sans boîte mail.
// ---------------------------------------------------------------------------

let transport: nodemailer.Transporter | null = null

function trouverTransport() {
  if (transport) return transport
  const hote = process.env.NUXT_SMTP_HOTE
  if (!hote) return null
  transport = nodemailer.createTransport({
    host: hote,
    port: Number(process.env.NUXT_SMTP_PORT ?? 587),
    secure: process.env.NUXT_SMTP_TLS === 'direct',
    auth: process.env.NUXT_SMTP_UTILISATEUR
      ? {
          user: process.env.NUXT_SMTP_UTILISATEUR,
          pass: process.env.NUXT_SMTP_MOTDEPASSE,
        }
      : undefined,
  })
  return transport
}

export interface Courriel {
  a: string
  sujet: string
  texte: string
  html?: string
}

export async function envoyerCourriel(courriel: Courriel) {
  const t = trouverTransport()
  const de = process.env.NUXT_SMTP_EXPEDITEUR ?? '16e Fleurus <ne-pas-repondre@localhost>'

  if (!t) {
    console.info(
      `\n─── courriel non envoyé (SMTP non configuré) ───\nÀ : ${courriel.a}\nObjet : ${courriel.sujet}\n\n${courriel.texte}\n───────────────────────────────────────────────\n`,
    )
    return { envoye: false as const }
  }

  await t.sendMail({
    from: de,
    to: courriel.a,
    subject: courriel.sujet,
    text: courriel.texte,
    html: courriel.html ?? gabarit(courriel.sujet, courriel.texte),
  })
  return { envoye: true as const }
}

// Un gabarit sobre, en tableau, parce que c'est encore ce que les clients de
// messagerie affichent le plus fidèlement.
function gabarit(titre: string, texte: string) {
  const corps = texte
    .split('\n\n')
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${echapper(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f4f6;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#10111a;padding:20px 28px;color:#fff;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:14px">16<sup>e</sup> Fleurus</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:19px;line-height:1.3">${echapper(titre)}</h1>
${corps}
</td></tr>
<tr><td style="padding:16px 28px;background:#f4f4f6;font-size:12px;color:#6b6b76">
Ce message vous est envoyé par l'unité scoute et guide 16<sup>e</sup> Fleurus. Vous pouvez exercer vos droits sur vos données à tout moment depuis votre espace, rubrique « Mes données ».
</td></tr>
</table></td></tr></table></body></html>`
}

function echapper(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
}

export function urlDuSite() {
  return (process.env.NUXT_PUBLIC_URL_SITE ?? 'http://localhost:3000').replace(/\/$/, '')
}
