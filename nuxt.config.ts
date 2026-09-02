// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-02',
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

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/sitemap.xml',
        // Les flux iCal sont produits au build et servis en statique, pour que
        // les agendas puissent s'y abonner.
        '/calendriers/unite.ics',
        '/calendriers/nutons.ics',
        '/calendriers/lutins.ics',
        '/calendriers/louveteaux.ics',
        '/calendriers/guides.ics',
        '/calendriers/scouts.ics',
        '/calendriers/pios.ics',
        '/calendriers/route.ics',
        // Les actus réservées ne sont liées nulle part dans la vue visiteur :
        // on les prérend explicitement.
        '/actus/horaires-ete-hiver',
        '/actus/souper-dias-appel',
      ],
    },
  },

  future: { compatibilityVersion: 4 },
})
