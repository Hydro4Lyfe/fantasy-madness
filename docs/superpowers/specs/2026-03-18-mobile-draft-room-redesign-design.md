# Mobile Draft Room Redesign

**Date**: 2026-03-18
**Status**: Approved
**Scope**: Mobile-only (`md:hidden`) — desktop layout unchanged

## Problem

The current mobile draft room layout dedicates ~60% of screen real estate to non-essential chrome (header, on-the-clock banner, search bar, region tabs, region labels, "Your Picks" bar, bottom action bar). Only ~4 team cards are visible at a time, making the core picking experience feel cramped.

## Goal

Redesign the mobile draft room to maximize visible team cards and streamline the picking flow. The primary focus should be **picks and draft status**.

## Layout (top to bottom)

### 1. Floating Timer Bar

- Sticky, positioned directly under the app nav bar
- **Only renders** if the draft has a pick timer configured; hidden otherwise
- Slim bar showing countdown (e.g., "0:42")
- Urgency color transitions: green > amber (< 30s) > red (< 10s)
- Stays visible as user scrolls the team grid

### 2. Status Banner

Three mutually exclusive states:

| State | Content |
|-------|---------|
| **Waiting** | Other player's avatar + name + "is picking..." |
| **Your turn (no selection)** | "Your turn to pick!" prompt |
| **Your turn (team selected)** | Selected team's logo, name, seed, pts/w + **"Confirm Pick"** button |

- Tapping a team card in the grid transforms the banner to the "team selected" state
- Tapping a different team updates the banner to show the new selection
- Confirming the pick submits it and transitions back to "Waiting" state

### 3. Action Button Bar

Compact horizontal row of icon buttons replacing the search bar, region tabs, and bottom action bar:

| Button | Icon | Action |
|--------|------|--------|
| **Search** | Magnifying glass | Opens slide-down search overlay |
| **My Picks** | User/list icon | Opens bottom drawer with picked teams |
| **Board** | Grid icon | Opens bottom drawer (existing DraftBoard) |
| **Queue** | List icon + badge | Opens bottom drawer (existing DraftQueuePanel) |

### 4. Search Overlay

- Triggered by search button in the action bar
- Slides down from below the action bar
- Contains a text input with a **clear button** (clears text, keeps overlay open)
- Search icon in the action bar **toggles to X** while overlay is open
- **Dismissal**: tap the X icon, or tap outside the overlay
- Filters the team grid in real-time as user types

### 5. Team Card Grid

- **Layout**: 3-column grid (`grid-cols-3`), fixed across all mobile widths
- **Card content**: team logo + seed number + team abbreviation (e.g., logo + "2" + "CONN")
- **Play-in slots**: show dual logos side-by-side at smaller size with "vs" indicator, both abbreviations
- **Sort order**: seed ascending across all regions — all 1-seeds first, then all 2-seeds, etc. Secondary sort by quadrant order (East → West → South → Midwest) for deterministic ordering within the same seed
- **Selection**: tapping a card highlights it and updates the Status Banner
- **Unavailable teams**: dimmed/grayed out with reduced opacity (already drafted by someone)
- **Queued teams**: subtle star icon indicator
- **Queue interaction**: long-press a card to add/remove from queue (avoids conflicting with tap-to-select)
- **Scrollable**: fills remaining viewport height, scrolls independently
- **Empty search state**: shows "No teams match your search" when search filters produce zero results

## Elements Removed (mobile only)

| Element | Reason |
|---------|--------|
| Draft Header (back arrow, LIVE badge, name, progress bar) | Replaced by floating timer + status banner |
| Inline search bar | Replaced by search overlay via action button |
| Region tabs (ALL / EAST / WEST / SOUTH / MIDWEST) | Replaced by seed-sorted grid across all regions |
| Region section headers (e.g., "EAST — 14 avail") | No longer needed with cross-region seed sort |
| "YOUR PICKS" sticky bar | Replaced by My Picks drawer |
| Bottom action bar (seed weight, round/pick, Board, Queue) | Board/Queue moved to action button bar; seed weight/round info available in drawers |
| SeedWeightCard | Available inside Queue drawer |

