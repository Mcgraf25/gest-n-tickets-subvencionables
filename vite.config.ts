import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react()],                 // <-- imprescindible para TSX/JSX
    base: '/gest-n-tickets-subvencionables/',  // <-- correcto para GH Pages
    define: {
      // ⚠️ NO metas claves secretas en el cliente. Esto incrusta la clave en el bundle.
      // Deja estas líneas solo si no son secretas. Mejor: usa backend/proxy.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
  }
})
