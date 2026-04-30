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

## 📖 Core Rules and Gameplay

### Setup
- Use a standard 52-card deck, with Aces high and 2s low.
- Partners sit across from each other.
- Deal all cards out, so each player has 13.

### Bidding
- Starting to the dealer's left, each player bids the number of tricks they expect to win.
- A "Nil" bid means betting zero tricks; successfully winning zero tricks yields 100 bonus points, while losing it results in a 100-point penalty.

### Playing Tricks
- The player to the dealer's left leads the first trick, meaning they lay down a card.
- Players must follow suit if possible. If a player cannot follow suit, they can play any card, including a spade (trump).

### Winning Tricks
- The highest card of the suit led wins the trick, unless a spade is played, in which case the highest spade wins.
- The winner of the trick leads the next card.

### Breaking Spades
- Spades cannot be led until they have been "broken," meaning a spade has been played on a previous trick because a player could not follow suit.

## 🧮 Scoring

- **Making a Bid:** If a team makes their bid, they get 10 points for each trick bid and 1 point for each overtrick (or "bag").
- **Bags:** Accumulating 10 bags results in a 100-point penalty.
- **Missing a Bid:** If a team fails to meet their bid, they lose points equal to 10 times the bid.
- **Winning the Game:** The first team to 500 points wins. 

## 🧠 Key Strategies

- **Bid Conservatively:** It is better to make your bid and take extra tricks (bags) than to miss your bid.
- **Spade Control:** Keep high spades to win tricks and low spades to use when you cannot follow suit (trump).
- **Follow Suit:** Always follow the suit led to prevent opponents from winning with a low spade.

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
