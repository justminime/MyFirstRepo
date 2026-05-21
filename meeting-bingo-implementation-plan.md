# Meeting Bingo — Implementation Plan

**Based on**: PRD v1.0, Architecture Plan v1.0, UXR v1.0  
**Target**: 3–4 hour MVP (realistic); 90-minute stretch goal with Phases 5.9 (WinScreen) and 7.1 (responsive polish) as optional extensions  
**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Web Speech API  

---

## Review Summary

**Reviewed by**: VP Product, VP Engineering, VP Design (multi-perspective review)
**Review date**: 2026-05-21
**Status**: All 24 issues approved for remediation — apply before implementation begins

Implementers must address all Critical and High issues before writing the first line of application code, and all Medium/Low issues before the Phase 7 deploy step.

### Critical Issues (must fix before coding)

| # | VP | Category | Issue | Recommendation |
|---|----|----------|-------|----------------|
| C-1 | Eng | Bug | Vite default dev port is 5173, not 3000 — deliverable is wrong | Add `server: { port: 3000 }` to vite.config.ts in Phase 1 or update deliverable to 5173 |
| C-2 | Eng | Reliability | `onend` auto-restart has no backoff — tight reconnect loop on error | Apply exponential backoff (300 ms → 5 s); skip restart on terminal errors |
| C-3 | Eng | Anti-pattern | `useGame` fills without `useCallback` — re-render cascade on rapid speech | Wrap all `useGame` exports in `useCallback`; memoize `GameContext` value with `useMemo` |
| C-4 | Eng | Compatibility | `npm install tailwindcss` installs v4 — plan's v3 config syntax breaks silently | Pin `tailwindcss@3` explicitly in install command |
| C-5 | Design | Accessibility | `BingoSquare` has no keyboard/ARIA spec — fails WCAG 2.1 AA | Add `aria-pressed`, `aria-label`, and `focus-visible:ring-2` to component spec |
| C-6 | Product | UX Conflict | Per-word toasts stack rapidly and obscure the card during active play | Batch toasts per transcript segment or use TranscriptPanel chips exclusively |
| C-7 | Product | Timeline | 90-minute estimate is unrealistic for 9 components + 4 hooks + 4 lib files | Update header to 3–4 hr; mark WinScreen and responsive polish as stretch goals |

### High Issues (fix before implementation)

| # | VP | Category | Issue | Recommendation |
|---|----|----------|-------|----------------|
| H-1 | Eng | Testing | No test tooling specified — "unit-testable" deliverable has no runner | Add vitest + @testing-library/react to Phase 1.1 scaffold |
| H-2 | Eng | Config | `tsconfig.json` strict flags never shown — unsafe code passes silently | Add Phase 1 sub-step showing key tsconfig flags including `noUncheckedIndexedAccess` |
| H-3 | Eng | Regression | `resetGame` spec doesn't clear `winningLine` — stale win state on new card | Spec `resetGame` to null out `winningLine`, `winningWord`, reset `status` to `'playing'` |
| H-4 | Product | Ambiguity | Manual "unfill" behaviour unspecified — fills/auto-fills/winning-square edge cases | Specify: only manually-filled squares can be toggled off; auto-filled and winning are permanent |
| H-5 | Eng | Config | `shareUtils.ts` hardcodes `meetingbingo.vercel.app` — URL unknown until deploy | Use `VITE_APP_URL` env var with fallback default |
| H-6 | Eng | Reliability | No React error boundary — uncaught render error leaves a blank screen | Add top-level `ErrorBoundary` component with a reload fallback |
| H-7 | Eng | Bug | `getClosestToWin` return type lacks `nextWord` — "One away! Need: X" hint is unimplementable | Extend return type to `{ needed, line, nextWord: string \| null }` |

### Medium Issues (fix before Phase 7 deploy)