## Elements Preserved

| Element | Notes |
|---------|-------|
| Desktop layout | Entirely unchanged — all changes scoped to `md:hidden` |
| ConnectionBanner | Renders above floating timer bar when disconnected |
| DraftBoard component | Reused inside bottom drawer |
| DraftQueuePanel component | Reused inside bottom drawer (includes auto-pick toggle) |
| DraftCompleteBanner | Still renders when `draft.status === "COMPLETE"`; auto-redirect behavior unchanged |
| DraftLobby | Pre-draft phase unchanged |
| DraftCountdown | Countdown phase unchanged |

## Component Changes

### New Components

- **`MobileFloatingTimer`** — sticky timer bar under nav
- **`MobileStatusBanner`** — three-state status/action banner
- **`MobileActionBar`** — compact icon button row
- **`MobileSearchOverlay`** — slide-down search with dismiss behavior
- **`MobileTeamGrid`** — compact card grid sorted by seed
- **`MobileTeamCard`** — compact team card (logo + seed + abbreviation)
- **`MobileMyPicksDrawer`** — bottom drawer showing user's picks

### Modified Components

- **`DraftRoom.tsx`** — new mobile layout section using the above components; desktop section unchanged

### Unchanged Components

- `DraftBoard.tsx` — reused in drawer
- `DraftQueuePanel.tsx` — reused in drawer
- `DraftLobby.tsx`
- `DraftCountdown.tsx`
- `ConnectionBanner.tsx`
- `SeedWeightCard.tsx` — included inside queue drawer

## Data Flow

No changes to data fetching, WebSocket events, or state management logic in `DraftRoom.tsx`. The new mobile components receive the same props/callbacks. One minor addition: `DraftRoom` derives the full selected slot object from the `slots` array using `selectedSlot` ID so it can pass team metadata to the status banner.

### MobileStatusBanner Props
- `isMyTurn: boolean`
- `currentPickerName: string`
- `currentPickerImage: string | null`
- `selectedSlotData: { displayName, abbreviation, seed, logoTeamIds, quadrant } | null` — derived from `slots.find(s => s.id === selectedSlot)`
- `onConfirmPick: () => void`

### MobileTeamCard Props
- `slotId: string`
- `displayName: string`
- `abbreviation: string`
- `seed: number`
- `quadrant: string`
- `logoTeamIds: string[]`
- `isPlayIn: boolean`
- `isSelected: boolean`
- `isQueued: boolean`
- `isDrafted: boolean`
- `isMyTurn: boolean`
- `onSelect: (slotId: string) => void`
- `onToggleQueue: (slotId: string) => void`

### MobileMyPicksDrawer Content
- Vertical list of user's picked teams showing: logo, team name, seed, pts/w
- Pick count display (e.g., "3/8")
- Total seed weight at bottom

### MobileActionBar Badge Behavior
- **My Picks**: shows pick count badge (e.g., "3")
- **Queue**: shows queue count badge (e.g., "5")

## Interaction Flows

### Making a Pick (your turn)
1. Timer bar shows countdown (if timer enabled)
2. Status banner shows "Your turn to pick!"
3. User scrolls grid, taps a team card
4. Card highlights, status banner transforms to show team info + "Confirm Pick"
5. User taps "Confirm Pick"
6. Pick submitted, banner transitions to "Waiting" for next turn

### Searching for a Team
1. User taps search icon in action bar
2. Search overlay slides down, icon toggles to X
3. User types — grid filters in real-time
4. User taps a team — card highlights, status banner updates
5. User dismisses search (tap X or tap outside)
6. Overlay closes, search text clears, grid returns to full unfiltered view

### Viewing Picks / Board / Queue
1. User taps My Picks, Board, or Queue button
2. Bottom drawer slides up with respective content
3. User reviews, then swipes down or taps outside to close
