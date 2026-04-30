import { Bid, Mode, Player } from './types';

export interface ScoreBreakdown {
  label: string;
  value: string;
  type: 'positive' | 'negative' | 'warning';
}

export interface TeamScore {
  points: number;
  bags: number;
  breakdown: ScoreBreakdown[];
}

export interface RoundResult {
  us: TeamScore;
  them: TeamScore;
}

export function calculateRoundScore(bids: Partial<Record<Player, Bid>>, tricks: Record<Player, number>): RoundResult {
  const defaultBid: Bid = { bid: 1, nil: false, blindNil: false, player: 'Unknown' };
  
  const bidSouth = bids.south || defaultBid;
  const bidNorth = bids.north || defaultBid;
  const bidEast = bids.east || defaultBid;
  const bidWest = bids.west || defaultBid;

  const us = scoreTeam(bidSouth, bidNorth, tricks.south, tricks.north);
  const them = scoreTeam(bidEast, bidWest, tricks.east, tricks.west);
  
  return { us, them };
}

function scoreTeam(bidA: Bid, bidB: Bid, tricksA: number, tricksB: number): TeamScore {
  const totalTricks = tricksA + tricksB;
  let points = 0;
  let bags = 0;
  const breakdown: ScoreBreakdown[] = [];

  let teamBid = 0;
  let teamTricks = totalTricks;

  if (bidA.nil || bidA.blindNil) {
    const bonus = bidA.blindNil ? 200 : 100;
    if (tricksA === 0) {
      points += bonus;
      breakdown.push({ label: `${bidA.player} Nil`, value: `+${bonus}`, type: 'positive' });
    } else {
      points -= bonus;
      breakdown.push({ label: `${bidA.player} Nil Failed`, value: `-${bonus}`, type: 'negative' });
      teamTricks -= tricksA;
    }
  } else {
    teamBid += bidA.bid;
  }

  if (bidB.nil || bidB.blindNil) {
    const bonus = bidB.blindNil ? 200 : 100;
    if (tricksB === 0) {
      points += bonus;
      breakdown.push({ label: `${bidB.player} Nil`, value: `+${bonus}`, type: 'positive' });
    } else {
      points -= bonus;
      breakdown.push({ label: `${bidB.player} Nil Failed`, value: `-${bonus}`, type: 'negative' });
      teamTricks -= tricksB;
    }
  } else {
    teamBid += bidB.bid;
  }

  const nonNilTricks = (bidA.nil || bidA.blindNil ? 0 : tricksA) +
                       (bidB.nil || bidB.blindNil ? 0 : tricksB);

  if (teamBid > 0) {
    if (nonNilTricks >= teamBid) {
      const roundBags = nonNilTricks - teamBid;
      points += teamBid * 10 + roundBags;
      bags = roundBags;
      breakdown.push({ label: `Made ${teamBid} bid (${nonNilTricks} tricks)`, value: `+${teamBid * 10 + roundBags}`, type: 'positive' });
      if (roundBags > 0) breakdown.push({ label: `+${roundBags} bag${roundBags > 1 ? 's' : ''}`, value: '', type: 'warning' });
    } else {
      points -= teamBid * 10;
      breakdown.push({ label: `Missed ${teamBid} bid (${nonNilTricks} tricks)`, value: `-${teamBid * 10}`, type: 'negative' });
    }
  }

  return { points, bags, breakdown };
}

export function applyBagPenalty(totalBags: number, newBags: number, mode: Mode): { penalty: number; overflow: boolean } {
  const threshold = 10;
  const overflows = Math.floor((totalBags + newBags) / threshold) - Math.floor(totalBags / threshold);
  const penalty = overflows * 100;
  return { penalty, overflow: overflows > 0 };
}

export function checkWin(scoreUs: number, scoreThem: number, mode: Mode): 'us' | 'them' | null {
  const target = 500;
  const bust = mode === 'expert' ? -200 : null;
  if (scoreUs >= target && scoreUs > scoreThem) return 'us';
  if (scoreThem >= target && scoreThem > scoreUs) return 'them';
  if (scoreUs >= target && scoreThem >= target) {
    return scoreUs > scoreThem ? 'us' : 'them';
  }
  if (bust && scoreUs <= bust) return 'them';
  if (bust && scoreThem <= bust) return 'us';
  return null;
}
