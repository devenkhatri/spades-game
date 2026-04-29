import { Card, CardValue, Suit } from './types';

/**
 * Create a standard 52-card deck
 */
export function createDeck(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const values: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
  
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const value of values) {
      // Determine display value
      let displayValue: string;
      if (typeof value === 'number') {
        displayValue = value.toString();
      } else {
        displayValue = value;
      }
      
      deck.push({
        suit,
        value,
        displayValue
      });
    }
  }
  
  return deck;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get point value of a card (for sorting/hand evaluation)
 */
export function getCardPointValue(card: Card): number {
  const { value } = card;
  if (typeof value === 'number') {
    return value;
  }
  switch (value) {
    case 'J': return 11;
    case 'Q': return 12;
    case 'K': return 13;
    case 'A': return 14;
    default: return 0;
  }
}

/**
 * Compare two cards by their point value
 */
export function compareCardsByValue(a: Card, b: Card): number {
  return getCardPointValue(b) - getCardPointValue(a); // Descending order
}

/**
 * Get cards of a specific suit from a hand
 */
export function getCardsBySuit(hand: Card[], suit: Suit): Card[] {
  return hand.filter(card => card.suit === suit);
}

/**
 * Check if a hand has any cards of a specific suit
 */
export function hasSuit(hand: Card[], suit: Suit): boolean {
  return hand.some(card => card.suit === suit);
}