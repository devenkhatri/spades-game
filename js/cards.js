// cards.js — Deck, deal, and card utilities

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const RANK_VALUES = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 };

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: RANK_VALUES[rank], symbol: SUIT_SYMBOLS[suit] });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function dealHands(deck) {
  // Returns { south, north, east, west } each with 13 cards
  const hands = { south: [], north: [], east: [], west: [] };
  const players = ['south', 'north', 'east', 'west'];
  deck.forEach((card, i) => {
    hands[players[i % 4]].push({ ...card });
  });
  return hands;
}

function sortHand(hand) {
  const suitOrder = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
    return b.value - a.value;
  });
}

function cardId(card) {
  return `${card.rank}_${card.suit}`;
}

function cardsEqual(a, b) {
  return a.rank === b.rank && a.suit === b.suit;
}

// Returns the winning card index from a trick array
// trick: [{ player, card }, ...]
function getTrickWinner(trick, leadSuit) {
  let winIdx = 0;
  let winCard = trick[0].card;
  for (let i = 1; i < trick.length; i++) {
    const c = trick[i].card;
    if (beats(c, winCard, leadSuit)) {
      winIdx = i;
      winCard = c;
    }
  }
  return winIdx;
}

function beats(challenger, current, leadSuit) {
  const cIsSpade = challenger.suit === 'spades';
  const wIsSpade = current.suit === 'spades';
  if (cIsSpade && !wIsSpade) return true;
  if (!cIsSpade && wIsSpade) return false;
  if (challenger.suit === leadSuit && current.suit !== leadSuit) return true;
  if (challenger.suit !== leadSuit && current.suit === leadSuit) return false;
  if (challenger.suit !== current.suit) return false;
  return challenger.value > current.value;
}

// Get playable cards for a player given the current trick state
function getPlayableCards(hand, trick, spadesBroken) {
  if (trick.length === 0) {
    // Leading a trick
    const nonSpades = hand.filter(c => c.suit !== 'spades');
    if (!spadesBroken && nonSpades.length > 0) return nonSpades;
    return hand;
  }
  const leadSuit = trick[0].card.suit;
  const followed = hand.filter(c => c.suit === leadSuit);
  return followed.length > 0 ? followed : hand;
}

// Evaluate hand strength (0–13 scale)
function evaluateHand(hand) {
  let strength = 0;
  for (const card of hand) {
    if (card.rank === 'A') strength += 1;
    else if (card.rank === 'K') strength += 0.75;
    else if (card.rank === 'Q') strength += 0.5;
    else if (card.rank === 'J') strength += 0.25;
    if (card.suit === 'spades') {
      strength += card.value >= 10 ? 0.5 : 0.25;
    }
  }
  return strength;
}

// Count spades in hand
function countSpades(hand) {
  return hand.filter(c => c.suit === 'spades').length;
}
