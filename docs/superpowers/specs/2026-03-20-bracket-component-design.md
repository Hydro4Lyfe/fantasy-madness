# Bracket Component Design

## Overview

A full 64-team NCAA tournament bracket page where users pick winners for every matchup (63 games across 6 rounds). The system calculates which 8 teams from their picks would maximize their Fantasy Madness score using the `seed x wins` formula. Users can then optionally import those 8 teams as their picks in Global Contest or League modes.

## Scope

- Authenticated page at `app/(app)/bracket/page.tsx` (inside the `(app)` route group for NavBar + auth guard)
- Client-side bracket state with localStorage persistence (no new DB models)
- Desktop: classic horizontal bracket tree (responsive, max-width 1536px)
- Mobile: ESPN-style round tabs with vertical matchup list + next-round peek
- Best 8 score calculator panel (deferred — not in initial build)
- "Import These Picks" button (placement only, integration deferred)

## Data Source

Requires a **new DAL query** `bracketSlots.listWithTeams` that joins team relations. The existing `bracketSlots.listBySeasonYear` returns flat scalar fields only (no team names/logos). The new query follows the pattern established in `globalContests.getPicksState.ts` (lines 81-94) which already joins `assignedTeam` and `candidates`.

> **Note**: The existing `BracketSlotDTO` in `listBySeasonYear` types `assignedTeamId` as `string | null` despite Prisma defining it as `Int?`. The new query supersedes it for bracket use and uses the correct `number | null` type.

**Return shape** (`BracketSlotWithTeamDTO`):

```typescript
{
  id: string;           // UUID
  tournamentId: string;
  quadrant: number;     // 1=East, 2=West, 3=South, 4=Midwest
  seed: number;         // 1-16
  assignedTeamId: number | null;  // Team.id is Int in Prisma schema
  playInGameId: string | null;
  assignedTeam: {
    id: number;
    fullName: string;     // Team.fullName (e.g., "Duke Blue Devils") — consistent with globalContests.getPicksState.ts
    abbreviation: string;
  } | null;
  candidates: Array<{
    team: {
      id: number;
      fullName: string;
      abbreviation: string;
    };
  }>;
}
```

**Tournament resolution**: The server component finds the current tournament by querying for the most recent tournament with `syncState` in `BRACKET_LOCKED`, `LIVE`, or `COMPLETED` — independent of Global Contest status. This avoids coupling the bracket page to Global Contest existence.

**Bracket availability guard**: If no tournament has reached `BRACKET_LOCKED` state, the page shows a "Bracket Not Yet Available" message (similar to the guard in `global-contest/picks/page.tsx`). The bracket page requires the tournament bracket to be materialized before it can render.

Round 1 matchups derived from standard seed pairings within each quadrant:
1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15

## Bracket Data Structure

### Game Index Mapping

63 games indexed 0-62 with a deterministic mapping from BracketSlot data:

**Round 1 (games 0-31)**: 8 games per quadrant, ordered by seed pairing:

| Quadrant | Games | Matchups (by seed) |
|----------|-------|-------------------|
| East (Q1) | 0-7 | 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15 |
| West (Q2) | 8-15 | 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15 |
| South (Q3) | 16-23 | 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15 |
| Midwest (Q4) | 24-31 | 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15 |

**Advancement formula**: The winner of game `i` in round `r` feeds into game `roundStartIndex + floor((i - currentRoundStart) / 2)` in round `r+1`.

| Round | Games | Start Index | Feeds Into (where `i` is absolute game index) |
|-------|-------|-------------|------------|
| 1 (R64) | 32 | 0 | 32 + floor((i - 0) / 2) |
| 2 (R32) | 16 | 32 | 48 + floor((i - 32) / 2) |
| 3 (S16) | 8 | 48 | 56 + floor((i - 48) / 2) |
| 4 (E8) | 4 | 56 | 60 + floor((i - 56) / 2) |
| 5 (FF) | 2 | 60 | 62 + floor((i - 60) / 2) |
| 6 (Champ) | 1 | 62 | — |

