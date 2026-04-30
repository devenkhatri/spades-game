import { Card, Mode, Bid, PlayedCard, Suit } from './types';
import { evaluateHand, countSpades, getPlayableCards, beats } from './cards';

export function aiBid(hand: Card[], mode: Mode, partnerBid: number | null, position: number): Bid {
  const strength = evaluateHand(hand);
  const spades = countSpades(hand);

  let bid = Math.round(strength);
  bid += spades >= 5 ? 1 : spades >= 3 ? 0 : -1;
  bid = Math.max(1, Math.min(13, bid));

  if (mode === 'casual') {
    bid = Math.max(1, Math.min(7, bid + Math.floor(Math.random() * 3) - 1));
    return { bid, nil: false, blindNil: false };
  }

  if (mode === 'standard') {
    if (partnerBid !== null && partnerBid >= 5) bid = Math.max(1, bid - 1);
    const canNil = strength < 1.5 && spades === 0;
    if (canNil && Math.random() > 0.3) return { bid: 0, nil: true, blindNil: false };
    return { bid, nil: false, blindNil: false };
  }

  if (partnerBid !== null && partnerBid >= 5) bid = Math.max(1, bid - 1);
  const canNil = strength < 1.0 && spades === 0;
  if (canNil) return { bid: 0, nil: true, blindNil: false };

  if (partnerBid === null && position === 0 && Math.random() > 0.92) {
    return { bid: 0, nil: false, blindNil: true };
  }

  return { bid, nil: false, blindNil: false };
}

export function aiPlayCard(
  hand: Card[],
  trick: PlayedCard[],
  spadesBroken: boolean,
  mode: Mode,
  playerBid: number,
  tricksTaken: number,
  playedCards: Card[]
): Card {
  const playable = getPlayableCards(hand, trick, spadesBroken);

  if (mode === 'casual') return casualPlay(playable, trick);
  if (mode === 'standard') return standardPlay(playable, trick, playerBid, tricksTaken);
  return expertPlay(playable, trick, playerBid, tricksTaken, hand, playedCards);
}

function casualPlay(playable: Card[], trick: PlayedCard[]): Card {
  if (trick.length === 0) {
    const nonSpades = playable.filter(c => c.suit !== 'spades');
    const pool = nonSpades.length > 0 ? nonSpades : playable;
    return pool.reduce((a, b) => a.value < b.value ? a : b);
  }
  const winning = tryToWinCheap(playable, trick);
  return winning || playable.reduce((a, b) => a.value < b.value ? a : b);
}

function standardPlay(playable: Card[], trick: PlayedCard[], playerBid: number, tricksTaken: number): Card {
  const needTricks = playerBid - tricksTaken;

  if (trick.length === 0) {
    if (needTricks <= 0) return dumpLoser(playable);
    return bestLead(playable);
  }

  if (needTricks <= 0) return dumpLoser(playable);

  const winning = tryToWinCheap(playable, trick);
  return winning || dumpLoser(playable);
}

function expertPlay(
  playable: Card[],
  trick: PlayedCard[],
  playerBid: number,
  tricksTaken: number,
  fullHand: Card[],
  playedCards: Card[]
): Card {
  const needTricks = playerBid - tricksTaken;

  if (trick.length === 0) {
    if (needTricks <= 0) return dumpLoser(playable);
    return bestLead(playable);
  }

  if (needTricks <= 0) return dumpLoser(playable);

  const winning = tryToWinCheap(playable, trick);
  if (winning) return winning;

  return dumpLoser(playable);
}

function currentWinner(trick: PlayedCard[]): PlayedCard | null {
  if (!trick.length) return null;
  const leadSuit = trick[0].card.suit;
  let winner = trick[0];
  for (let i = 1; i < trick.length; i++) {
    if (beats(trick[i].card, winner.card, leadSuit)) winner = trick[i];
  }
  return winner;
}

function tryToWinCheap(playable: Card[], trick: PlayedCard[]): Card | null {
  const leadSuit = trick[0].card.suit;
  const win = currentWinner(trick);
  if (!win) return null;

  const canWin = playable.filter(c => beats(c, win.card, leadSuit));
  if (!canWin.length) return null;

  return canWin.reduce((a, b) => a.value < b.value ? a : b);
}

function dumpLoser(playable: Card[]): Card {
  const nonSpades = playable.filter(c => c.suit !== 'spades');
  const pool = nonSpades.length > 0 ? nonSpades : playable;
  return pool.reduce((a, b) => a.value < b.value ? a : b);
}

function bestLead(playable: Card[]): Card {
  const suits: Partial<Record<Suit, Card[]>> = {};
  for (const c of playable) {
    if (c.suit !== 'spades') {
      if (!suits[c.suit]) suits[c.suit] = [];
      suits[c.suit]!.push(c);
    }
  }
  let best: Card[] | null = null;
  let bestLen = 0;
  for (const s in suits) {
    const suitCards = suits[s as Suit]!;
    if (suitCards.length > bestLen) { bestLen = suitCards.length; best = suitCards; }
  }
  const pool = best || playable.filter(c => c.suit === 'spades');
  const actualPool = pool.length > 0 ? pool : playable;
  return actualPool.reduce((a, b) => a.value > b.value ? a : b);
}
