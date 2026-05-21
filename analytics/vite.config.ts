import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const trainingRoot = path.resolve(__dirname, '../training/src')
const marketplaceRoot = path.resolve(__dirname, '../marketplace/src')
const supportRoot = path.resolve(__dirname, '../support/src')
const feCommonRoot = path.resolve(__dirname, '../fe-common/src')
const internalRoot = path.resolve(__dirname, '../internal/src')
const analyticsRoot = path.resolve(__dirname, './src')
const nm = (pkg: string) => path.resolve(__dirname, 'node_modules', pkg)

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
      if (id.startsWith(internalRoot + '/')) {
        return { code: code.replace(/(['"])@\//g, '$1@internal/'), map: null }
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
    dedupe: ['react', 'react-dom', 'react-router-dom', '@radix-ui/react-slot'],
    alias: {
      // Pin react/react-dom to analytics' own copies to prevent duplicate instances
      'react': nm('react'),
      'react-dom': nm('react-dom'),
      // Ensure sibling apps (fe-common, training, etc.) resolve all shared packages
      // from analytics' node_modules — they have no node_modules of their own.
      '@radix-ui/react-accordion': nm('@radix-ui/react-accordion'),
      '@radix-ui/react-alert-dialog': nm('@radix-ui/react-alert-dialog'),
      '@radix-ui/react-aspect-ratio': nm('@radix-ui/react-aspect-ratio'),
      '@radix-ui/react-avatar': nm('@radix-ui/react-avatar'),
      '@radix-ui/react-checkbox': nm('@radix-ui/react-checkbox'),
      '@radix-ui/react-collapsible': nm('@radix-ui/react-collapsible'),
      '@radix-ui/react-context-menu': nm('@radix-ui/react-context-menu'),
      '@radix-ui/react-dialog': nm('@radix-ui/react-dialog'),
      '@radix-ui/react-dropdown-menu': nm('@radix-ui/react-dropdown-menu'),
      '@radix-ui/react-hover-card': nm('@radix-ui/react-hover-card'),
      '@radix-ui/react-label': nm('@radix-ui/react-label'),
      '@radix-ui/react-menubar': nm('@radix-ui/react-menubar'),
      '@radix-ui/react-navigation-menu': nm('@radix-ui/react-navigation-menu'),
      '@radix-ui/react-popover': nm('@radix-ui/react-popover'),
      '@radix-ui/react-progress': nm('@radix-ui/react-progress'),
      '@radix-ui/react-radio-group': nm('@radix-ui/react-radio-group'),
      '@radix-ui/react-scroll-area': nm('@radix-ui/react-scroll-area'),
      '@radix-ui/react-select': nm('@radix-ui/react-select'),
      '@radix-ui/react-separator': nm('@radix-ui/react-separator'),
      '@radix-ui/react-slider': nm('@radix-ui/react-slider'),
      '@radix-ui/react-slot': nm('@radix-ui/react-slot'),
      '@radix-ui/react-switch': nm('@radix-ui/react-switch'),
      '@radix-ui/react-tabs': nm('@radix-ui/react-tabs'),
      '@radix-ui/react-toast': nm('@radix-ui/react-toast'),
      '@radix-ui/react-toggle': nm('@radix-ui/react-toggle'),
      '@radix-ui/react-toggle-group': nm('@radix-ui/react-toggle-group'),
      '@radix-ui/react-tooltip': nm('@radix-ui/react-tooltip'),
      'class-variance-authority': nm('class-variance-authority'),
      'clsx': nm('clsx'),
      'cmdk': nm('cmdk'),
      'input-otp': nm('input-otp'),
      'lucide-react': nm('lucide-react'),
      'next-themes': nm('next-themes'),
      'react-day-picker': nm('react-day-picker'),
      'react-hook-form': nm('react-hook-form'),
      'react-resizable-panels': nm('react-resizable-panels'),
      'recharts': nm('recharts'),
      'sonner': nm('sonner'),
      'tailwind-merge': nm('tailwind-merge'),
      'vaul': nm('vaul'),
      '@tanstack/react-table': nm('@tanstack/react-table'),
      'dayjs': nm('dayjs'),
      '@': analyticsRoot,
      '@analytics': analyticsRoot,
      '@training': trainingRoot,
      '@marketplace': marketplaceRoot,
      '@support': supportRoot,
      '@fe-common': feCommonRoot,
      '@internal': internalRoot,
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
              if (importer.startsWith(internalRoot))    root = internalRoot
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
