// game.js — Core game state and flow controller

// ===== GAME STATE =====
const G = {
  mode: null,
  round: 1,
  scoreUs: 0,
  scoreThem: 0,
  bagsUs: 0,
  bagsThem: 0,
  hands: {},
  bids: {},
  tricks: { south: 0, north: 0, east: 0, west: 0 },
  trick: [],          // current trick: [{ player, card }]
  currentPlayer: null,
  spadesBroken: false,
  playedCards: [],
  phase: 'splash',   // splash | bidding | playing | roundEnd | gameOver
  biddingOrder: ['south', 'west', 'north', 'east'],
  biddingIndex: 0,
  awaitingPlayerCard: false,
  selectedMode: null,
};

const AI_DELAY = { casual: 800, standard: 600, expert: 450 };
const PLAYERS = ['south', 'north', 'east', 'west'];
const TEAMS = { south: 'us', north: 'us', east: 'them', west: 'them' };

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  bindSplashEvents();
  bindGameEvents();
});

function bindSplashEvents() {
  // Mode selection
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      G.selectedMode = card.dataset.mode;
      document.getElementById('btn-start-game').disabled = false;
    });
  });

  // Pre-select Standard
  const stdCard = document.getElementById('mode-standard');
  if (stdCard) { stdCard.click(); }

  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('btn-rules').addEventListener('click', () => openModal('modal-rules'));
  document.getElementById('rules-close').addEventListener('click', () => closeModal('modal-rules'));
  document.getElementById('rules-backdrop').addEventListener('click', () => closeModal('modal-rules'));
}

function bindGameEvents() {
  document.getElementById('btn-menu').addEventListener('click', () => {
    if (confirm('Return to main menu? Current game will be lost.')) {
      showScreen('screen-splash');
      G.phase = 'splash';
    }
  });
  document.getElementById('btn-bid-dec') || bindBidControls();
  bindBidControls();
  document.getElementById('btn-next-round').addEventListener('click', nextRound);
  document.getElementById('btn-play-again').addEventListener('click', () => {
    G.round = 1; G.scoreUs = 0; G.scoreThem = 0; G.bagsUs = 0; G.bagsThem = 0;
    startGame();
  });
  document.getElementById('btn-change-mode').addEventListener('click', () => showScreen('screen-splash'));
}

function bindBidControls() {
  document.getElementById('bid-dec').addEventListener('click', () => changeBid(-1));
  document.getElementById('bid-inc').addEventListener('click', () => changeBid(1));
  document.getElementById('btn-nil').addEventListener('click', () => selectSpecialBid('nil'));
  document.getElementById('btn-blind-nil').addEventListener('click', () => selectSpecialBid('blindNil'));
  document.getElementById('btn-confirm-bid').addEventListener('click', confirmPlayerBid);
}

// ===== GAME START =====
function startGame() {
  G.mode = G.selectedMode || 'standard';
  showScreen('screen-game');
  G.phase = 'bidding';
  startRound();
}

function startRound() {
  // Reset round state
  G.hands = dealHands(shuffleDeck(createDeck()));
  G.bids = {};
  G.tricks = { south: 0, north: 0, east: 0, west: 0 };
  G.trick = [];
  G.spadesBroken = false;
  G.playedCards = [];
  G.biddingIndex = 0;
  G.currentPlayer = null;

  // Sort player hand
  G.hands.south = sortHand(G.hands.south);

  // Update UI
  updateHUD(G);
  updateSpadesIndicator(false);
  PLAYERS.forEach(p => { updatePlayerBid(p, null); updateTricks(p, 0); });

  // Render AI card backs
  ['north', 'east', 'west'].forEach(p => renderAICards(p, 13));
  clearTrickArea();
  renderPlayerHand(G.hands.south, [], () => {});

  // Start bidding
  G.phase = 'bidding';
  setTimeout(runBiddingPhase, 400);
}

