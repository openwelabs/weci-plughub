export default defineNuxtConfig({
  modules: ['@nuxthub/core'],

  devtools: { enabled: false },

  // Cloudflare bindings (D1 database + R2 blob storage)
  hub: {
    database: true,
    blob: true
  },

  nitro: {
    preset: 'cloudflare-pages'
  },

  compatibilityDate: '2025-10-01'
})
