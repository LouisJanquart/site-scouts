/**
 * Verser les actus et les événements des fichiers dans la base.
 *
 *   npm run base:publications
 *
 * À lancer une fois, après la migration 0004. Tout arrive publié — le site ne
 * change donc pas d'un pouce — mais marqué « à relire » : la page publique
 * garde son avertissement tant qu'un staff ne l'a pas ouvert et enregistré
 * depuis /gestion.
 *
 * Relancer le script ne fait pas de doublon et n'écrase rien : une actu dont
 * l'adresse existe déjà en base est laissée telle quelle, même si le fichier a
 * changé. Après l'import, c'est la base qui fait foi.
 */
import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../server/base/schema/index.ts'
import { actus } from '../server/donnees/actus.ts'
import { evenements } from '../server/donnees/evenements.ts'

const url = process.env.NUXT_BASE_URL || process.env.DATABASE_URL
if (!url) throw new Error('NUXT_BASE_URL manquant.')
const sql = postgres(url, { max: 1 })
const base = drizzle(sql, { schema })

async function main() {
  const a = await base
    .insert(schema.actus)
    .values(
      actus.map((x) => ({
        slug: x.slug,
        titre: x.titre,
        date: x.date,
        sections: x.sections,
        chapo: x.chapo,
        corps: x.corps,
        public: x.public,
        statut: 'publie',
        aRelire: true,
      })),
    )
    .onConflictDoNothing({ target: schema.actus.slug })
    .returning({ slug: schema.actus.slug })

  const e = await base
    .insert(schema.evenements)
    .values(
      evenements.map((x) => ({
        slug: x.slug,
        titre: x.titre,
        date: x.date,
        dateFin: x.dateFin ?? null,
        heure: x.heure ?? null,
        lieu: x.lieu,
        section: x.section,
        resume: x.resume,
        description: x.description,
        public: x.public,
        inscription: x.inscription ?? false,
        photo: x.photo ?? null,
        statut: 'publie',
        aRelire: true,
      })),
    )
    .onConflictDoNothing({ target: schema.evenements.slug })
    .returning({ slug: schema.evenements.slug })

  console.log(`· actus : ${a.length} importées sur ${actus.length}`)
  console.log(`· événements : ${e.length} importés sur ${evenements.length}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => sql.end())