// ===== BIDDING PHASE =====
async function runBiddingPhase() {
  G.biddingIndex = 0;
  // Rotate who bids first each round
  const rotated = [...G.biddingOrder.slice((G.round - 1) % 4), ...G.biddingOrder.slice(0, (G.round - 1) % 4)];

  for (let i = 0; i < 4; i++) {
    const player = rotated[i];
    const partnerPlayer = player === 'south' ? 'north' : player === 'north' ? 'south' : player === 'east' ? 'west' : 'east';
    const partnerBid = G.bids[partnerPlayer] || null;

    if (player === 'south') {
      await playerBid(partnerBid);
    } else {
      await sleep(AI_DELAY[G.mode]);
      const result = aiBid(G.hands[player], G.mode, partnerBid ? partnerBid.bid : null, i);
      G.bids[player] = { ...result, player: capitalize(player) };
      updatePlayerBid(player, G.bids[player]);
      const label = G.bids[player].blindNil ? 'Blind Nil' : G.bids[player].nil ? 'Nil' : `${G.bids[player].bid}`;
      showToast(`${capitalize(player)} bids ${label}`);
    }
  }

  // All bids placed
  G.phase = 'playing';
  // Determine who leads (player left of dealer, simplified: south leads round 1)
  G.currentPlayer = rotated[0];
  renderPlayerHand(G.hands.south, getPlayableCards(G.hands.south, [], G.spadesBroken), handlePlayerCardPlay);
  await runPlayingPhase();
}

async function playerBid(partnerBid) {
  return new Promise(resolve => {
    // Setup modal
    const bidNum = document.getElementById('bid-number');
    bidNum.textContent = '3';
    bidNum._value = 3;
    bidNum._special = null;

    // Show/hide nil buttons
    const nilBtn = document.getElementById('btn-nil');
    const blindNilBtn = document.getElementById('btn-blind-nil');
    nilBtn.disabled = G.mode === 'casual';
    blindNilBtn.disabled = G.mode !== 'expert';
    nilBtn.classList.remove('selected');
    blindNilBtn.classList.remove('selected');

    // Partner bid display
    const partnerRow = document.getElementById('bid-partner-row');
    const partnerVal = document.getElementById('bid-partner-val');
    if (partnerBid) {
      partnerRow.style.display = 'flex';
      partnerVal.textContent = partnerBid.blindNil ? 'Blind Nil' : partnerBid.nil ? 'Nil' : partnerBid.bid;
    } else {
      partnerRow.style.display = 'none';
    }

    renderBidHandPreview(G.hands.south);
    openModal('modal-bid');

    const confirmBtn = document.getElementById('btn-confirm-bid');
    const handler = () => {
      confirmBtn.removeEventListener('click', handler);
      closeModal('modal-bid');
      const val = bidNum._value;
      const spec = bidNum._special;
      G.bids.south = {
        bid: spec ? 0 : val,
        nil: spec === 'nil',
        blindNil: spec === 'blindNil',
        player: 'You'
      };
      updatePlayerBid('south', G.bids.south);
      const label = spec === 'blindNil' ? 'Blind Nil' : spec === 'nil' ? 'Nil' : val;
      showToast(`You bid ${label}`);
      resolve();
    };
    confirmBtn.addEventListener('click', handler);
  });
}

function confirmPlayerBid() {
  // Called via bindBidControls — handled by promise in playerBid()
}

function changeBid(delta) {
  const el = document.getElementById('bid-number');
  if (el._special) {
    el._special = null;
    document.querySelectorAll('.bid-special-btn').forEach(b => b.classList.remove('selected'));
  }
  let val = (el._value || 3) + delta;
  val = Math.max(1, Math.min(13, val));
  el._value = val;
  el.textContent = val;
}

function selectSpecialBid(type) {
  const el = document.getElementById('bid-number');
  const nilBtn = document.getElementById('btn-nil');
  const blindNilBtn = document.getElementById('btn-blind-nil');
  if (el._special === type) {
    el._special = null;
    el.textContent = el._value || 3;
    nilBtn.classList.remove('selected');
    blindNilBtn.classList.remove('selected');
  } else {
    el._special = type;
    el.textContent = '0';
    nilBtn.classList.toggle('selected', type === 'nil');
    blindNilBtn.classList.toggle('selected', type === 'blindNil');
  }
}