**Region mapping** (consistent with `globalContests.getPicksState.ts`):
- Quadrant 1 = East, Quadrant 2 = West, Quadrant 3 = South, Quadrant 4 = Midwest

### State Model (Client-Side)

```typescript
// gameIndex -> teamId (number, matching Team.id in Prisma)
type BracketPicks = Map<number, number>;

interface BracketGame {
  index: number;
  round: number;
  quadrant?: number;    // 1-4, undefined for Final Four/Championship
  region?: string;      // "East"|"West"|"South"|"Midwest", undefined for FF/Champ
  topTeam: TeamInfo | null;   // null = TBD
  bottomTeam: TeamInfo | null;
  winner: number | null;      // teamId (number) of picked winner
}

interface TeamInfo {
  teamId: number;       // matches Team.id (Int) in Prisma schema
  fullName: string;     // Team.fullName — consistent with DAL query
  abbreviation: string;
  seed: number;
  slotId: string;       // BracketSlot.id — needed for import-to-picks mapping
}
```

**Note on `slotId`**: Each `TeamInfo` carries the `BracketSlot.id` it originated from. When importing Best 8 picks into Global/League modes, the system maps from the Best 8 teams back to their `BracketSlot` IDs (the unit of picking in all game modes).

### Cascade Logic

When a user changes a pick:
1. Remove the old winner from all downstream games where they appear
2. Clear any downstream picks that featured the removed team (recursive)
3. Place the new winner into the next round's slot
4. Cleared downstream matchups briefly flash (200ms background highlight using a CSS transition) to signal the cascade

### localStorage Persistence

The `useBracketState` hook persists picks to `localStorage` keyed by tournament ID (e.g., `bracket-picks-{tournamentId}`). On mount, it restores saved picks. On each pick change, it saves the full picks map. This prevents loss of progress on page refresh or accidental navigation.

## Desktop Layout

Classic horizontal bracket tree, mirroring ESPN's desktop bracket.

### Structure

```
Left Side (flows left-to-right)                    Right Side (flows right-to-left)
────────────────────────────────                    ────────────────────────────────
East (top, 8 R1 matchups) → R32 → S16 → E8         E8 ← S16 ← R32 ← West (top, 8 R1 matchups)

                              [FF Left] ——— [CHAMPIONSHIP] ——— [FF Right]

South (bottom, 8 R1 matchups) → R32 → S16 → E8     E8 ← S16 ← R32 ← Midwest (bottom, 8 R1 matchups)
```

**Layout position mapping**:
- Top-left: East (Q1), Bottom-left: South (Q3) — flow left-to-right
- Top-right: West (Q2), Bottom-right: Midwest (Q4) — flow right-to-left

### Center Section (Final Four + Championship)

The center area is **absolutely positioned** over the gap between the two sides — it does not affect the bracket grid width.

- **FF Left matchup**: positioned left of center (East champion vs South champion)
- **Championship matchup**: centered, larger and visually prominent
- **FF Right matchup**: positioned right of center (West champion vs Midwest champion)
- All three are on the same horizontal plane, vertically centered in the gap between upper and lower regions
- **Connector lines**: horizontal lines from each FF matchup edge to the Championship card
- **No connector lines** from E8 to Final Four

### Championship Card

The Championship matchup is visually distinct — the focal point of the bracket:
- **Wider** than regular matchups (+40px)
- **Taller rows**: 48px each (vs 26px regular), 16px font
- **Larger logos**: 28px (vs 16px regular)
- **Blue accent**: 1px blue border (`#3B82F6`), blue glow shadow, blue-tinted winner background
- **Blue border divider** between rows (`rgba(59,130,246,0.15)`)
- **Label**: "CHAMPIONSHIP" in 13px bold, white, with venue/date sublabel below
- Winner row gets blue left border accent and blue-tinted background

### Round Headers

Pinned along the top:
- R64 | R32 | Sweet 16 | **Final Rounds** | Sweet 16 | R32 | R64
- "Final Rounds" spans across the E8 + center gap + E8 columns (date: "Mar 28 - Apr 7")

### Connector Lines (R64 through E8)

