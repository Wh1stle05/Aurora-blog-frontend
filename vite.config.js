import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'

import { getDynamicRoutes, STATIC_PRERENDER_ROUTES } from './scripts/fetch-routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const prerenderRoutes = command === 'build'
    ? [...STATIC_PRERENDER_ROUTES, ...(await getDynamicRoutes())]
    : [];

  return {
    plugins: [
      react(),
      ...(command === 'build'
        ? [
            prerender({
              staticDir: path.join(__dirname, 'dist'),
              routes: prerenderRoutes,
              server: {
                proxy: {
                  '/api': {
                    target: 'https://api.aurorablog.me',
                    changeOrigin: true,
                    secure: true,
                  },
                },
              },
              renderer: new PuppeteerRenderer({
                injectProperty: '__AURORA_PRERENDER__',
                inject: { proxyApi: true },
                renderAfterTime: 6000,
                skipThirdPartyRequests: true,
                headless: true,
                maxConcurrentRoutes: 4,
              }),
            }),
          ]
        : []),
    ],
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://blog-backend:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: './vitest.setup.js',
      globals: true
    }
  }
})
