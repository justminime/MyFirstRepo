# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

The app is **fully scaffolded and in active development**. All source files exist under `meeting-bingo/src/`.

The planning docs remain as reference:
- `meeting-bingo-prd.md` — product requirements
- `meeting-bingo-uxr.md` — user research and personas
- `meeting-bingo-architecture.md` — technical design
- `meeting-bingo-implementation-plan.md` — phased build plan with VP-reviewed issue list

## Dev Commands (run from `meeting-bingo/`)

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

**Actual structure**:
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
├── components/              # BingoCard, BingoSquare, CategorySelect, ErrorBoundary,
│                            #   GameBoard, GameControls, LandingPage, TranscriptPanel,
│                            #   WinScreen, ui/{Button,Card,Toast}
├── data/categories.ts       # 3 category packs, 40+ words each (agile/corporate/tech)
└── types/index.ts           # All shared TypeScript interfaces
```

**Key data flow**: `useSpeechRecognition` → new transcript segment → `useBingoDetection` calls `detectWordsWithAliases` → matched words → `fillSquare(row, col)` → `checkForBingo` → if win, `GameStatus` → `'won'`.

## Implementation Notes

- `tailwindcss@3` is pinned — do not upgrade to v4 (config syntax incompatible)
- Speech `onend` auto-restart uses exponential backoff (300ms→5s); skips on terminal errors (`not-allowed`, `service-not-allowed`)
- `useGame` exports are wrapped in `useCallback`; context value in `useMemo`
- Always call `stopListening()` before `goHome()` to avoid the `onend` restart race on unmount
- Confirm dialogs: both "New Card" (when filledCount > 0) and "← Menu" (when userFilled > 0) guard against accidental data loss — keep them in sync
- `cn()` utility lives at `src/lib/utils.ts`
- Tests exist for `bingoChecker`, `cardGenerator`, and `wordDetector` under `src/lib/__tests__/`; no component tests yet

## Out of Scope

User accounts, multiplayer, custom word lists, sound effects, dark mode, any backend.
