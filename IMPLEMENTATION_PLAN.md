# Spades Card Game — Next.js Implementation Plan

## Goal Description
Migrate the existing Vanilla HTML/JS Spades game to a robust **Next.js** application. The update will introduce colored playing cards (standard red/black suits instead of monochrome), display the last won trick next to the player who won it, and ensure a highly polished, mobile-first responsive design. 

> [!IMPORTANT]
> **User Review Required:**
> We are pivoting from a pure Vanilla JS/HTML stack to a React-based Next.js architecture. This involves recreating the UI as React components and porting the game engine logic into React state hooks and utility functions. 

> [!WARNING]
> **Open Questions:**
> 1. Should we use `create-next-app` to bootstrap the Next.js project inside the current directory (overwriting the existing structure), or would you prefer it in a subdirectory? (I will assume installing directly in the root directory and cleaning up old HTML/JS).
> 2. For styling, should we stick to Vanilla CSS (as per standard guidelines) via CSS Modules, or do you prefer Tailwind CSS for this Next.js project? (I will plan to use CSS Modules to maintain our custom glassmorphism design without Tailwind, unless you specify otherwise).

## Proposed Changes

### Next.js Setup & Architecture
Initialize a Next.js (App Router) project. We will port the game logic (`ai.js`, `cards.js`, `scoring.js`) into a `lib/` directory and reconstruct the UI (`ui.js`, `index.html`) using React components.

#### [DELETE] Existing Vanilla Files
- `index.html`
- `css/style.css`, `css/cards.css`
- `js/game.js`, `js/ui.js`, `js/ai.js`, `js/cards.js`, `js/scoring.js`

#### [NEW] Next.js Structure
- `src/app/page.tsx`: Main game screen and mode selection.
- `src/app/layout.tsx`: Root layout, fonts (Inter, Playfair Display), and global metadata.
- `src/components/`:
  - `Card.tsx`: Updated card component with proper red/black colors based on suits.
  - `GameTable.tsx`: Main play area component.
  - `PlayerArea.tsx`: Displays player info, their current hand/cards, and a new sub-component for the "Last Won Trick".
  - `BiddingModal.tsx`, `RoundSummaryModal.tsx`, `GameOverScreen.tsx`: React ports of existing modals.
- `src/lib/`:
  - `gameEngine.ts`: React hook (`useSpadesGame`) managing the complex state of rounds, tricks, bidding, and phases.
  - `cards.ts`, `ai.ts`, `scoring.ts`: Ported pure functions from the previous implementation.
- `src/styles/`:
  - `globals.css`: Ported base CSS, design tokens, and glassmorphism styling.
  - `cards.module.css`: Ported and updated card styles supporting colored suits.

### Feature Implementations

1. **Colored Cards**: 
   - Update the card rendering logic to apply specific styles for Hearts (♥) and Diamonds (♦) using vibrant red, while Spades (♠) and Clubs (♣) use rich dark colors.
2. **Last Won Trick Display**: 
   - Add state to track the `lastTrickWonBy: Record<Player, Trick>`. 
   - Update the UI in `PlayerArea.tsx` to display a miniaturized version of the last 4 cards won by that specific player/team, placed next to their avatar or trick count.
3. **Responsive Mobile-First UI**: 
   - Refactor grid layouts in React to perfectly scale down to 320px mobile viewports.
   - Optimize touch targets for card selection and bidding.

## Verification Plan

### Automated/Manual Verification
- Run `npm run dev` and verify the game loads cleanly.
- Test responsive layout on mobile viewport sizes (e.g., iPhone SE sizing in DevTools).
- Play a round to verify that playing Hearts/Diamonds renders as Red.
- Win a trick and verify that the 4 cards from that trick move to/appear at the winning player's designated "last trick" area.
- Complete a round to ensure React state properly handles trick evaluation and scoring.