- Thin 1px lines (`#30363D`) connecting matchup winners to next round slots
- Vertical line joins two matchup outputs, horizontal line feeds into next matchup
- Right-angle connectors only, no curves or arrows

### Responsive Width

- **Max-width**: 1536px (`max-w-6xl`), centered on wider screens
- **Matchup width (MW)** is computed dynamically from available container width: `MW = floor((containerWidth - 6*CW - sideGap) / 8)`
- Minimum MW of 80px to remain usable
- **No horizontal scrollbar** — `overflow-x: hidden`, bracket always fits
- **Rebuilds on resize** with 150ms debounce
- **Auto-switches to mobile** below 768px breakpoint

### Region Gap

- 100px vertical gap between upper region (East/West) and lower region (South/Midwest)
- Final Four and Championship matchups sit in this gap

## Mobile Layout

ESPN-style round-based navigation with vertical matchup list and next-round peek.

### Round Selector

- Sticky below nav bar
- Left/right arrows to navigate between rounds
- Shows current round name, date, and points value
- Next round column shown dimmed to the right (preview)
- Blue underline on current round

### Matchup List

- Region headers (italic, uppercase) separate matchup groups within each round
- Full-width matchup cards, vertically stacked
- Two rows per card (one per team), 42px row height, 13px font
- Tap team row to pick winner
- Later rounds show only matchups with populated teams; empty slots show "TBD"
- Final Four / Championship rounds omit region headers

### Next-Round Peek

Each pair of matchups shows a **peek card** to the right displaying the next round's matchup:
- Peek card is **full-size** (same width as parent cards), clipped by `overflow: hidden` on the pair container — enables clean round-switch animations
- **Darker background** (`#0f1318`) with dimmed borders (`#252b33`) and muted text (`#8B949E`) to visually recede behind the current round
- **Connector lines** between parent matchups and peek card: vertical bar + horizontal ticks (matching desktop connector style)
- When winners are picked, their team info appears in the peek; unpicked slots show "---"

### Progress

- Small text showing "X/32 picks made" (or equivalent for current round)

## Matchup Card Design

### Team Row Anatomy

Each row within a matchup card:

```
┌──────────────────────────────────────┐
│ ▌ [logo 16px] [seed] [team name]     │
└──────────────────────────────────────┘
```

Order: left border accent, logo, seed, name (matching ESPN layout).

### Visual States

| State | Background | Text | Left Border |
|-------|-----------|------|-------------|
| Unpicked | `#161B22` | `#E6EDF3` | `transparent` |
| Winner | `#1c2333` | `#E6EDF3` | 3px `#3B82F6` (blue) |
| Loser | `#161B22` | `#E6EDF3` at 50% opacity | `transparent` |
| TBD | `#161B22` | `#484f58` | `transparent`, not clickable |
| Hover (desktop) | `#1c2333` | Unchanged | Unchanged |

### Card Styling

- Background: `#161B22`
- Border: 1px solid `#30363D`
- Border radius: 4px (small, utilitarian)
- No shadows, no gradients, no glass effects
- Compact padding
- Mobile cards: 4px left border width (thicker for touch targets)

### Accessibility

- Team rows use `role="button"`, `tabIndex={0}`, and `aria-pressed` for picked state
- Keyboard: Enter/Space to pick, Tab to navigate between matchups
- Screen reader: announces "[seed] [team name], [picked/not picked]"

## Interaction Model

### Pick a Winner

1. User clicks/taps a team row in a matchup
2. That team is marked as winner (blue left border accent, highlighted background)
3. Loser row dims to 50% opacity
4. Winner automatically populates the corresponding slot in the next round
5. If the next round matchup now has both teams, it becomes pickable

### Change a Pick (Cascade)

1. User clicks the other team in a matchup (swapping their pick)
2. Old winner is removed from next round slot
3. Any downstream games where the old winner appeared are cleared recursively
4. New winner placed in next round slot
5. Cleared downstream matchups flash briefly (200ms CSS transition) to signal the cascade

### Play-in Slot Handling

