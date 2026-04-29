import { Card, Player, GameState, Complexity, AISettings } from './types';
import type { Suit } from './types';
import { createDeck, shuffleArray, getCardPointValue, compareCardsByValue, getCardsBySuit, hasSuit } from './cards';

/**
 * Initialize a new game state
 */
export function initializeGameState(
  playerNames: string[], 
  humanPlayerIndex: number = 0,
  complexity: Complexity = 'medium'
): GameState {
  const players: Player[] = playerNames.map((name, index) => ({
    id: index,
    name,
    hand: [],
    tricksWon: 0,
    bid: 0,
    bags: 0,
    score: 0,
    isHuman: index === humanPlayerIndex
  }));

  return {
    players,
    deck: [],
    currentTrick: [],
    ledSuit: null,
    currentPlayerIndex: 0,
    phase: 'bidding',
    roundScore: {},
    totalScore: {},
    bids: {},
    tricksWon: {}
  };
}

/**
 * Deal cards to all players
 */
export function dealCards(state: GameState): GameState {
  // Create and shuffle deck
  const deck = shuffleArray(createDeck());
  
  // Reset player hands
  const playersWithEmptyHands = state.players.map(player => ({
    ...player,
    hand: [],
    tricksWon: 0,
    bid: 0,
    bags: 0
  }));
  
  // Deal 13 cards to each player (standard Spades)
  const dealtPlayers = playersWithEmptyHands.map((player, index) => {
    const startIndex = index * 13;
    const endIndex = startIndex + 13;
    return {
      ...player,
      hand: deck.slice(startIndex, endIndex)
    };
  });
  
  // Initialize scoring tracking
  const roundScore: Record<number, number> = {};
  const totalScore: Record<number, number> = {};
  const bids: Record<number, number> = {};
  const tricksWon: Record<number, number> = {};
  
  dealtPlayers.forEach(player => {
    roundScore[player.id] = 0;
    totalScore[player.id] = player.score; // Keep existing total score
    bids[player.id] = 0;
    tricksWon[player.id] = 0;
  });
  
  return {
    ...state,
    deck: [], // Deck is now empty after dealing
    players: dealtPlayers,
    currentTrick: [],
    ledSuit: null,
    currentPlayerIndex: 0, // Start with first player
    phase: 'bidding',
    roundScore,
    totalScore,
    bids,
    tricksWon
  };
}

/**
 * Calculate AI bid based on hand strength
 */
export function calculateAIBid(
  hand: Card[], 
  complexity: Complexity,
  position: number // 0-3, where 0 is first to bid
): number {
  // Count spades and high cards
  const spades = getCardsBySuit(hand, '♠');
  const highCards = hand.filter(card => {
    const value = getCardPointValue(card);
    return value >= 11; // J, Q, K, A
  });
  
  // Base bid on number of spades and high cards
  let baseBid = Math.floor(spades.length * 0.6) + Math.floor(highCards.length * 0.3);
  
  // Adjust based on position (later positions can bid more aggressively)
  const positionBonus = Math.floor(position * 0.5);
  
  // Apply complexity factor
  let accuracy = 0.7; // Default
  switch (complexity) {
    case 'easy':
      accuracy = 0.5;
      break;
    case 'medium':
      accuracy = 0.7;
      break;
    case 'hard':
      accuracy = 0.9;
      break;
  }
  
  // Add some randomness based on accuracy
  const randomFactor = (Math.random() - 0.5) * (1 - accuracy) * 2;
  const finalBid = Math.max(0, Math.round(baseBid + positionBonus + randomFactor));
  
  // Ensure bid is reasonable (0-10)
  return Math.min(10, Math.max(0, finalBid));
}

/**
 * Determine if a card can be played given the current trick
 */
export function canPlayCard(
  hand: Card[], 
  card: Card, 
  ledSuit: Suit | null,
  spadesBroken: boolean
): boolean {
  // If no suit has been led yet (first card of trick), any card can be played
  if (!ledSuit) {
    // Special rule: Cannot lead with spades unless spades are broken or you only have spades
    if (card.suit === '♠' && !spadesBroken && !hand.every(c => c.suit === '♠')) {
      return false;
    }
    return true;
  }
  
  // If you have cards of the led suit, you must follow suit
  if (hasSuit(hand, ledSuit)) {
    return card.suit === ledSuit;
  }
  
  // If you don't have the led suit, you can play anything
  return true;
}

