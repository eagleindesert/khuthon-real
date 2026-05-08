import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import type { Plugin } from 'vite'
import yts from 'yt-search'

function readDotEnv(dir: string): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(`${dir}/.env`, 'utf-8')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => {
          const i = l.indexOf('=')
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
        })
    )
  } catch {
    return {}
  }
}

function ytSearchPlugin(): Plugin {
  return {
    name: 'yt-search-middleware',
    configureServer(server) {
      server.middlewares.use('/yt-search', async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const title = url.searchParams.get('title') ?? ''
        const artist = url.searchParams.get('artist') ?? ''
        try {
          const result = await yts(`${title} ${artist}`)
          const MAX_SECONDS = 360 // 6분
          const video = result.videos.find(
            (v) => v.seconds > 0 && v.seconds <= MAX_SECONDS
          )
          const videoId = video?.videoId ?? null
          const views = video?.views ?? null
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ videoId, views }))
        } catch {
          res.statusCode = 500
          res.end(JSON.stringify({ videoId: null }))
        }
      })
    },
  }
}

export default defineConfig(() => {
  const env = readDotEnv(__dirname)
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), ytSearchPlugin()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
      watch: {
        usePolling: true,
      },
    },
  }
})