- **Resolved play-in slots** (`assignedTeamId` is set): display the resolved team normally, behaves like any other team
- **Unresolved play-in slots** (`assignedTeamId` is null, `candidates.length > 1`): display as "Team A / Team B" composite label. The slot is pickable as a single entity — it advances using the slot's seed value for scoring
- **Partial resolution**: Some slots may be resolved while others are not. Each slot is handled independently based on its own `assignedTeamId` state
- The bracket page loads data once on mount; it does not live-update if play-in games resolve during the session

### Constraints

- Cannot pick a TBD team (no team data in that slot yet)
- Play-in composite slots are pickable even though their final team is unknown

## Score Calculator & Best 8 Panel

> **Deferred from initial build** — the bracket focuses on pick interaction first. Best 8 panel will be added as a follow-up.

### Calculation

For each team the user picked as a winner in any game:
- `wins` = number of games that team won in the user's bracket (number of rounds advanced through)
- Only teams with `wins >= 1` are candidates for the Best 8 (teams that appear but never win contribute 0 points and are excluded)
- `projectedScore = seed x wins`
- Example: Champion (6 wins) with seed 3 = 3 x 6 = 18 points
- Sort all candidates by `projectedScore` descending
- Take top 8

### Import Button

- "Import These Picks" button at bottom of panel
- Disabled until all 63 games are picked
- Maps Best 8 teams back to their `BracketSlot` IDs (via `slotId` on `TeamInfo`) for compatibility with Global/League pick systems
- Implementation deferred — button placement only for now

## Component Architecture

```
apps/web/
├── app/(app)/bracket/
│   ├── page.tsx                    # Server component: requireUserId(), fetch open tournament + slots
│   └── BracketClient.tsx           # Client component, all bracket state/interaction
├── components/bracket/
│   ├── DesktopBracket.tsx          # Responsive horizontal tree layout (rebuilds on resize)
│   ├── MobileBracket.tsx           # Round tabs + vertical list with peek cards
│   ├── MatchupCard.tsx             # Single matchup (2 team rows)
│   ├── TeamRow.tsx                 # Single team row within matchup (logo, seed, name, border accent)
│   ├── ChampionshipCard.tsx        # Larger, blue-accented championship matchup
│   ├── BracketConnectors.tsx       # CSS connector lines (desktop only)
│   ├── RoundSelector.tsx           # Mobile round tab navigation with next-round preview
│   ├── RegionHeader.tsx            # Region label divider
│   └── useBracketState.ts          # Hook: picks state, cascade logic, best 8 calc, localStorage
```

### Responsive Switching

Use CSS-based visibility (`hidden md:block` / `md:hidden`) to switch between `DesktopBracket` and `MobileBracket`, consistent with existing patterns in the codebase. Avoid JavaScript-based `useIsMobile()` switching to prevent layout flash.

## Styling Approach

- Utilitarian ESPN-like aesthetic
- Dark background matching app theme (`#0d1117`)
- Dense, readable matchup cards (`#161B22`)
- Minimal decoration — no glass effects, no gradients on regular cards
- Championship card is the exception: blue border, glow shadow, larger sizing
- Thin borders and connector lines (`#30363D`)
- Region labels as plain text headers, no colored accents
- Winner indicator: blue left border accent (3px desktop, 4px mobile)
- Loser indicator: 50% opacity dim
- Tailwind CSS classes, inline styles only where dynamic
- Max-width: 1536px (`max-w-6xl`) on desktop

## Responsive Breakpoint

- `md` (768px): Switch between mobile and desktop layouts
- Below `md`: Mobile round-tab layout with peek cards
- At/above `md`: Desktop horizontal tree layout, responsive width

## Visual Reference

The mockup file is at `.superpowers/brainstorm/275365-1774035343/bracket-v5.html` — open locally to see the exact styling for both desktop and mobile views.

## Out of Scope

- Database persistence for bracket picks (localStorage only)
- Import picks integration with Global/League modes (button placement only)
- Real-time game results overlay on bracket
- Shareable bracket links
- Bracket comparison views
- Best 8 panel (deferred to follow-up)
