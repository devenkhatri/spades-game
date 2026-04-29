// Card suits
export type Suit = '♠' | '♥' | '♦' | '♣';

// Card values
export type CardValue = 
  | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 
  | 'J' | 'Q' | 'K' | 'A';

// Card interface
export interface Card {
  suit: Suit;
  value: CardValue;
  // For display purposes
  displayValue: string;
}

// Player interface
export interface Player {
  id: number;
  name: string;
  hand: Card[];
  tricksWon: number;
  bid: number;
  bags: number;
  score: number;
  isHuman: boolean;
}

// Game state
export interface GameState {
  players: Player[];
  deck: Card[];
  currentTrick: Card[];
  ledSuit: Suit | null;
  currentPlayerIndex: number;
  phase: 'bidding' | 'playing' | 'evaluatingTrick' | 'gameOver';
  roundScore: Record<number, number>; // playerId -> score for this round
  totalScore: Record<number, number>; // playerId -> total score
  bids: Record<number, number>; // playerId -> bid
  tricksWon: Record<number, number>; // playerId -> tricks won in current round
}

// Complexity levels
export type Complexity = 'easy' | 'medium' | 'hard';

// AI difficulty settings
export interface AISettings {
  complexity: Complexity;
  biddingAccuracy: number; // 0-1, how accurately AI estimates hand strength
  playStrategy: 'basic' | 'intermediate' | 'advanced';
}