/**
 * Determine the winner of a trick
 */
export function getTrickWinner(
  trick: Card[], 
  ledSuit: Suit
): number {
  let winningCard = trick[0];
  let winningIndex = 0;
  
  for (let i = 1; i < trick.length; i++) {
    const card = trick[i];
    
    // If card is a spade and winning card is not a spade, spade wins
    if (card.suit === '♠' && winningCard.suit !== '♠') {
      winningCard = card;
      winningIndex = i;
    }
    // If both cards are spades or both are not spades, higher value wins
    else if (
      (card.suit === '♠' && winningCard.suit === '♠') ||
      (card.suit !== '♠' && winningCard.suit !== '♠')
    ) {
      if (getCardPointValue(card) > getCardPointValue(winningCard)) {
        winningCard = card;
        winningIndex = i;
      }
    }
    // If card matches led suit and winning card doesn't, card wins
    else if (card.suit === ledSuit && winningCard.suit !== ledSuit) {
      winningCard = card;
      winningIndex = i;
    }
  }
  
  return winningIndex;
}

/**
 * Update scores after a round
 */
export function updateScores(state: GameState): GameState {
  const updatedPlayers = state.players.map(player => {
    const bid = state.bids[player.id] || 0;
    const tricks = state.tricksWon[player.id] || 0;
    
    let roundPoints = 0;
    
    // Calculate round score
    if (tricks >= bid) {
      // Made bid or overtrick
      roundPoints = bid * 10;
      if (tricks > bid) {
        // Bags (overtricks)
        roundPoints += (tricks - bid);
      }
    } else {
      // Failed to make bid
      roundPoints = -bid * 10;
    }
    
    // Update bags count
    const newBags = tricks >= bid ? player.bags + (tricks - bid) : 0;
    
    // Apply bag penalty (100 points penalty for every 10 bags)
    let bagPenalty = 0;
    if (newBags >= 10) {
      bagPenalty = -100 * Math.floor(newBags / 10);
    }
    
    const totalScore = (state.totalScore[player.id] || 0) + roundPoints + bagPenalty;
    
    return {
      ...player,
      score: totalScore,
      bags: newBags >= 10 ? newBags % 10 : newBags // Reset bags after penalty
    };
  });
  
  // Update total scores
  const totalScore: Record<number, number> = {};
  updatedPlayers.forEach(player => {
    totalScore[player.id] = player.score;
  });
  
  return {
    ...state,
    players: updatedPlayers,
    totalScore,
    phase: 'gameOver' as const
  };
}

/**
 * Check if game is over (typically when a player reaches 500 points)
 */
export function isGameOver(state: GameState): boolean {
  return Object.values(state.totalScore).some(score => score >= 500);
}

/**
 * Get AI settings based on complexity
 */
export function getAISettings(complexity: Complexity): AISettings {
  switch (complexity) {
    case 'easy':
      return {
        complexity: 'easy',
        biddingAccuracy: 0.5,
        playStrategy: 'basic'
      };
    case 'medium':
      return {
        complexity: 'medium',
        biddingAccuracy: 0.7,
        playStrategy: 'intermediate'
      };
    case 'hard':
      return {
        complexity: 'hard',
        biddingAccuracy: 0.9,
        playStrategy: 'advanced'
      };
    default:
      return {
        complexity: 'medium',
        biddingAccuracy: 0.7,
        playStrategy: 'intermediate'
      };
  }
}

/**
 * Play a card from a player's hand
 */
