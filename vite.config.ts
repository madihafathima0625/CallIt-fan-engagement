import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import analystHandler from './api/analyst.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  }
  if (env.GEMINI_MODEL && !process.env.GEMINI_MODEL) {
    process.env.GEMINI_MODEL = env.GEMINI_MODEL
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'api-analyst-dev',
        configureServer(server) {
          server.middlewares.use('/api/analyst', async (req, res) => {
            await analystHandler(req, res)
          })
        },
      },
    ],
  }
})
