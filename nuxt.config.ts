export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@nuxt/ui', '@nuxtjs/i18n'],

  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  // Cloudflare bindings (D1 database + R2 blob storage)
  hub: {
    database: true,
    blob: true
  },

  i18n: {
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'zh', name: '简体中文', file: 'zh.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ]
  },

  nitro: {
    preset: 'cloudflare-pages'
  },

  compatibilityDate: '2025-10-01'
})
