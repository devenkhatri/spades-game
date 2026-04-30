# ♠ Spades — Premium Card Game

A fully featured, production-ready Spades card game built with vanilla HTML, CSS, and JavaScript. Mobile-first design with a premium dark aesthetic.

## Features

- **3 Difficulty Modes** — Casual, Standard, Expert
- **Full Spades Rules** — Trumping, trick-taking, spades breaking
- **Bidding System** — Regular bids, Nil, and Blind Nil (Expert mode)
- **Bag/Sandbag Tracking** — 10-bag penalty enforced
- **Smart AI Opponents** — North, East, West with difficulty-scaled strategy
- **Score Tracking** — First to 500 points wins
- **Mobile-First Design** — Works great on phones and tablets
- **No dependencies** — Pure HTML/CSS/JS, no build step required

## How to Play

Open `index.html` in any modern browser — no server needed.

```bash
open index.html
# or serve locally:
npx serve .
```

## Game Modes

| Mode | AI Difficulty | Nil Bids | Blind Nil | Bag Penalty |
|------|--------------|----------|-----------|-------------|
| Casual | Easy | ✗ | ✗ | Lenient |
| Standard | Medium | ✓ | ✗ | Standard (10 bags = −100) |
| Expert | Hard | ✓ | ✓ | Strict (10 bags = −100) |

## Spades Rules Summary

1. 4 players — You (South) + AI partner (North) vs AI East & West
2. 13 cards dealt to each player each round
3. Each player bids how many tricks they'll win
4. **Spades are always trump** — but can't lead spades until broken
5. Must follow the led suit if possible
6. Highest card of led suit wins unless a spade is played
7. Score = 10 × bid + bags; fail a bid = −10 × bid

## Project Structure

```
spades-game/
├── index.html       # Main entry point
├── css/
│   ├── style.css    # Design system, layout, animations
│   └── cards.css    # Card rendering styles
├── js/
│   ├── cards.js     # Deck, deal, card utilities
│   ├── ai.js        # AI bidding & play logic
│   ├── scoring.js   # Score calculation
│   ├── ui.js        # DOM rendering & animations
│   └── game.js      # Core game state & flow
└── README.md
```

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## License

MIT