| # | VP | Category | Issue |
|---|----|----------|-------|
| M-1 | Eng | Structure | No `index.ts` barrel exports — verbose and fragile cross-module imports |
| M-2 | Design | UX | No loading state for mic permission request — UI freezes during prompt |
| M-3 | Eng | Edge case | Multiple simultaneous bingo completions unhandled — only first line shown |
| M-4 | Eng | Config | `localStorage` key name unspecified — collisions on shared `localhost` |
| M-5 | Design | Animation | `animate-pulse` on auto-filled squares runs forever — busy board in long meetings |
| M-6 | Eng | Anti-pattern | Array index used as React `key` in detected-words list — breaks on re-order |
| M-7 | Eng | Missing | `cn` utility imported by components but never created or installed |
| M-8 | Eng | Edge case | Phrase detection uses substring match — susceptible to false positives |
| M-9 | Eng | Leak | `canvas-confetti` appends canvas on each win — element leak on Play Again |
| M-10 | Eng | Anti-pattern | Dual state machines (`GameStatus` + `Screen`) will diverge — eliminate one |

### Low Issues (fix before shipping)

| # | VP | Category | Issue |
|---|----|----------|-------|
| L-1 | Eng | Design | `BingoCard.words` flat array drifts from `squares` grid — single source of truth violated |
| L-2 | Product | Completeness | `WORD_ALIASES` map is sparse — most abbreviations/slash-terms have no spoken variant |
| L-3 | Design | Polish | No `favicon.svg` creation step — blank browser tab during workshop demo |
| L-4 | Product | Checklist | `isAutoFilled` visual distinction not in acceptance checklist |
| L-5 | Product | Spec | Share text template unspecified — "compelling enough" is not actionable |
| L-6 | Product | Ambiguity | CategorySelect "Back" destination inconsistent when entered from WinScreen vs LandingPage |
| L-7 | Design | SEO | No Open Graph meta tags — shared links are bare URLs in Slack/Teams unfurls |

### Changes Applied to This Document

| # | Change |
|---|--------|
| 1 | Updated **Target** from 90 min to 3–4 hr with stretch goal note |
| 2 | Fixed Phase 1 deliverable port from 3000 to 5173 |
| 3 | Pinned `tailwindcss@3` in install command |
| 4 | Added vitest + @testing-library/react to scaffold step |
| 5 | Added `src/lib/utils.ts` (cn helper), favicon, and OG meta tags to Phase 1.3 |
| 6 | Added speech restart backoff spec to useSpeechRecognition |
| 7 | Extended `getClosestToWin` return type with `nextWord` |
| 8 | Specified `resetGame` behaviour (clear winningLine, winningWord, status) |
| 9 | Specified manual tap toggle behaviour (manual-only unfill; auto-filled permanent) |
| 10 | Updated toast strategy to batched per-segment |
| 11 | Added `VITE_APP_URL` env var to shareUtils and Phase 7.3 |
| 12 | Specified share text template |

---

## Overview

Build a browser-based bingo game that auto-detects buzzwords from live meeting audio. No backend, no accounts, no cost. Single-player MVP deployable to Vercel.

---

## Phase 1 — Project Setup (10 min)

### 1.1 Scaffold the project

```bash
npm create vite@latest meeting-bingo -- --template react-ts
cd meeting-bingo
npm install
npm install canvas-confetti
npm install -D tailwindcss@3 postcss autoprefixer @types/canvas-confetti
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
npx tailwindcss init -p
```

### 1.2 Configure Tailwind

