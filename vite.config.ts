import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import net from 'net'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function backendServerPlugin() {
  return {
    name: 'backend-server',
    async configureServer(server: any) {
      const isPortInUse = await new Promise<boolean>((resolve) => {
        const client = net.createConnection({ host: '127.0.0.1', port: 3001 }, () => {
          client.destroy()
          resolve(true)
        })

        client.on('error', () => resolve(false))
      })

      if (isPortInUse) {
        console.log('Backend server already running on port 3001; skipping duplicate startup.')
        return
      }

      console.log('Starting backend server (server.js)...')
      const backend = spawn('node', ['server.js'], {
        stdio: 'inherit',
        shell: false,
      })

      backend.on('close', (code) => {
        console.log(`Backend server exited with code ${code}`)
      })

      server.httpServer?.on('close', () => {
        backend.kill()
      })
    }
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    backendServerPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
