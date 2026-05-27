# @matrice-ai/ui

Matrice's shared UI / design-system package. Built on **React 19**, **Tailwind CSS v4**, and **Radix UI** primitives in a shadcn-style architecture (component source lives in this repo and is tree-shaken at build time, not pulled from a registry).

The package is private to Matrice (`publishConfig.access: restricted`) and consumed by the Matrice frontend apps.

---

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Entry points](#entry-points)
- [Components](#components)
- [Hooks & utilities](#hooks--utilities)
- [Bundle size](#bundle-size)
- [Development](#development)
- [Build pipeline](#build-pipeline)
- [Project layout](#project-layout)
- [Scripts](#scripts)
- [Peer dependencies](#peer-dependencies)

---

## Installation

```bash
npm install @matrice-ai/ui
```

The host app must already provide the peer dependencies listed [below](#peer-dependencies).

## Usage

```tsx
import { Button, Card, useToast } from "@matrice-ai/ui";
import "@matrice-ai/ui/styles.css";

export function Example() {
  const { toast } = useToast();
  return (
    <Card>
      <Button onClick={() => toast({ title: "Hello" })}>Click me</Button>
    </Card>
  );
}
```

The CSS import is required once (typically at the app root). It contains the compiled Tailwind v4 layers and the design-system tokens.

## Entry points

The package ships **three** entry points, declared in [`package.json`](package.json) `exports`:

| Import path                  | What it gives you                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `@matrice-ai/ui`             | The full UI kit — composed components (Card, DataTable, Charts, Toast, …) + `cn`. |
| `@matrice-ai/ui/primitives`  | Low-level primitives (Button, Input, Sheet, DropdownMenu, …) + `useIsMobile`.     |
| `@matrice-ai/ui/styles.css`  | Compiled stylesheet (Tailwind v4 + tokens). Import once at the app root.          |

Use `/primitives` when you only need un-opinionated building blocks — it's roughly half the size of the main entry (see [Bundle size](#bundle-size)).

## Components

### Composed UI (`@matrice-ai/ui`)

Higher-level components, opinionated styling, and Matrice-specific compositions:

`Avatar` · `Badge` · `Button` · `Card` · `Charts` (Recharts wrappers) · `ChoiceGroup` · `Command` · `DataTable` (TanStack Table) · `DatePicker` · `Dialog` · `EmptyState` · `FormTextField` · `Input` · `Link` · `Loader` · `Navbar` · `NotificationMenu` · `ProfileMenu` · `Select` · `Sidebar` · `StatusChip` · `Tabs` · `Textarea` · `Toast` (`Toaster`, `useToast`, `toast`, `dismissToast`, `clearToasts`) · `Tooltip`

### Primitives (`@matrice-ai/ui/primitives`)

Radix-based, unstyled-or-minimally-styled building blocks:

`Accordion` · `Avatar` · `Badge` · `Button` · `Checkbox` · `DropdownMenu` · `EmptyState` · `Input` · `Navbar` · `NotificationMenu` · `Pagination` · `PlatformSwitcher` · `Popover` · `ProfileMenu` · `RadioGroup` · `Separator` · `Sheet` · `Sidebar` · `Skeleton` · `Tooltip`

## Hooks & utilities

- `cn(...inputs)` — `clsx` + `tailwind-merge` helper for conditional class names. Exported from both entry points.
- `useIsMobile()` — viewport-based mobile detection hook. Exported from `/primitives`.

## Bundle size

Built with `tsup` (minified, ESM + CJS). React, ReactDOM, `react-hook-form`, and `recharts` are marked **external** so they are not bundled into the package.

| Artifact                | Raw      | Gzipped  |
| ----------------------- | -------- | -------- |
| `dist/index.mjs`        | 103.5 KB | 29.8 KB  |
| `dist/index.cjs`        | 115.5 KB | 33.3 KB  |
| `dist/primitives.mjs`   |  58.2 KB | 14.5 KB  |
| `dist/primitives.cjs`   |  68.7 KB | 17.9 KB  |
| `dist/styles.css`       | 160.3 KB | 28.0 KB  |

Notes:

- The numbers above are the on-disk artifact sizes. Actual **app-visible** size depends on tree-shaking — most consumers won't pay for components they don't import.
- `recharts` is excluded from the bundle but is a runtime dependency of `Charts`; it adds significant weight to apps that use that component. Import `Charts` only where needed.
- Type definitions (`*.d.ts`) and the chunk file (`chunk-*.mjs`) are not counted — they don't affect runtime bundle size.

To re-measure after changes, run `npm run build` and inspect `dist/`.

## Development

```bash
npm install
npm run storybook   # http://localhost:6006
```

Storybook is the primary development surface — components are authored alongside their `.stories.tsx` files and exercised in isolation.

### Testing

```bash
npm run test          # vitest in watch mode
npm run test:run      # single run (CI)
npm run test:coverage # with v8 coverage
```

Tests use **Vitest** with `happy-dom` / `jsdom` and `@testing-library/react`.

### Linting & types

```bash
npm run lint
npm run typecheck
```

Husky + lint-staged enforce `prettier --write` and `eslint --fix --max-warnings=0` on staged TS/TSX files.

### Validation (full check)

```bash
npm run validate   # typecheck + lint + build + tests
```

This is what `prepublishOnly` essentially runs (minus lint).

## Build pipeline

`npm run build` runs three steps:

1. `clean` — removes `dist/`.
2. `build:js` — `tsup` bundles `src/index.ts` and `src/primitives.ts` into ESM (`.mjs`) and CJS (`.cjs`), emits `.d.ts`/`.d.cts` types, prepends a `"use client";` banner so the bundle is safe to import from React Server Components, and minifies output.
3. `build:css` — `postcss src/styles/unified.css -o dist/styles.css` compiles the Tailwind v4 layer (with `@tailwindcss/postcss`, `autoprefixer`, and `cssnano`) into a single stylesheet.

Externals (not bundled): `react`, `react-dom`, `react-hook-form`, `recharts`. See [`tsup.config.ts`](tsup.config.ts).

## Project layout

```
fe-common/
├── src/
│   ├── index.ts                    # main entry — re-exports components/ui + lib/utils
│   ├── primitives.ts               # primitives entry — re-exports components/primitives + cn + useIsMobile
│   ├── components/
│   │   ├── ui/                     # composed components (Card, DataTable, Charts, …)
│   │   └── primitives/             # Radix-based building blocks
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   └── utils.ts                # cn()
│   ├── shared/
│   │   └── svgs.tsx                # shared inline SVG assets
│   ├── styles/                     # Tailwind v4 layers, tokens, globals
│   └── test/                       # test setup / helpers
├── dist/                           # build output (committed for npm consumption only)
├── tsup.config.ts                  # JS/TS bundler config
├── postcss.config.cjs              # CSS pipeline config
├── components.json                 # shadcn-style component metadata
├── tsconfig.json
├── eslint.config.mjs
└── vitest.config.ts
```

## Scripts

| Script             | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `build`            | Clean + build JS bundles + build CSS.                             |
| `build:js`         | tsup only (ESM + CJS + types).                                    |
| `build:css`        | PostCSS pipeline only.                                            |
| `clean`            | Remove `dist/`.                                                   |
| `storybook`        | Start Storybook dev server on port 6006.                          |
| `build-storybook`  | Static Storybook build.                                           |
| `typecheck`        | `tsc --noEmit`.                                                   |
| `lint`             | ESLint over all JS/TS sources.                                    |
| `test` / `test:run`| Vitest watch / single-run.                                        |
| `test:coverage`    | Vitest with v8 coverage.                                          |
| `validate`         | typecheck + lint + build + test:run.                              |
| `prepublishOnly`   | build + typecheck (runs automatically before `npm publish`).      |

## Peer dependencies

The host application must provide:

- `react >= 18`
- `react-dom >= 18`
- `react-hook-form >= 7`

Bundled runtime deps (Radix primitives, `lucide-react`, `recharts`, `@tanstack/react-table`, `cmdk`, `dayjs`, `react-day-picker`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`) are pinned in [`package.json`](package.json).
