import { useState, useCallback, useRef } from 'react';
import { Card, GameState, Player, Mode, PlayedCard, Bid } from './types';
import { createDeck, shuffleDeck, dealHands, sortHand, getPlayableCards, getTrickWinner, cardsEqual } from './cards';
import { aiBid, aiPlayCard } from './ai';
import { calculateRoundScore, applyBagPenalty, checkWin, RoundResult } from './scoring';

const PLAYERS: Player[] = ['south', 'north', 'east', 'west'];
const AI_DELAY = { casual: 800, standard: 600, expert: 450 };

export function useSpadesGame() {
  const [state, setState] = useState<GameState>({
    mode: 'standard',
    round: 1,
    scoreUs: 0,
    scoreThem: 0,
    bagsUs: 0,
    bagsThem: 0,
    hands: { south: [], north: [], east: [], west: [] },
    bids: {},
    tricks: { south: 0, north: 0, east: 0, west: 0 },
    trick: [],
    currentPlayer: null,
    spadesBroken: false,
    playedCards: [],
    phase: 'splash',
    biddingOrder: ['south', 'west', 'north', 'east'],
    biddingIndex: 0,
    selectedMode: 'standard',
    lastTrickWonBy: {},
  });

  const [awaitingPlayerCard, setAwaitingPlayerCard] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: string} | null>(null);
  const [roundSummary, setRoundSummary] = useState<{ result: RoundResult, us: number, them: number, bUs: number, bThem: number} | null>(null);
  const [winner, setWinner] = useState<'us' | 'them' | null>(null);

  const resolvePlayerCardRef = useRef<((card: Card) => void) | null>(null);

  const showToast = useCallback((msg: string, type: string = '') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const updateState = useCallback((updates: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const startGame = useCallback((mode: Mode) => {
    updateState({ mode, selectedMode: mode });
    startRound({ ...state, mode, selectedMode: mode, round: 1, scoreUs: 0, scoreThem: 0, bagsUs: 0, bagsThem: 0, lastTrickWonBy: {} });
  }, [state, updateState]);

  const startRound = useCallback((currentState: GameState) => {
    const deck = shuffleDeck(createDeck());
    const hands = dealHands(deck);
    hands.south = sortHand(hands.south);

    updateState({
      hands,
      bids: {},
      tricks: { south: 0, north: 0, east: 0, west: 0 },
      trick: [],
      spadesBroken: false,
      playedCards: [],
      biddingIndex: 0,
      currentPlayer: null,
      phase: 'bidding',
      lastTrickWonBy: {} // Clear last tricks on new round
    });

    setTimeout(() => runBiddingPhase({ ...currentState, hands }), 400);
  }, [updateState]);

  const runBiddingPhase = async (st: GameState) => {
    const rotated = [...st.biddingOrder.slice((st.round - 1) % 4), ...st.biddingOrder.slice(0, (st.round - 1) % 4)];
    const newBids: Partial<Record<Player, Bid>> = {};

    for (let i = 0; i < 4; i++) {
      const player = rotated[i];
      const partnerPlayer = player === 'south' ? 'north' : player === 'north' ? 'south' : player === 'east' ? 'west' : 'east';
      const partnerBid = newBids[partnerPlayer] || null;

      if (player === 'south') {
        updateState({ bids: { ...newBids } }); // Trigger re-render to show modal
        await new Promise<void>(resolve => {
          // Modal will call confirmPlayerBid which resolves this
          (window as any)._resolvePlayerBid = (bid: Bid) => {
            newBids.south = bid;
            showToast(`You bid ${bid.blindNil ? 'Blind Nil' : bid.nil ? 'Nil' : bid.bid}`);
            resolve();
          };
        });
      } else {
        await sleep(AI_DELAY[st.mode]);
        const result = aiBid(st.hands[player], st.mode, partnerBid ? partnerBid.bid : null, i);
        const bidObj = { ...result, player: player.charAt(0).toUpperCase() + player.slice(1) };
        newBids[player] = bidObj;
        updateState({ bids: { ...newBids } });
        const label = bidObj.blindNil ? 'Blind Nil' : bidObj.nil ? 'Nil' : `${bidObj.bid}`;
        showToast(`${bidObj.player} bids ${label}`);
      }
    }

    updateState({ phase: 'playing', currentPlayer: rotated[0], bids: newBids });
    setTimeout(() => runPlayingPhase({ ...st, phase: 'playing', currentPlayer: rotated[0], bids: newBids }), 500);
  };

  const confirmPlayerBid = useCallback((bid: Bid) => {
    if ((window as any)._resolvePlayerBid) {
      (window as any)._resolvePlayerBid(bid);
      (window as any)._resolvePlayerBid = null;
    }
  }, []);

  const runPlayingPhase = async (st: GameState) => {
    const leadOrder = ['south', 'west', 'north', 'east'] as Player[];
    let leadIdx = leadOrder.indexOf(st.currentPlayer!);

    // Use refs/local variables to track fast-changing state inside the async loop
    let currentTrick: PlayedCard[] = [];
    let currentHands = { ...st.hands };
    let currentTricks = { ...st.tricks };
    let spadesBroken = st.spadesBroken;
    let playedCards = [...st.playedCards];
    let lastTrickRecord: Partial<Record<Player, PlayedCard[]>> = { ...st.lastTrickWonBy };

    for (let trickNum = 0; trickNum < 13; trickNum++) {
      currentTrick = [];
      updateState({ trick: currentTrick, lastTrickWonBy: lastTrickRecord });

      for (let i = 0; i < 4; i++) {
        const player = leadOrder[(leadIdx + i) % 4];
        updateState({ currentPlayer: player, trick: currentTrick, hands: currentHands });

        if (player === 'south') {
          setAwaitingPlayerCard(true);
          const card = await new Promise<Card>(resolve => {
            resolvePlayerCardRef.current = resolve;
          });
          setAwaitingPlayerCard(false);
          playCard(player, card);
        } else {
          await sleep(AI_DELAY[st.mode]);
          const card = aiPlayCard(
            currentHands[player], currentTrick, spadesBroken,
            st.mode, st.bids[player]?.bid || 1, currentTricks[player], playedCards
          );
          playCard(player, card);
        }
      }

      function playCard(p: Player, c: Card) {
        currentHands[p] = currentHands[p].filter(handCard => !cardsEqual(handCard, c));
        currentTrick.push({ player: p, card: c });
        playedCards.push(c);
        if (c.suit === 'spades') spadesBroken = true;
        updateState({ trick: [...currentTrick], hands: { ...currentHands }, spadesBroken });
      }

      const leadSuit = currentTrick[0].card.suit;
      const winnerIdx = getTrickWinner(currentTrick, leadSuit);
      const winnerPlayer = currentTrick[winnerIdx].player;
      
      currentTricks[winnerPlayer]++;
      
      showToast(`${winnerPlayer === 'south' ? 'You' : winnerPlayer.charAt(0).toUpperCase() + winnerPlayer.slice(1)} won the trick!`);
      
      updateState({ tricks: { ...currentTricks } });
      await sleep(1000); // Show completed trick

      lastTrickRecord = {};
      lastTrickRecord[winnerPlayer] = [...currentTrick];
      
      leadIdx = leadOrder.indexOf(winnerPlayer);
      updateState({ trick: [], lastTrickWonBy: lastTrickRecord });
    }

    endRound(st.bids, currentTricks, st.scoreUs, st.scoreThem, st.bagsUs, st.bagsThem, st.mode);
  };

  const handlePlayerCardPlay = useCallback((card: Card) => {
    if (awaitingPlayerCard && resolvePlayerCardRef.current) {
      resolvePlayerCardRef.current(card);
      resolvePlayerCardRef.current = null;
    }
  }, [awaitingPlayerCard]);

  const endRound = (bids: any, tricks: any, scoreUs: number, scoreThem: number, bagsUs: number, bagsThem: number, mode: Mode) => {
    const result = calculateRoundScore(bids, tricks);

    const usPenalty = applyBagPenalty(bagsUs, result.us.bags, mode);
    const themPenalty = applyBagPenalty(bagsThem, result.them.bags, mode);

    const newBagsUs = (bagsUs + result.us.bags) % 10;
    const newBagsThem = (bagsThem + result.them.bags) % 10;

    const newScoreUs = scoreUs + result.us.points - usPenalty.penalty;
    const newScoreThem = scoreThem + result.them.points - themPenalty.penalty;

    if (usPenalty.overflow) {
      result.us.breakdown.push({ label: '10-bag penalty', value: '-100', type: 'negative' });
      showToast('⚠️ 10-bag penalty! -100 pts for Us', 'warning');
    }
    if (themPenalty.overflow) {
      result.them.breakdown.push({ label: '10-bag penalty', value: '-100', type: 'negative' });
      showToast('⚠️ 10-bag penalty! -100 pts for Them', 'warning');
    }

    updateState({ phase: 'roundEnd', scoreUs: newScoreUs, scoreThem: newScoreThem, bagsUs: newBagsUs, bagsThem: newBagsThem });
    setRoundSummary({ result, us: newScoreUs, them: newScoreThem, bUs: newBagsUs, bThem: newBagsThem });

    const win = checkWin(newScoreUs, newScoreThem, mode);
    if (win) {
      setWinner(win);
    }
  };

  const nextRound = useCallback(() => {
    if (winner) {
      updateState({ phase: 'gameOver' });
    } else {
      updateState({ round: state.round + 1 });
      startRound({ ...state, round: state.round + 1 });
    }
  }, [state, winner, updateState, startRound]);

  return {
    state,
    startGame,
    confirmPlayerBid,
    handlePlayerCardPlay,
    awaitingPlayerCard,
    toast,
    roundSummary,
    nextRound,
    winner,
    updateState
  };
}
