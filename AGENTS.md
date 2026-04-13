# AGENTS.md

This file provides guidance for AI agents working on the **MyHealth** repository.

---

## Project Overview

MyHealth is a **client-side personal health tracking and biomarker analysis dashboard** built with React and TypeScript. It visualises time-series biological markers (glucose, cholesterol, hormones, etc.), computes statistical correlations, calculates biological age (PhenoAge), tracks supplements, and optionally integrates with an AI backend (Gemini API) and GitHub Gist for data export. All computation runs in the browser — there is no server-side component.

---

## Tech Stack

| Layer            | Technology                                       |
| ---------------- | ------------------------------------------------ |
| UI framework     | React 19 + TypeScript 6                          |
| Bundler          | Vite 8                                           |
| Styling          | Tailwind CSS 4                                   |
| State management | Jotai 2 (atomic, async atoms)                    |
| Data tables      | TanStack React Table 8                           |
| Charts           | ECharts 6 + echarts-for-react, @echarts-readymade, OGL (3D WebGL) |
| Statistics       | @stdlib/stats-pcorrtest, echarts-stat            |
| UI components    | @headlessui/react, @heroicons/react              |
| Utilities        | classnames, react-markdown                       |
| Testing          | Playwright 1 (E2E only)                          |
| Package manager  | **pnpm** (use pnpm for all install/run commands) |

---

## Repository Layout

```
src/
  App.tsx                  # Root component and routing
  index.tsx                # React DOM entry point
  index.css                # Tailwind directives + CSS custom properties
  vite-env.d.ts            # Vite environment type declarations
  atom/                    # Jotai atoms (global state)
    dataAtom.ts            # Core biomarker data atoms and derived atoms
    averageValueAtom.ts    # Computed average values
    correlationAtom.ts     # Correlation computation atoms
  layout/                  # Presentational React components
    Nav.tsx / Nav.types.ts
    Table.tsx / Table.types.ts            # Filterable biomarker table
    Chart.tsx / Chart2.tsx / LineChart.tsx / ScatterChart.tsx
    BoxplotChart.tsx / HistogramChart.tsx / RadarChart.tsx
    Correlation.tsx / Correlation.types.ts
    BiomarkerCorrelation.tsx / BiomarkerCorrelation.types.ts
    BiomarkerCorrelationGraph.tsx        # Force-directed correlation graph
    SystemClustering.tsx                 # Hierarchical clustering modal
    PValue.tsx / PValue.types.ts
    SupplementsPopover.tsx
    PasswordInput.tsx / Spinner.tsx / DarkVeil.tsx / DarkVeil.types.ts
  data/                    # Raw health data snapshots
    aggregated.ts          # Merged historical data
    index.ts               # Data loader entry point (re-exports loadData, labels)
    loader.ts              # Dynamic import logic for time-stamped data files
    20251015.ts, ...       # Time-stamped data files (one per blood draw)
    archived/              # Older data snapshots no longer in the active window
  processors/              # Data transformation pipeline (pre → enrich → post)
    index.ts               # Exports processBiomarkers and processTime entry points
    pre/                   # convertUnit, convertName, excludes
    enrich/                # inferData, sampling, phenoAge, suppStack
    post/                  # tag, range, latestTrend, description
    stats.ts               # Statistical utilities (correlation, ranking)
    merge.ts               # Data merging helpers
  service/
    askAI.ts               # Gemini API integration
    gist.ts                # GitHub Gist export
  types/
    biomarker.ts           # BioMarker tuple type definition
    notes.ts               # Notes / annotation types
tests/                     # Playwright E2E test specs (35+ files)
public/                    # Static assets, PWA icons, splash screens
```

---

## Core Data Structure

The central type is the **`BioMarker` tuple** defined in `src/types/biomarker.ts`:

```typescript
export type BioMarker = [
  string,      // Display name, e.g. "Glucose"
  number[],    // Time-series values (index-aligned with date list in dataAtom)
  string,      // Unit, e.g. "mg/dL"
  {            // Metadata object
    tag: string[]
    inferred?: boolean
    originValues?: (string | number | null)[]
    hasOrigin?: boolean
    range?: string
    description?: string
    isNotOptimal: (value: number) => boolean
    getSamples: (num: number, count?: number) => string[]
    originUnit?: string
    normalizedTitle?: string
    sortTag?: string
    processedTags?: Array<{ tag: string; displayTag: string; sortKey: string }>
    optimality: boolean[]
  }
]
```

---

## Data Processing Pipeline

Raw data goes through three sequential phases before being stored in Jotai atoms:

1. **Pre-processing** (`src/processors/pre/`) — unit conversion, name normalisation, exclusion filtering
2. **Enrichment** (`src/processors/enrich/`) — missing-value inference, PhenoAge calculation, supplement stacking, data sampling
3. **Post-processing** (`src/processors/post/`) — categorical tagging, range computation, trend detection, description generation

---

## State Management

Global state is managed with **Jotai** atoms in `src/atom/`:

