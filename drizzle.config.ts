import type { Config } from 'drizzle-kit'

export default {
  schema: './server/base/schema/index.ts',
  out: './server/base/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NUXT_BASE_URL || process.env.DATABASE_URL || '',
  },
  casing: 'snake_case',
} satisfies Config
