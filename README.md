# ♠️ Spades — Premium Card Game

A modern, production-ready implementation of the classic Spades card game. Rebuilt from the ground up using **Next.js (App Router)** and **React**, this application delivers a beautiful, mobile-first experience featuring smart AI opponents and rich animations.

![Spades UI](./public/favicon.ico) <!-- Placeholder, use actual screenshots -->

## ✨ Features

### Premium Gameplay Experience
- **Fluid & Responsive UI:** Fully mobile-optimized design with intelligent CSS grids ensuring cards and HUDs never overlap on small screens.
- **Rich Aesthetics:** A beautiful "poker felt" textured background, vibrant colored cards (Red Hearts & Diamonds), and premium glassmorphism HUD elements.
- **Last Trick Tracking:** Instantly review the previous hand! The UI tracks exactly who won the last trick and previews their winning cards with an elegant mini-card fan.

### Fully Featured Ruleset
- **Standard Spades Mechanics:** Follow-suit rules, trumping with spades, and spade-breaking mechanics.
- **Bidding System:** Bid your expected tricks. Over-bidding guarantees penalty points; under-bidding risks "bags".
- **Nil & Blind Nil Bidding:** High risk, high reward options for expert play.
- **Bag Penalties:** Accumulate 10 bags and suffer a massive -100 point penalty!

### Advanced AI Opponents
- **Casual Mode:** Relaxed gameplay with basic card dumping and simplified bidding rules.
- **Standard Mode:** Smarter AI that evaluates its hand carefully and plays strategically to fulfill bids.
- **Expert Mode:** Highly competitive AI capable of dropping Blind Nil bids and blocking your Nil attempts aggressively.

## 🚀 Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Technical Stack

- **Framework:** Next.js (App Router)
- **State Management:** Custom React Hooks (`useSpadesGame`)
- **Styling:** CSS Modules with global CSS tokens
- **Language:** TypeScript 

## 🛠️ Project Structure
- `src/lib/` - Pure TypeScript logic for decks, AI routines, scoring rules, and the main game engine hook.
- `src/components/` - React components for `Card`, `MiniCard`, and `PlayerArea` displays.
- `src/styles/` - Centralized CSS modules handling transitions, animations, and responsiveness.
- `src/app/` - The main Next.js entrypoint assembling the entire game board.
