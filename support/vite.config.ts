import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const feCommonRoot = path.resolve(__dirname, '../fe-common/src')
const nm = (pkg: string) => path.resolve(__dirname, 'node_modules', pkg)

/**
 * Rewrites "@/" imports inside fe-common source files to "@fe-common/" so they
 * resolve against fe-common/src rather than support/src.
 */
function feCommonAliasPlugin() {
  return {
    name: 'fe-common-alias',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (id.startsWith(feCommonRoot + '/')) {
        return { code: code.replace(/(['"])@\//g, '$1@fe-common/'), map: null }
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [feCommonAliasPlugin(), react(), tailwindcss()],
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5174,
    strictPort: true,
    fs: { allow: ['..'] },
    hmr: { overlay: false },
  },
  resolve: {
    dedupe: ['react', 'react-dom', '@radix-ui/react-slot'],
    alias: {
      // Pin all packages that fe-common source files depend on to support's own node_modules
      'react':                         nm('react'),
      'react-dom':                     nm('react-dom'),
      '@radix-ui/react-accordion':     nm('@radix-ui/react-accordion'),
      '@radix-ui/react-dialog':        nm('@radix-ui/react-dialog'),
      '@radix-ui/react-dropdown-menu': nm('@radix-ui/react-dropdown-menu'),
      '@radix-ui/react-popover':       nm('@radix-ui/react-popover'),
      '@radix-ui/react-scroll-area':   nm('@radix-ui/react-scroll-area'),
      '@radix-ui/react-select':        nm('@radix-ui/react-select'),
      '@radix-ui/react-separator':     nm('@radix-ui/react-separator'),
      '@radix-ui/react-slot':          nm('@radix-ui/react-slot'),
      '@radix-ui/react-tooltip':       nm('@radix-ui/react-tooltip'),
      '@radix-ui/react-checkbox':      nm('@radix-ui/react-checkbox'),
      '@tanstack/react-table':         nm('@tanstack/react-table'),
      'class-variance-authority':      nm('class-variance-authority'),
      'clsx':                          nm('clsx'),
      'lucide-react':                  nm('lucide-react'),
      'tailwind-merge':                nm('tailwind-merge'),
      'motion':                        nm('motion'),
      // App aliases
      '@':         path.resolve(__dirname, './src'),
      '@fe-common': feCommonRoot,
    },
  },
  optimizeDeps: {
    include: [
      'react', 'react-dom',
      'lucide-react',
      '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tooltip', '@radix-ui/react-popover',
      '@radix-ui/react-checkbox', '@radix-ui/react-slot',
      '@tanstack/react-table',
      'class-variance-authority', 'clsx', 'tailwind-merge',
    ],
  },
})