export function playCard(
  state: GameState, 
  playerId: number, 
  cardIndex: number
): GameState {
  // Validate that it's the player's turn
  if (state.currentPlayerIndex !== state.players.findIndex(p => p.id === playerId)) {
    throw new Error('Not player\'s turn');
  }
  
  const player = state.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }
  
  if (cardIndex < 0 || cardIndex >= player.hand.length) {
    throw new Error('Invalid card index');
  }
  
  const cardToPlay = player.hand[cardIndex];
  
  // Validate that the card can be played
  const spadesBroken = state.currentTrick.some(c => c.suit === '♠');
  if (!canPlayCard(player.hand, cardToPlay, state.ledSuit, spadesBroken)) {
    throw new Error('Cannot play this card');
  }
  
  // Remove card from player's hand
  const updatedHand = [...player.hand];
  updatedHand.splice(cardIndex, 1);
  
  // Update player's hand
  const updatedPlayers = state.players.map(p => 
    p.id === playerId ? { ...p, hand: updatedHand } : p
  );
  
  // Add card to current trick
  const updatedTrick = [...state.currentTrick, cardToPlay];
  
  // Set led suit if this is the first card of the trick
  const ledSuit = state.ledSuit || cardToPlay.suit;
  
  // Determine next player
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  
  // Check if trick is complete (all 4 players have played)
  const trickComplete = updatedTrick.length === state.players.length;
  
  let finalState: GameState = {
    ...state,
    players: updatedPlayers,
    deck: state.deck,
    currentTrick: updatedTrick,
    ledSuit,
    currentPlayerIndex: trickComplete ? 0 : nextPlayerIndex, // Reset to 0 if trick complete
    phase: trickComplete ? 'evaluatingTrick' : state.phase,
    roundScore: state.roundScore,
    totalScore: state.totalScore,
    bids: state.bids,
    tricksWon: state.tricksWon
  };
  
  // If trick is complete, evaluate it
  if (trickComplete) {
    finalState = evaluateTrick(finalState);
  }
  
  return finalState;
}

/**
 * Evaluate a completed trick and update scores
 */
export function evaluateTrick(state: GameState): GameState {
  if (state.currentTrick.length !== state.players.length) {
    throw new Error('Cannot evaluate incomplete trick');
  }
  
  // Determine winner of the trick
  const winnerIndex = getTrickWinner(state.currentTrick, state.ledSuit!);
  const winningPlayerId = state.players[winnerIndex].id;
  
  // Update tricks won for the winning player
  const updatedPlayers = state.players.map((player, index) => {
    if (index === winnerIndex) {
      return { 
        ...player, 
        tricksWon: player.tricksWon + 1 
      };
    }
    return player;
  });
  
  // Update tricks won tracking
  const updatedTricksWon = { ...state.tricksWon };
  updatedTricksWon[winningPlayerId] = (state.tricksWon[winningPlayerId] || 0) + 1;
  
  // Check if all tricks have been played (13 tricks per round)
  const totalTricksPlayed = Object.values(updatedTricksWon).reduce((sum, tricks) => sum + tricks, 0);
  const roundComplete = totalTricksPlayed === 13 * state.players.length;
  
  let finalState = {
    ...state,
    players: updatedPlayers,
    currentTrick: [],
    ledSuit: null,
    tricksWon: updatedTricksWon,
    phase: roundComplete ? 'roundComplete' : 'bidding' // If round complete, go to scoring; otherwise reset for next trick
  };
  
  // If round is complete, update scores
  if (roundComplete) {
    finalState = updateScores(finalState);
  }
  
  // Ensure we return a proper GameState object
  return {
    ...finalState,
    deck: finalState.deck || [],
    roundScore: finalState.roundScore || {},
    bids: finalState.bids || {}
  } as GameState;
}

/**
 * Get valid cards that a player can play given current game state
 */
export function getValidCards(state: GameState, playerId: number): Card[] {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return [];
  
  // Determine if spades are broken
  const spadesBroken = state.currentTrick.some(c => c.suit === '♠');
  
  // Filter hand to only valid cards
  return player.hand.filter(card => 
    canPlayCard(player.hand, card, state.ledSuit, spadesBroken)
  );
}

/**
 * Start a new round (after bidding is complete)
 */
export function startRound(state: GameState): GameState {
  // Set first player (typically the player who made the highest bid, or just rotate)
  // For simplicity, we'll start with player 0 and rotate each round
  // In a real game, the player to the left of the dealer starts
  
  return {
    ...state,
    currentTrick: [],
    ledSuit: null,
    currentPlayerIndex: 0, // Would be determined by position relative to dealer
    phase: 'playing'
  };
}