// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-02',

  // Où Nuxt écrit ses fichiers de travail.
  //
  // Par défaut, dans le dossier du projet, ce qui va très bien. Mais il arrive
  // que ce dossier soit synchronisé, sauvegardé en continu ou monté avec des
  // droits restreints — et Nuxt, qui efface et recrée son dossier de travail à
  // chaque démarrage, se bloque alors sur un « operation not permitted ».
  // Ces deux variables permettent de le déplacer ailleurs sans rien changer au
  // dépôt.
  buildDir: process.env.NUXT_BUILD_DIR || undefined,
  devtools: { enabled: true },
  ssr: true,

  css: ['~/assets/scss/style.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: '@use "~/assets/scss/abstracts" as *;',
        },
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: '16e Fleurus',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            "Unité scoute et guide 16e Fleurus, Notre-Dame des Champs. Sept sections, des réunions tous les dimanches, des camps chaque été. Depuis 1968.",
        },
        { name: 'theme-color', content: '#10111A' },

        // Aperçu au partage. L'image est produite par un rendu de la page
        // d'accueil, pas dessinée à part : elle reste juste si le site change.
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '16e Fleurus' },
        { property: 'og:locale', content: 'fr_BE' },
        { property: 'og:title', content: '16e Fleurus — unité scoute et guide' },
        {
          property: 'og:description',
          content:
            'Six sections, des réunions tous les dimanches de septembre à mai, un camp chaque été. Notre-Dame des Champs, depuis 1968.',
        },
        // URL absolue : Facebook et quelques autres refusent un chemin relatif.
        // À changer le jour où l'unité aura son propre nom de domaine.
        { property: 'og:image', content: 'https://16e-fleurus.netlify.app/og.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&family=IBM+Plex+Mono:wght@400;500&family=Poppins:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // Deux sites en un.
  //
  // La partie publique est faite de pages qui ne changent qu'au déploiement :
  // elles sont fabriquées une fois pour toutes, servies en fichiers, et ne
  // touchent jamais la base. C'est ce qui garde le site rapide et ce qui fait
  // qu'une panne de base de données n'empêche pas de lire les horaires.
  //
  // La partie privée — inscription, espace famille, back office — est rendue
  // dans le navigateur uniquement. Aucune donnée personnelle ne traverse le
  // HTML : la page arrive vide et va chercher ce à quoi le compte a droit.
  // -------------------------------------------------------------------------
  routeRules: {
    '/inscription/**': { prerender: false, ssr: false },
    '/connexion/**': { prerender: false, ssr: false },
    '/connexion': { prerender: false, ssr: false },
    '/mon-espace/**': { prerender: false, ssr: false, robots: false },
    '/staff/**': { prerender: false, ssr: false, robots: false },
    '/api/**': { prerender: false },
  },

  runtimeConfig: {
    baseUrl: '',
    cleSante: '',
    mollieCle: '',
    mollieWebhook: '',
    smtpHote: '',
    smtpPort: '587',
    smtpUtilisateur: '',
    smtpMotdepasse: '',
    smtpExpediteur: '',
    public: {
      urlSite: 'http://localhost:3000',
    },
  },

  nitro: {
    ...(process.env.NUXT_OUTPUT_DIR ? { output: { dir: process.env.NUXT_OUTPUT_DIR } } : {}),

    // Le ménage RGPD : une fois par nuit. Voir server/tasks/menage.ts.
    experimental: { tasks: true },
    scheduledTasks: { '0 3 * * *': ['menage'] },

    prerender: {
      crawlLinks: true,
      // Le robot d'exploration ne doit pas essayer de fabriquer les pages
      // privées : elles n'existent pas sans compte.
      ignore: ['/inscription', '/connexion', '/mon-espace', '/staff', '/api'],
      failOnError: false,
      routes: [
        '/',
        '/sitemap.xml',
        // Les flux iCal ne sont PLUS prérendus. Ils contenaient le programme
        // complet de la saison dans des fichiers publics : n'importe qui
        // connaissant l'adresse — huit adresses évidentes — lisait tout le
        // classeur. Ils sont maintenant servis à la demande, contre une clé
        // personnelle. Voir server/routes/calendriers/[slug].ts.
        // Les actus et les rendez-vous réservés ne sont PLUS prérendus : leur
        // contenu ne doit pas exister en fichier public. Ils sont rendus à la
        // demande, et le serveur vérifie le compte avant de répondre.
      ],
    },
  },

  future: { compatibilityVersion: 4 },
})
