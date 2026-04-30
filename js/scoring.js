// scoring.js — Score calculation and tracking

// Bids structure: { south, north, east, west }
// Tricks structure: { south, north, east, west }
// Each entry: { bid, nil, blindNil, tricks }

function calculateRoundScore(bids, tricks) {
  const us = scoreTeam(bids.south, bids.north, tricks.south, tricks.north);
  const them = scoreTeam(bids.east, bids.west, tricks.east, tricks.west);
  return { us, them };
}

function scoreTeam(bidA, bidB, tricksA, tricksB) {
  const totalTricks = tricksA + tricksB;
  let points = 0;
  let bags = 0;
  const breakdown = [];

  // Handle nil bids individually
  let teamBid = 0;
  let teamTricks = totalTricks;

  // Player A nil scoring
  if (bidA.nil || bidA.blindNil) {
    const bonus = bidA.blindNil ? 200 : 100;
    if (tricksA === 0) {
      points += bonus;
      breakdown.push({ label: `${bidA.player} Nil`, value: `+${bonus}`, type: 'positive' });
    } else {
      points -= bonus;
      breakdown.push({ label: `${bidA.player} Nil Failed`, value: `-${bonus}`, type: 'negative' });
      teamTricks -= tricksA; // nil tricks don't count for partner's bid calculation
    }
  } else {
    teamBid += bidA.bid;
  }

  // Player B nil scoring
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

  // Team bid evaluation (combining non-nil players)
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

function applyBagPenalty(totalBags, newBags, mode) {
  const threshold = 10;
  const oldMod = totalBags % threshold;
  const newMod = (totalBags + newBags) % threshold;
  const overflows = Math.floor((totalBags + newBags) / threshold) - Math.floor(totalBags / threshold);
  const penalty = overflows * 100;
  return { penalty, overflow: overflows > 0 };
}

// Check win condition
function checkWin(scoreUs, scoreThem, mode) {
  const target = 500;
  const bust = mode === 'expert' ? -200 : null; // Expert: busting -200 = loss
  if (scoreUs >= target && scoreUs > scoreThem) return 'us';
  if (scoreThem >= target && scoreThem > scoreUs) return 'them';
  if (scoreUs >= target && scoreThem >= target) {
    return scoreUs > scoreThem ? 'us' : 'them';
  }
  if (bust && scoreUs <= bust) return 'them';
  if (bust && scoreThem <= bust) return 'us';
  return null;
}
