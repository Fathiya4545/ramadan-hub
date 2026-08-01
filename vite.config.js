import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel runs everything in api/ as serverless functions, but `vite dev` knows
// nothing about them and just serves the source file as a static asset — which
// is why fetching /api/mosques blew up with a JSON.parse error locally.
// This runs those handlers in dev so it behaves like production.
function vercelApiDev() {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.replace(/^\/api\//, '').replace(/\.js$/, '')
        if (!name || name.includes('..')) return next()

        let mod
        try {
          mod = await server.ssrLoadModule(`/api/${name}.js`)
        } catch {
          return next()
        }
        if (typeof mod.default !== 'function') return next()

        // Minimal shim of the Vercel request/response helpers the handlers use.
        req.query = Object.fromEntries(url.searchParams)
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (body) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
          return res
        }

        try {
          await mod.default(req, res)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiDev()],
})
