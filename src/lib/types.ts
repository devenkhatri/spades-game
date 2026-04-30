export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
export type Player = 'south' | 'north' | 'east' | 'west';
export type Mode = 'casual' | 'standard' | 'expert';
export type Phase = 'splash' | 'bidding' | 'playing' | 'roundEnd' | 'gameOver';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  symbol: string;
}

export interface Bid {
  bid: number;
  nil: boolean;
  blindNil: boolean;
  player?: string;
}

export interface PlayedCard {
  player: Player;
  card: Card;
}

export interface GameState {
  mode: Mode;
  round: number;
  scoreUs: number;
  scoreThem: number;
  bagsUs: number;
  bagsThem: number;
  hands: Record<Player, Card[]>;
  bids: Partial<Record<Player, Bid>>;
  tricks: Record<Player, number>;
  trick: PlayedCard[];
  currentPlayer: Player | null;
  spadesBroken: boolean;
  playedCards: Card[];
  phase: Phase;
  biddingOrder: Player[];
  biddingIndex: number;
  selectedMode: Mode | null;
  lastTrickWonBy: Partial<Record<Player, PlayedCard[]>>;
}
