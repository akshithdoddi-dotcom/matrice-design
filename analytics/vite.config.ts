import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const trainingRoot = path.resolve(__dirname, '../training/src')
const marketplaceRoot = path.resolve(__dirname, '../marketplace/src')
const supportRoot = path.resolve(__dirname, '../support/src')
const feCommonRoot = path.resolve(__dirname, '../fe-common/src')

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

/**
 * Rewrites "@/" imports inside training/marketplace source files to use their
 * own namespaced alias BEFORE vite:import-analysis processes the file.
 * "@/" in a training file  → "@training/"  (resolves to ../training/src/)
 * "@/" in a marketplace file → "@marketplace/" (resolves to ../marketplace/src/)
 */
function crossAppAliasPlugin() {
  return {
    name: 'cross-app-alias',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (id.startsWith(trainingRoot + '/')) {
        return { code: code.replace(/(['"])@\//g, '$1@training/'), map: null }
      }
      if (id.startsWith(marketplaceRoot + '/')) {
        return { code: code.replace(/(['"])@\//g, '$1@marketplace/'), map: null }
      }
      if (id.startsWith(supportRoot + '/')) {
        return { code: code.replace(/(['"])@\//g, '$1@support/'), map: null }
      }
      if (id.startsWith(feCommonRoot + '/')) {
        return { code: code.replace(/(['"])@\//g, '$1@fe-common/'), map: null }
      }
      return null
    },
  }
}

export default defineConfig({
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5177,
    strictPort: false,
    hmr: { overlay: false },
    watch: {
      ignored: (f: string) => f.includes('node_modules') || f.includes('.git'),
    },
    fs: {
      allow: ['..'],
    },
  },
  plugins: [
    crossAppAliasPlugin(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@training': trainingRoot,
      '@marketplace': marketplaceRoot,
      '@support': supportRoot,
      '@fe-common': feCommonRoot,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        status: path.resolve(__dirname, 'status.html'),
      },
    },
  },
})