Update `tailwind.config.js`:
```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.3 Create the folder structure

```
src/
├── components/
│   └── ui/
├── hooks/
├── lib/
├── data/
├── types/
└── context/
```

**Note**: Also create `src/lib/utils.ts` (export a `cn(...classes)` helper using `clsx` or a simple filter-join; referenced by BingoSquare and TranscriptPanel), `public/favicon.svg` (minimal SVG icon), and add `og:title`, `og:description`, `twitter:card` meta tags to `index.html`.

**Deliverable**: `npm run dev` starts with blank React app. Default port is 5173; to use port 3000, add `server: { port: 3000 }` to `vite.config.ts`.

---

## Phase 2 — Types & Data (5 min)

### 2.1 Create `src/types/index.ts`

Define all shared types:
- `CategoryId` — `'agile' | 'corporate' | 'tech'`
- `BingoSquare` — `{ id, word, isFilled, isAutoFilled, isFreeSpace, filledAt, row, col }`
- `BingoCard` — `{ squares: BingoSquare[][], words: string[] }`
- `GameStatus` — `'idle' | 'setup' | 'playing' | 'won'`
- `GameState` — `{ status, category, card, isListening, startedAt, completedAt, winningLine, winningWord, filledCount }`
- `WinningLine` — `{ type: 'row' | 'column' | 'diagonal', index, squares }`
- `SpeechRecognitionState` — `{ isSupported, isListening, transcript, interimTranscript, error }`
- `Toast` — `{ id, message, type, duration? }`

### 2.2 Create `src/data/categories.ts`

Three category packs, 40+ words each:
- **Agile & Scrum** — sprint, backlog, standup, retrospective, velocity, blocker, story points, epic, user story, scrum master, kanban, burndown, CI/CD, definition of done, spike, etc.
- **Corporate Speak** — synergy, leverage, circle back, take offline, bandwidth, low-hanging fruit, move the needle, deep dive, ROI, paradigm shift, north star, etc.
- **Tech & Engineering** — API, cloud, microservices, kubernetes, docker, pipeline, observability, postmortem, SLA, feature flag, A/B test, etc.

**Deliverable**: All TypeScript types compile with no errors.

---

## Phase 3 — Core Logic (15 min)

### 3.1 Create `src/lib/cardGenerator.ts`

- `shuffle<T>(array: T[]): T[]` — Fisher-Yates shuffle
- `generateCard(categoryId): BingoCard` — shuffle words, pick 24, build 5x5 grid with FREE space at center `[2][2]`, free space starts filled

### 3.2 Create `src/lib/bingoChecker.ts`

- `checkForBingo(card): WinningLine | null` — checks all 5 rows, 5 columns, 2 diagonals; returns first winning line found
- `countFilled(card): number`
- `getClosestToWin(card): { needed: number, line: string, nextWord: string | null } | null` — `nextWord` is the unfilled square's word when `needed === 1`; powers "One away! Need: X" hint

### 3.3 Create `src/lib/wordDetector.ts`

- `normalizeText(text): string` — lowercase, normalize quotes
- `detectWords(transcript, cardWords, alreadyFilled): string[]` — word-boundary regex for single words, substring match for phrases
- `WORD_ALIASES` — map of abbreviations to variants (CI/CD → cicd, continuous integration; ROI → return on investment)
- `detectWordsWithAliases(transcript, cardWords, alreadyFilled): string[]`

### 3.4 Create `src/lib/shareUtils.ts`

- `buildShareText(game): string` — formats win result as plain text using template: `"I got BINGO in my meeting! 🎯\nWinning word: \"{winningWord}\" after {timeToWin} min\nCategory: {categoryName} | {filledCount}/24 squares\nPlay at: {VITE_APP_URL}"` (use `import.meta.env.VITE_APP_URL` with fallback)
- `shareResult(game): Promise<void>` — uses native Share API if available, falls back to clipboard copy

**Deliverable**: Unit-testable pure functions, no React dependencies.

---

## Phase 4 — Hooks (15 min)

### 4.1 Create `src/hooks/useLocalStorage.ts`

Generic hook: `useLocalStorage<T>(key, initialValue): [T, (value: T) => void]`

### 4.2 Create `src/hooks/useSpeechRecognition.ts`

Wraps the Web Speech API:
- Feature-detects `window.SpeechRecognition || window.webkitSpeechRecognition`
- Sets `continuous: true`, `interimResults: true`, `lang: 'en-US'`
- Auto-restarts on `onend` if still supposed to be listening, with exponential backoff (300 ms → 5 s cap); skips restart on terminal errors (`not-allowed`, `service-not-allowed`)
- Returns `{ isSupported, isListening, transcript, interimTranscript, error, startListening, stopListening, resetTranscript }`

### 4.3 Create `src/hooks/useGame.ts`

Central game state hook:
- Holds `GameState`
- Exposes `startGame(categoryId)`, `fillSquare(row, col)`, `resetGame()`
- Calls `checkForBingo` after every fill
- `resetGame` must explicitly set `winningLine: null`, `winningWord: null`, `status: 'playing'`, and regenerate the card
- Integrates `useLocalStorage` for persistence (use namespaced key `meeting-bingo:game-state`)

### 4.4 Create `src/hooks/useBingoDetection.ts`

- Subscribes to new transcript segments
- Calls `detectWordsWithAliases` against current card words
- Calls `fillSquare` for each match found
- Debounces to avoid double-detection on repeated phrases

**Deliverable**: Hooks work in isolation; speech hook returns `isSupported: false` on unsupported browsers without crashing.

---

## Phase 5 — UI Components (20 min)

Build components in this order (each depends on the previous).

### 5.1 Shared UI — `src/components/ui/`

- `Button.tsx` — variant props: `primary | secondary | ghost`; handles disabled state
- `Toast.tsx` — auto-dismisses after `duration` ms; stacks multiple toasts
- `Card.tsx` — simple wrapper with shadow and rounded corners

### 5.2 `src/components/BingoSquare.tsx`

States to handle visually:
| State | Style |
|-------|-------|
| Default | White background, gray border |
| Hover | Blue border highlight |
| Filled (manual) | Blue background, white text, strikethrough |
| Auto-filled | Blue background + pulse animation |
| Free space | Amber background, star icon, non-interactive |
| Winning square | Green background, ring highlight |

### 5.3 `src/components/BingoCard.tsx`

- Renders 5x5 grid of `BingoSquare` components
- Passes `isWinningSquare` flag based on `winningLine` from game state
- Handles click → `fillSquare(row, col)`

### 5.4 `src/components/TranscriptPanel.tsx`

- Red pulsing dot when listening, grey when paused
- Shows last ~100 chars of final transcript + italic interim text
- Shows "Detected: ✨ word" chips for the last 5 auto-filled words
- UXR requirement: must feel responsive — interim results confirm the mic is working

### 5.5 `src/components/GameControls.tsx`

- **Start/Stop Listening** toggle — primary action; changes label based on state
- **New Card** button — regenerates card for same category (confirm if squares already filled)
- Show mic unavailable message if `isSupported: false`

### 5.6 `src/components/GameBoard.tsx`

Composes the active game screen:
- Header: logo + listening status indicator + `X/24 squares filled` counter
- `BingoCard`
- Near-bingo hint: "One away! Need: Scope Creep" (from `getClosestToWin`)
- `TranscriptPanel`
- `GameControls`

### 5.7 `src/components/LandingPage.tsx`

- App title + tagline
- Large "New Game" CTA button
- "How It Works" section: 4 steps (pick category, enable mic, join meeting, watch squares fill)
- Privacy note: *"Audio processed locally. Never recorded."* — critical for UXR trust moment

### 5.8 `src/components/CategorySelect.tsx`

- Three category cards: Agile, Corporate, Tech
- Each card shows icon + name + 3–4 sample words
- Click selects category and advances to game
- Back button returns to landing page

### 5.9 `src/components/WinScreen.tsx`

- "BINGO!" heading with confetti (canvas-confetti)
- Show final card with winning line highlighted in green
- Stats: time to BINGO, winning word, squares filled, category
- **Share Result** button — copies text summary + app link to clipboard
- **Play Again** button → back to category select
- UXR requirement: discreet celebration (confetti only, no sound by default)

**Deliverable**: All screens render without errors; game is manually playable (no speech yet).

---

## Phase 6 — Wire Everything Together (10 min)

### 6.1 Create `src/context/GameContext.tsx`

Wrap the app in a context provider that exposes `useGame` state and dispatch to all components without prop drilling.

### 6.2 Update `src/App.tsx`

Route between screens based on `GameState.status`:
| Status | Screen |
|--------|--------|
| `idle` | LandingPage |
| `setup` | CategorySelect |
| `playing` | GameBoard |
| `won` | WinScreen |

### 6.3 Wire speech to game

In `GameBoard`, connect `useSpeechRecognition` + `useBingoDetection`:
- Start listening when user clicks the toggle
- Each new final transcript segment → run word detection → auto-fill matches
- Show one batched toast per transcript segment (e.g., "Detected: sprint, backlog, velocity") to prevent toast stacking; use TranscriptPanel detected-words chips for per-word feedback

**Deliverable**: Full end-to-end game flow works — from landing page through BINGO and share.

---

## Phase 7 — Polish & Deploy (15 min)

### 7.1 Responsive layout

- Mobile: single column, smaller card squares, transcript panel below card
- Tablet/desktop: card centered, controls in a sidebar or below
- Test at 375px (iPhone SE) and 1280px (laptop)

### 7.2 Edge cases to handle

| Case | Handling |
|------|----------|
| Mic permission denied | Show fallback message; manual-only mode stays fully functional |
| Same word spoken twice | `alreadyFilled` set prevents double-detection |
| Browser tab hidden | Speech API may pause; auto-restart on `onend` handles it |
| Firefox (no Speech API) | Feature detection → silent fallback to manual mode |
| Card with 0 squares filled | Disable "New Card" confirm prompt |

### 7.3 Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

- Set project name to `meeting-bingo` (verify availability — name may be taken)
- Add `VITE_APP_URL` to your Vercel environment variables once the final URL is known
- Share the deployed URL

**Deliverable**: Live URL accessible on mobile and desktop Chrome.

---

## Acceptance Checklist

### Core Game
- [ ] Card generates with exactly 24 unique words + FREE center space
- [ ] Each category produces different cards on regeneration
- [ ] Manual tap fills unfilled squares; tapping a manually-filled square unfills it; auto-filled and winning squares are permanent
- [ ] Auto-filled squares are visually distinct from manually-filled squares
- [ ] BINGO detected for all 12 possible lines (5 rows + 5 cols + 2 diagonals)
- [ ] Winning line highlighted on card
- [ ] Win screen shows correct time, winning word, and filled count

### Speech
- [ ] Microphone permission prompt appears with privacy explanation
- [ ] Listening indicator shows active state visibly
- [ ] Spoken buzzwords auto-fill matching squares within 500ms
- [ ] Compound words detected ("story points", "circle back")
- [ ] Aliases detected (CI/CD → "ci cd", ROI → "return on investment")
- [ ] Manual tap still works when mic is active
- [ ] Graceful fallback when speech API unavailable

### UX
- [ ] First auto-fill feels like a "magic moment" — animation is immediate and satisfying
- [ ] Near-bingo hint appears when 1 square away
- [ ] Celebration is satisfying but discreet (no autoplay sound)
- [ ] Share button copies a readable result + link to clipboard
- [ ] App loads in under 2 seconds

---

## Key UXR-Driven Design Notes

- **Privacy first**: The mic permission screen must show *"Audio processed locally. Never recorded."* before or alongside the browser prompt. This is the single biggest trust barrier (from Maya and Dev personas).
- **Manual fallback is not a fallback**: Treat tap-to-fill as a first-class interaction, not a degraded mode. Some users will prefer it.
- **Silent celebration**: Confetti only. Sound must be opt-in. Users are literally in a meeting.
- **Ambient UI**: The game card should be small enough to sit alongside a Zoom window. Avoid large modal overlays during gameplay.
- **Share = viral loop**: The share text should be compelling enough that a teammate who sees it immediately wants to play. Include the winning word and a direct link.

---

## Out of Scope (Do Not Build)

- User accounts or login
- Multiplayer / real-time sync
- Custom word list editor
- Sound effects
- Dark mode
- Backend of any kind
