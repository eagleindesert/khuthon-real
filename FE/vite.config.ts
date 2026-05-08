import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import yts from 'yt-search'

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

export default defineConfig({
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
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
  },
})