- `dataAtom` — all processed `BioMarker[]` (synchronous view over the async `getBioMarkersAtom`)
- `dataMapAtom` — `Map<string, BioMarker>` keyed by display name for O(1) lookups in chart components
- `notesAtom` — processed notes/annotations keyed by date label
- `noteValuesAtom` — `Object.values(notes)` extracted into a derived atom to avoid per-render allocations
- `visibleDataAtom` — biomarkers filtered by current search term and active tag
- `filterTextAtom` — current free-text search string
- `tagAtom` — currently selected tag filter (`string | null`)
- `rankedDataMapAtom` — Spearman rank cache (used by correlation engine)
- `nonInferredDataAtom` — subset of `dataAtom` excluding inferred biomarkers
- `correlationAtom` — pairwise correlation results (Pearson / Spearman / point-biserial)
- `aiKeyAtom` / `aiModelAtom` — Gemini API key and model name (stored in `localStorage`)
- `gistTokenAtom` — GitHub personal access token (stored in `localStorage`)

---

## Common Commands

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:5173)
pnpm dev

# Type-check without emitting
npx tsc --noEmit

# Production build (output: dist/)
pnpm build

# Preview production build locally
pnpm preview

# Format files
pnpm fmt

# Verify formatting without writing files.
pnpm fmt:check

# lint files
pnpm lint

# Quick fix lint issues.
pnpm lint:fix

# Run all E2E tests (headless)
npx playwright test

# Run a single test file
npx playwright test tests/example.spec.ts

# Run tests with interactive UI
npx playwright test --ui
```

---

## Testing

All tests live in `tests/` and use **Playwright** for end-to-end browser automation. There are no unit or integration test frameworks (e.g. Vitest, Jest) in this project.

When adding or modifying features:

- Add or update the relevant `tests/*.spec.ts` file.
- Keep tests self-contained and deterministic — avoid relying on network calls.
- Run `npx playwright test` before submitting changes to ensure no regressions.

---

## Code Conventions

- **Language:** TypeScript everywhere (`.ts` / `.tsx`). Avoid plain `.js` files.
- **Imports:** Use relative imports within `src/`. No path aliases are configured.
- **Styling:** Tailwind CSS utility classes only — no custom CSS files except `src/index.css` for global resets and CSS custom properties.
- **State:** All shared state must be expressed as Jotai atoms. Avoid React context or prop-drilling for global data.
- **Performance:** Hot paths (correlation calculation, ranking) use `Float64Array` / `Int8Array` and instruction-level parallelism patterns. Document any performance-sensitive code with comments and refer to `.jules/bolt.md` for established patterns.
- **Accessibility:** Follow the patterns documented in `.jules/palette.md` — semantic HTML elements, ARIA labels, keyboard navigation, sufficient colour contrast.
- **No server-side code:** This is a pure client-side application. Do not introduce Node.js server code, API routes, or server-side rendering.

---

## Key Files for Common Tasks

| Task                             | Files to read / modify                                   |
| -------------------------------- | -------------------------------------------------------- |
| Add a new chart                  | `src/layout/`, `src/atom/dataAtom.ts`                    |
| Add a new data processor         | `src/processors/{pre,enrich,post}/`                      |
| Add a new biomarker field        | `src/data/`, `src/processors/`, `src/types/biomarker.ts` |
| Change state / derived data      | `src/atom/`                                              |
| Integrate a new external service | `src/service/`                                           |
| Update the data table            | `src/layout/Table.tsx`, `src/layout/Table.types.ts`      |
| Adjust correlation logic         | `src/processors/stats.ts`, `src/atom/correlationAtom.ts` |
| Update PhenoAge algorithm        | `src/processors/enrich/phenoAge.ts`                      |
| Add a new data snapshot          | `src/data/` (new `YYYYMMDD.ts`), `src/data/loader.ts`   |
| Update supplement tracking       | `src/processors/enrich/suppStack.ts`, `src/layout/SupplementsPopover.tsx` |
| Work with notes / annotations    | `src/types/notes.ts`, `src/atom/dataAtom.ts` (`notesAtom`) |
| Add or adjust UI components      | `src/layout/`, `src/layout/*.types.ts`                   |

---

## Performance Notes

Correlation computation across many biomarkers is the main hot path. Key patterns in use (see `.jules/bolt.md` for details):

- Pre-compute Spearman ranks once and cache in `rankedDataMapAtom`.
- Use `Float64Array` for numerical arrays and `Int8Array` for boolean/flag arrays.
- Unroll inner loops to exploit instruction-level parallelism where the benchmark shows a gain.
- Avoid creating closures or intermediate arrays inside tight loops.

---

## Accessibility Guidelines

Documented patterns are in `.jules/palette.md`. Summary:

- Use `<button>` (not `<div>` or `<span>`) for interactive elements.
- Every interactive element must have an accessible name (`aria-label` or visible text).
- Dark mode: ensure a minimum contrast ratio of 4.5:1 for normal text, 3:1 for large text.
- Keyboard focus must be visible and follow a logical tab order.

---

## Out of Scope

- Server-side rendering or API routes — the app is fully static.
- Native mobile apps — the PWA manifest provides mobile support.
- Authentication / user accounts — credentials are stored locally in `localStorage`.
