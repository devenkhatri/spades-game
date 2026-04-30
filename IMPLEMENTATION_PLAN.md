# Spades Card Game — Full Implementation Plan

## Overview

A full-featured, production-ready Spades card game built as a single-page web application using **Vanilla HTML/CSS/JS** with a premium mobile-first design. The game supports solo play against AI opponents with configurable complexity levels.

---

## Architecture

### Technology Stack
- **HTML5** — Semantic structure, canvas-free card rendering
- **CSS3** — Custom properties, animations, glassmorphism, responsive design
- **Vanilla JS (ES6+)** — Game engine, AI logic, state management
- **Google Fonts** — Inter + Playfair Display for premium typography
- **No external dependencies** — Fully self-contained

---

## Game Features

### Complexity Modes
| Mode | Description |
|------|-------------|
| **Casual** | Simple AI, forgiving rules, no nil bids |
| **Standard** | Moderate AI, standard Spades rules, nil bids available |
| **Expert** | Advanced AI, blind nil, strict bag penalties |

### Core Spades Rules
- 4 players: Human (South) + 3 AI opponents (North, East, West)
- 52-card deck, 13 cards per player
- Trump suit: Spades ♠
- Bidding phase before each round
- Nil bid (Expert: Blind Nil)
- Bag/sandbag tracking (10-bag penalty = -100)
- Score tracking across multiple rounds
- Win condition: First to 500 points wins

### AI Behavior by Difficulty
- **Casual**: Random legal play with basic hand evaluation
- **Standard**: Considers trump, partner's cards, bid tracking
- **Expert**: Full hand analysis, nil support, squeeze plays, memory of played cards

---

## File Structure

```
spades-game/
├── index.html          — Main entry point
├── css/
│   ├── style.css       — Design system, layout, animations
│   └── cards.css       — Card rendering styles
├── js/
│   ├── game.js         — Core game state & flow controller
│   ├── ai.js           — AI bidding & card play logic
│   ├── cards.js        — Deck, deal, card utilities
│   ├── scoring.js      — Score calculation & tracking
│   └── ui.js           — DOM rendering & animations
├── assets/
│   └── sounds/         — (Optional) Card play SFX
└── README.md
```

---

## Design System

### Color Palette
- Background: Deep navy `#0a0e1a` with subtle gradient
- Card table: Dark green felt `#0d2818` → `#1a4a2e`
- Accent: Gold `#c9a227`
- Spades: White on dark
- UI panels: Glassmorphism with `rgba(255,255,255,0.08)` + backdrop blur
- Score: Emerald green highlights
- Danger/Bags: Amber warnings

### Mobile-First Breakpoints
- Base: 320px (mobile)
- sm: 480px
- md: 768px (tablet)
- lg: 1024px (desktop)

### Key UI Screens
1. **Welcome/Mode Select** — Full-screen animated splash with complexity picker
2. **Game Table** — Card table with 4 player positions, score panel
3. **Bidding Modal** — Slide-up bid selector with nil/blind nil options
4. **Round End Summary** — Score breakdown card
5. **Game Over** — Win/loss celebration screen

---

## Game Flow

```
Start → Mode Select → Deal → Bidding Phase → Trick-Taking Phase → 
Round Scoring → [Repeat until 500] → Game Over
```

---

## Verification Plan
- Test all 3 difficulty modes
- Verify mobile layout on 375px viewport
- Verify all Spades rules (bags, nil scoring, trump)
- Test game-over conditions in both win/loss scenarios
