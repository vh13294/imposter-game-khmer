// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: 3602,
  },
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    manifest: {
      name: 'Imposter Game',
      short_name: 'Imposter',
      description: 'Find the imposter among your friends — play in English or Khmer!',
      theme_color: '#7c6df0',
      background_color: '#0a0a14',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'en',
      icons: [
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/imposter-game-khmer/',
      globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: 'module',
    },
  },
  app: {
    baseURL: '/imposter-game-khmer/',
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#7c6df0' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },
})
