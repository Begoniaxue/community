export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@element-plus/nuxt'],
  devtools: {
    enabled: true
  },
  css: ['~/assets/styles/global.scss', 'vant/lib/index.css'],
  elementPlus: {
    importStyle: 'css',
    themes: ['dark']
  },
  build: {
    transpile: ['vant']
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
        clientPort: 3000
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/assets/styles/variables.scss" as *;`
        }
      }
    }
  },
  app: {
    head: {
      title: '社区平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '一个现代化的社区平台' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },
  runtimeConfig: {
    backendApiUrl: process.env.BACKEND_API_URL || 'http://localhost:8080/api',
    public: {
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
    }
  }
})
