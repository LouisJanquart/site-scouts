import { z } from 'zod'

// Les formulaires d'une actu et d'un événement, partagés par la création et la
// modification. Ils vivent ici et pas dans server/api/ : tout fichier rangé
// là-bas devient une adresse de l'API.
//
// Les textes longs arrivent tels que tapés dans la zone de saisie : une ligne
// vide sépare deux paragraphes.

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Une date au format AAAA-MM-JJ.')
const publicCible = z.enum(['tous', 'parents', 'animes', 'chefs'])
const statut = z.enum(['brouillon', 'publie'])

export const formeActu = z.object({
  titre: z.string().trim().min(3, 'Un titre, au moins quelques mots.').max(160),
  date,
  sections: z.array(z.string()).max(8).default([]),
  chapo: z.string().trim().max(400).default(''),
  corps: z.string().trim().max(8000).default(''),
  public: publicCible,
  statut,
})

export const formeEvenement = z
  .object({
    titre: z.string().trim().min(3, 'Un titre, au moins quelques mots.').max(160),
    date,
    dateFin: date.or(z.literal('')).nullish(),
    heure: z.string().trim().max(40).nullish(),
    lieu: z.string().trim().max(200).default(''),
    section: z.string().nullish(),
    resume: z.string().trim().max(400).default(''),
    description: z.string().trim().max(8000).default(''),
    public: publicCible,
    inscription: z.boolean().default(false),
    // Un chemin vers une image du site (/images/…). L'envoi de photos viendra
    // avec le module Photos.
    photo: z
      .string()
      .trim()
      .regex(/^(\/images\/[\w./-]+)?$/, 'Une image du site, sous la forme /images/nom.jpg.')
      .nullish(),
    statut,
  })
  .refine((e) => !e.dateFin || e.dateFin >= e.date, {
    message: 'La fin ne peut pas tomber avant le début.',
    path: ['dateFin'],
  })

export function verifierSections(sections: string[]) {
  const inconnues = sections.filter((s) => !slugsDeSection.includes(s))
  if (inconnues.length) {
    throw createError({ statusCode: 422, statusMessage: `Section inconnue : ${inconnues.join(', ')}.` })
  }
}

/** Ce qu'on écrit en base à partir du formulaire d'un événement. */
export function valeursEvenement(recu: z.infer<typeof formeEvenement>) {
  return {
    titre: recu.titre,
    date: recu.date,
    dateFin: recu.dateFin || null,
    heure: recu.heure || null,
    lieu: recu.lieu,
    section: recu.section || null,
    resume: recu.resume,
    description: recu.description,
    public: recu.public,
    inscription: recu.inscription,
    photo: recu.photo || null,
    statut: recu.statut,
  }
}
