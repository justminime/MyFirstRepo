# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repo currently contains **planning documents only** — no application code exists yet. The app (`meeting-bingo/`) must be scaffolded before any dev commands work.

The four planning docs are the source of truth:
- `meeting-bingo-prd.md` — product requirements
- `meeting-bingo-uxr.md` — user research and personas
- `meeting-bingo-architecture.md` — technical design with full type definitions and component implementations
- `meeting-bingo-implementation-plan.md` — phased build plan with VP-reviewed issue list (read this before writing any code)

## Scaffolding the App

```bash
npm create vite@latest meeting-bingo -- --template react-ts
cd meeting-bingo
npm install
npm install canvas-confetti
npm install -D tailwindcss@3 postcss autoprefixer @types/canvas-confetti
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
npx tailwindcss init -p
```

## Dev Commands (once scaffolded, run from `meeting-bingo/`)

```bash
npm run dev          # start dev server (default port 5173; add server.port=3000 to vite.config.ts for port 3000)
npm run build        # tsc + vite build
npm run preview      # preview production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npx vitest           # run tests
npx vitest run src/lib/cardGenerator.test.ts  # run a single test file
```

## Architecture

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS v3 + Web Speech API. No backend. State via React Context + localStorage. Deployed to Vercel.

**Planned structure** (from `meeting-bingo-architecture.md`):
```
src/
├── App.tsx                  # Screen router (idle→setup→playing→won maps to GameStatus)
├── context/GameContext.tsx  # Global state via useGame hook
├── hooks/
│   ├── useGame.ts           # Central GameState; calls checkForBingo after every fill
│   ├── useSpeechRecognition.ts  # Web Speech API wrapper with exponential backoff restart
│   ├── useBingoDetection.ts # Subscribes to transcript; calls detectWordsWithAliases
│   └── useLocalStorage.ts   # Generic persistence (key: "meeting-bingo:game-state")
├── lib/
│   ├── cardGenerator.ts     # Fisher-Yates shuffle; builds 5x5 grid with FREE at [2][2]
│   ├── bingoChecker.ts      # Checks 5 rows + 5 cols + 2 diagonals
│   ├── wordDetector.ts      # Word-boundary regex (single words); substring (phrases); aliases map
│   └── shareUtils.ts        # Uses VITE_APP_URL env var for share text
├── components/              # UI components (see architecture doc for full list)
├── data/categories.ts       # 3 category packs, 40+ words each (agile/corporate/tech)
└── types/index.ts           # All shared TypeScript interfaces
```

**Key data flow**: `useSpeechRecognition` → new transcript segment → `useBingoDetection` calls `detectWordsWithAliases` → matched words → `fillSquare(row, col)` → `checkForBingo` → if win, `GameStatus` → `'won'`.

## Critical Implementation Notes

Before writing any application code, read the **Critical Issues** table at the top of `meeting-bingo-implementation-plan.md`. Key ones:
- Pin `tailwindcss@3` (not v4 — config syntax incompatible)
- Speech `onend` auto-restart needs exponential backoff (300ms→5s), skip on terminal errors (`not-allowed`, `service-not-allowed`)
- `useGame` exports must be wrapped in `useCallback`; context value in `useMemo`
- `BingoSquare` needs `aria-pressed`, `aria-label`, `focus-visible:ring-2` (WCAG 2.1 AA)
- Toast strategy: batch per transcript segment, not per word
- `cn()` utility must be created at `src/lib/utils.ts` (referenced by components but not auto-generated)
- `resetGame` must null out `winningLine`, `winningWord`, and reset `status` to `'playing'`

## Out of Scope

User accounts, multiplayer, custom word lists, sound effects, dark mode, any backend.
