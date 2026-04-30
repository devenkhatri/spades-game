import { Card, Suit, Rank, Player, PlayedCard } from './types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUIT_SYMBOLS: Record<Suit, string> = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const RANK_VALUES: Record<Rank, number> = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 };

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: RANK_VALUES[rank], symbol: SUIT_SYMBOLS[suit] });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function dealHands(deck: Card[]): Record<Player, Card[]> {
  const hands: Record<Player, Card[]> = { south: [], north: [], east: [], west: [] };
  const players: Player[] = ['south', 'north', 'east', 'west'];
  deck.forEach((card, i) => {
    hands[players[i % 4]].push({ ...card });
  });
  return hands;
}

export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
    return b.value - a.value;
  });
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

export function getTrickWinner(trick: PlayedCard[], leadSuit: Suit): number {
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

export function beats(challenger: Card, current: Card, leadSuit: Suit): boolean {
  const cIsSpade = challenger.suit === 'spades';
  const wIsSpade = current.suit === 'spades';
  if (cIsSpade && !wIsSpade) return true;
  if (!cIsSpade && wIsSpade) return false;
  if (challenger.suit === leadSuit && current.suit !== leadSuit) return true;
  if (challenger.suit !== leadSuit && current.suit === leadSuit) return false;
  if (challenger.suit !== current.suit) return false;
  return challenger.value > current.value;
}

export function getPlayableCards(hand: Card[], trick: PlayedCard[], spadesBroken: boolean): Card[] {
  if (trick.length === 0) {
    const nonSpades = hand.filter(c => c.suit !== 'spades');
    if (!spadesBroken && nonSpades.length > 0) return nonSpades;
    return hand;
  }
  const leadSuit = trick[0].card.suit;
  const followed = hand.filter(c => c.suit === leadSuit);
  return followed.length > 0 ? followed : hand;
}

export function evaluateHand(hand: Card[]): number {
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

export function countSpades(hand: Card[]): number {
  return hand.filter(c => c.suit === 'spades').length;
}
