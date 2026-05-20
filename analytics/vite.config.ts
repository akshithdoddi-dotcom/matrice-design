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
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: false,
    hmr: { overlay: false },
    watch: {
      // Watch sibling source directories so HMR fires on fe-common/training/etc changes
      ignored: (f: string) => f.includes('node_modules') || f.includes('.git'),
    },
    fs: {
      // Allow Vite to serve files from the monorepo root
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
    // Ensure only one copy of React is used across all sibling app imports
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      // Pin react/react-dom to analytics' own copies to prevent duplicate instances
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // Alias @ to the analytics src directory
      '@': path.resolve(__dirname, './src'),
      // Cross-app aliases – allow analytics to import from sibling apps
      '@training': trainingRoot,
      '@marketplace': marketplaceRoot,
      '@support': supportRoot,
      '@fe-common': feCommonRoot,
    },
  },
  optimizeDeps: {
    // Only scan analytics' own entry — sibling apps (training/marketplace/support)
    // are lazy-loaded and their @/ alias cannot be correctly resolved by esbuild
    entries: ['./src/main.tsx'],
    // Explicitly include packages needed for pre-bundling
    include: [
      'react', 'react-dom', 'react-router-dom',
      'recharts', 'lucide-react',
      '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tooltip', '@radix-ui/react-checkbox',
      'class-variance-authority', 'clsx', 'tailwind-merge',
    ],
    esbuildOptions: {
      // Rewrite @/ imports inside sibling-app source files to their correct roots
      // so the dep scanner doesn't resolve them against analytics/src
      plugins: [
        {
          name: 'cross-app-alias-esbuild',
          setup(build) {
            build.onResolve({ filter: /^@\// }, (args) => {
              const importer = args.importer || ''
              let root: string | null = null
              if (importer.startsWith(trainingRoot))    root = trainingRoot
              if (importer.startsWith(marketplaceRoot)) root = marketplaceRoot
              if (importer.startsWith(supportRoot))     root = supportRoot
              if (importer.startsWith(feCommonRoot))    root = feCommonRoot
              if (!root) return undefined
              // Return resolved path — mark as external so esbuild stops walking in
              return { path: args.path.replace(/^@\//, root + '/'), external: true }
            })
          },
        },
      ],
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
