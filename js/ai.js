// ai.js — AI bidding and card-play logic

// ---- BIDDING ----

function aiBid(hand, mode, partnerBid, position) {
  const strength = evaluateHand(hand);
  const spades = countSpades(hand);

  // Base bid estimate from hand strength
  let bid = Math.round(strength);

  // Adjust for spades
  bid += spades >= 5 ? 1 : spades >= 3 ? 0 : -1;
  bid = Math.max(1, Math.min(13, bid));

  if (mode === 'casual') {
    // Simple estimate with slight randomness
    bid = Math.max(1, Math.min(7, bid + Math.floor(Math.random() * 3) - 1));
    return { bid, nil: false, blindNil: false };
  }

  if (mode === 'standard') {
    // Consider partner's bid
    if (partnerBid !== null && partnerBid >= 5) bid = Math.max(1, bid - 1);

    // Nil bid: only if very weak hand
    const canNil = strength < 1.5 && spades === 0;
    if (canNil && Math.random() > 0.3) return { bid: 0, nil: true, blindNil: false };

    return { bid, nil: false, blindNil: false };
  }

  // Expert
  if (partnerBid !== null && partnerBid >= 5) bid = Math.max(1, bid - 1);
  const canNil = strength < 1.0 && spades === 0;
  if (canNil) return { bid: 0, nil: true, blindNil: false };

  // Blind nil: extremely rare, only if partner has not bid yet and first position
  if (partnerBid === null && position === 0 && Math.random() > 0.92) {
    return { bid: 0, nil: false, blindNil: true };
  }

  return { bid, nil: false, blindNil: false };
}

// ---- CARD PLAY ----

function aiPlayCard(hand, trick, spadesBroken, mode, playerBid, tricksTaken, playedCards) {
  const playable = getPlayableCards(hand, trick, spadesBroken);

  if (mode === 'casual') return casualPlay(playable, trick);
  if (mode === 'standard') return standardPlay(playable, trick, playerBid, tricksTaken);
  return expertPlay(playable, trick, playerBid, tricksTaken, hand, playedCards);
}

// Casual: mostly random, avoid throwing high cards needlessly
function casualPlay(playable, trick) {
  if (trick.length === 0) {
    // Lead lowest non-spade if possible
    const nonSpades = playable.filter(c => c.suit !== 'spades');
    const pool = nonSpades.length > 0 ? nonSpades : playable;
    return pool.reduce((a, b) => a.value < b.value ? a : b);
  }
  // Try to win if possible with lowest winning card
  const winning = tryToWinCheap(playable, trick);
  return winning || playable.reduce((a, b) => a.value < b.value ? a : b);
}

// Standard: basic strategy — win when needed, dump losers otherwise
function standardPlay(playable, trick, playerBid, tricksTaken) {
  const needTricks = playerBid - tricksTaken;

  if (trick.length === 0) {
    if (needTricks <= 0) return dumpLoser(playable);
    return bestLead(playable);
  }

  if (needTricks <= 0) {
    // Don't need more tricks — dump lowest card
    return dumpLoser(playable);
  }

  const winning = tryToWinCheap(playable, trick);
  return winning || dumpLoser(playable);
}

// Expert: full strategy
function expertPlay(playable, trick, playerBid, tricksTaken, fullHand, playedCards) {
  const needTricks = playerBid - tricksTaken;

  if (trick.length === 0) {
    if (needTricks <= 0) return dumpLoser(playable);
    // Lead highest card in longest suit (not spades unless only spades left)
    return bestLead(playable);
  }

  if (needTricks <= 0) return dumpLoser(playable);

  // Try to win cheaply
  const winning = tryToWinCheap(playable, trick);
  if (winning) return winning;

  // Can't win — dump lowest
  return dumpLoser(playable);
}

// Helpers
function currentWinner(trick) {
  if (!trick.length) return null;
  const leadSuit = trick[0].card.suit;
  let winner = trick[0];
  for (let i = 1; i < trick.length; i++) {
    if (beats(trick[i].card, winner.card, leadSuit)) winner = trick[i];
  }
  return winner;
}

function tryToWinCheap(playable, trick) {
  const leadSuit = trick[0].card.suit;
  const win = currentWinner(trick);
  if (!win) return null;

  // Cards that beat the current winner
  const canWin = playable.filter(c => beats(c, win.card, leadSuit));
  if (!canWin.length) return null;

  // Return lowest winning card
  return canWin.reduce((a, b) => a.value < b.value ? a : b);
}

function dumpLoser(playable) {
  // Prefer lowest non-spade
  const nonSpades = playable.filter(c => c.suit !== 'spades');
  const pool = nonSpades.length > 0 ? nonSpades : playable;
  return pool.reduce((a, b) => a.value < b.value ? a : b);
}

function bestLead(playable) {
  // Lead highest card in longest non-spade suit; fallback to highest spade
  const suits = {};
  for (const c of playable) {
    if (c.suit !== 'spades') suits[c.suit] = (suits[c.suit] || []).concat(c);
  }
  let best = null;
  let bestLen = 0;
  for (const s of Object.keys(suits)) {
    if (suits[s].length > bestLen) { bestLen = suits[s].length; best = suits[s]; }
  }
  const pool = best || playable.filter(c => c.suit === 'spades') || playable;
  return pool.reduce((a, b) => a.value > b.value ? a : b);
}