// ===== PLAYING PHASE =====
async function runPlayingPhase() {
  const leadOrder = ['south', 'west', 'north', 'east'];
  let leadIdx = leadOrder.indexOf(G.currentPlayer);

  for (let trickNum = 0; trickNum < 13; trickNum++) {
    G.trick = [];
    clearTrickArea();

    for (let i = 0; i < 4; i++) {
      const player = leadOrder[(leadIdx + i) % 4];
      showTurnIndicator(player);

      if (player === 'south') {
        const playable = getPlayableCards(G.hands.south, G.trick, G.spadesBroken);
        renderPlayerHand(G.hands.south, playable, handlePlayerCardPlay);
        await waitForPlayerCard();
        hideTurnIndicator();
      } else {
        await sleep(AI_DELAY[G.mode]);
        const card = aiPlayCard(
          G.hands[player], G.trick, G.spadesBroken,
          G.mode, G.bids[player]?.bid || 1, G.tricks[player], G.playedCards
        );
        playCard(player, card);
        hideTurnIndicator();
      }
    }

    // Resolve trick
    const leadSuit = G.trick[0].card.suit;
    const winnerIdx = getTrickWinner(G.trick, leadSuit);
    const winner = G.trick[winnerIdx].player;
    G.tricks[winner]++;
    updateTricks(winner, G.tricks[winner]);
    showTrickWinner(winner);
    leadIdx = leadOrder.indexOf(winner);

    await sleep(900);
    clearTrickArea();
  }

  // Round over
  endRound();
}

function playCard(player, card) {
  // Remove from hand
  G.hands[player] = G.hands[player].filter(c => !cardsEqual(c, card));
  G.trick.push({ player, card });
  G.playedCards.push(card);

  if (card.suit === 'spades') G.spadesBroken = true;
  updateSpadesIndicator(G.spadesBroken);
  renderTrickCard(player, card);

  if (player === 'south') {
    renderPlayerHand(G.hands.south, [], () => {});
  } else {
    renderAICards(player, G.hands[player].length);
  }
}

function handlePlayerCardPlay(card) {
  if (!G.awaitingPlayerCard) return;
  G.awaitingPlayerCard = false;
  playCard('south', card);
  if (G._resolvePlayerCard) G._resolvePlayerCard();
}

function waitForPlayerCard() {
  return new Promise(resolve => {
    G.awaitingPlayerCard = true;
    G._resolvePlayerCard = resolve;
  });
}

// ===== ROUND END =====
function endRound() {
  G.phase = 'roundEnd';

  const result = calculateRoundScore(G.bids, G.tricks);

  // Apply bag penalties
  const usPenalty = applyBagPenalty(G.bagsUs, result.us.bags, G.mode);
  const themPenalty = applyBagPenalty(G.bagsThem, result.them.bags, G.mode);

  G.bagsUs = (G.bagsUs + result.us.bags) % 10;
  G.bagsThem = (G.bagsThem + result.them.bags) % 10;

  G.scoreUs += result.us.points - usPenalty.penalty;
  G.scoreThem += result.them.points - themPenalty.penalty;

  if (usPenalty.overflow) {
    result.us.breakdown.push({ label: '10-bag penalty', value: '-100', type: 'negative' });
    showToast('⚠️ 10-bag penalty! -100 pts for Us', 'warning');
  }
  if (themPenalty.overflow) {
    result.them.breakdown.push({ label: '10-bag penalty', value: '-100', type: 'negative' });
    showToast('⚠️ 10-bag penalty! -100 pts for Them', 'warning');
  }

  updateHUD(G);
  renderRoundSummary(result, G.scoreUs, G.scoreThem, G.bagsUs, G.bagsThem);
  openModal('modal-round');

  // Check win
  const winner = checkWin(G.scoreUs, G.scoreThem, G.mode);
  if (winner) {
    document.getElementById('btn-next-round').textContent = 'See Results →';
    document.getElementById('btn-next-round').onclick = () => {
      closeModal('modal-round');
      showGameOver(winner, G.scoreUs, G.scoreThem);
    };
  } else {
    document.getElementById('btn-next-round').textContent = 'Next Round →';
    document.getElementById('btn-next-round').onclick = nextRound;
  }
}

function nextRound() {
  closeModal('modal-round');
  G.round++;
  startRound();
}
