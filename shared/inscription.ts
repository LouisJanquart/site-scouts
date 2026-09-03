import { z } from 'zod'
import { consentementsObligatoires } from './consentements'

// ---------------------------------------------------------------------------
// La forme du dossier d'inscription, écrite une seule fois.
//
// Le même schéma sert au navigateur (pour dire tout de suite ce qui cloche) et
// au serveur (pour ne rien croire de ce qui arrive). Une règle écrite deux fois
// est une règle qui finira par diverger.
// ---------------------------------------------------------------------------

const texteCourt = (max = 120) => z.string().trim().min(1).max(max)

// Belgique et frontaliers : on reste permissif, on nettoie plutôt qu'on refuse.
const telephone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.\-/()]/g, ''))
  .refine((v) => /^\+?[0-9]{8,15}$/.test(v), 'Ce numéro de téléphone n’a pas l’air valide.')

const codePostal = z
  .string()
  .trim()
  .refine((v) => /^[0-9]{4,5}$/.test(v), 'Le code postal doit comporter quatre chiffres.')

export const adresseSchema = z.object({
  rue: texteCourt(160),
  numero: texteCourt(12),
  codePostal,
  localite: texteCourt(80),
  pays: z.string().trim().length(2).default('BE'),
})

export const enfantSchema = z.object({
  prenom: texteCourt(60),
  nom: texteCourt(60),
  dateNaissance: z
    .string()
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), 'Indiquez la date au format jour/mois/année.')
    .refine((v) => {
      const d = new Date(v)
      const age = (Date.now() - d.getTime()) / (365.25 * 864e5)
      return age > 3 && age < 30
    }, 'Cette date de naissance ne correspond à aucune de nos sections.'),
  genre: z.enum(['f', 'm', 'x', 'ne-se-prononce-pas']).optional(),
  adresse: adresseSchema,
  // Facultatifs : beaucoup d'enfants n'ont ni l'un ni l'autre.
  email: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
  telephone: telephone.optional().or(z.literal('')),
  sectionSlug: texteCourt(40),
})

export const responsableSchema = z.object({
  lien: z.enum(['mere', 'pere', 'parent', 'tuteur', 'autre']),
  prenom: texteCourt(60),
  nom: texteCourt(60),
  email: z.string().trim().toLowerCase().email('Cette adresse e-mail n’a pas l’air valide.'),
  telephone,
  // Un responsable qui n'a pas l'autorité parentale ne signe pas les
  // autorisations : il est là pour être appelé, pas pour décider.
  autoriteParentale: z.boolean().default(true),
  destinataireFacture: z.boolean().default(false),
  memeAdresseQueLEnfant: z.boolean().default(true),
  adresse: adresseSchema.optional(),
})

export const contactUrgenceSchema = z.object({
  nom: texteCourt(120),
  lien: z.string().trim().max(60).optional(),
  telephone,
})

// La fiche santé. Tout ce bloc part chiffré en base : voir server/utils/chiffrement.ts.
export const santeSchema = z.object({
  medecinNom: z.string().trim().max(120).optional(),
  medecinTelephone: telephone.optional().or(z.literal('')),
  mutuelle: z.string().trim().max(120).optional(),
  numeroAffiliationMutuelle: z.string().trim().max(40).optional(),
  tetanosAJour: z.boolean().optional(),
  tetanosDate: z.string().optional(),
  saitNager: z.boolean().optional(),
  allergies: z.array(z.string().trim().max(200)).max(20).default([]),
  regimesAlimentaires: z.array(z.string().trim().max(200)).max(20).default([]),
  traitements: z
    .array(
      z.object({
        libelle: texteCourt(160),
        posologie: z.string().trim().max(200).optional(),
        autonome: z.boolean().default(false),
      }),
    )
    .max(20)
    .default([]),
  antecedents: z.string().trim().max(2000).optional(),
  remarques: z.string().trim().max(2000).optional(),
})

export const consentementsSchema = z
  .record(z.string(), z.boolean())
  .refine(
    (v) => consentementsObligatoires.every((c) => v[c] === true),
    'Certaines autorisations sont indispensables pour inscrire un enfant.',
  )

export const dossierSchema = z
  .object({
    enfant: enfantSchema,
    responsables: z.array(responsableSchema).min(1, 'Il faut au moins un responsable.').max(4),
    contactsUrgence: z.array(contactUrgenceSchema).max(3).default([]),
    sante: santeSchema,
    consentements: consentementsSchema,
    remarqueFamille: z.string().trim().max(2000).optional(),
    // Renseigné seulement si le premier responsable n'a pas encore de compte.
    motDePasse: z.string().min(10).max(200).optional(),
    // La case « j'ai lu la politique de confidentialité », distincte du reste.
    politiqueLue: z.literal(true),
  })
  .refine(
    (d) => d.responsables.some((r) => r.autoriteParentale),
    {
      message: 'Au moins un responsable doit avoir l’autorité parentale.',
      path: ['responsables'],
    },
  )
  .refine((d) => d.responsables.some((r) => r.destinataireFacture), {
    message: 'Indiquez qui reçoit l’appel de cotisation.',
    path: ['responsables'],
  })

export type Dossier = z.infer<typeof dossierSchema>
export type Enfant = z.infer<typeof enfantSchema>
export type Responsable = z.infer<typeof responsableSchema>
export type Sante = z.infer<typeof santeSchema>
