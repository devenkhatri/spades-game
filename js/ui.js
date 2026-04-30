// ui.js — DOM rendering and animations

// ---- Card Rendering ----

function renderCard(card, opts = {}) {
  const el = document.createElement('div');
  el.className = `card ${card.suit}${card.rank === 'A' ? ' ace' : ''}`;
  el.dataset.rank = card.rank;
  el.dataset.suit = card.suit;
  if (opts.selected) el.classList.add('selected');
  if (opts.unplayable) el.classList.add('unplayable');
  el.innerHTML = `
    <div class="card-corner">
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit-sm">${card.symbol}</div>
    </div>
    <div class="card-suit-center">${card.symbol}</div>
    <div class="card-corner bottom">
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit-sm">${card.symbol}</div>
    </div>`;
  return el;
}

function renderPlayCard(card) {
  const el = document.createElement('div');
  el.className = `play-card ${card.suit}`;
  el.innerHTML = `
    <div class="card-corner">
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit-sm">${card.symbol}</div>
    </div>
    <div class="card-suit-center">${card.symbol}</div>
    <div class="card-corner bottom">
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit-sm">${card.symbol}</div>
    </div>`;
  return el;
}

function renderCardBack() {
  const el = document.createElement('div');
  el.className = 'card-back';
  return el;
}

// ---- Hand Rendering ----

function renderPlayerHand(hand, playable, onCardClick) {
  const container = document.getElementById('player-hand');
  container.innerHTML = '';
  const sorted = sortHand(hand);
  sorted.forEach(card => {
    const isPlayable = playable.some(c => cardsEqual(c, card));
    const el = renderCard(card, { unplayable: !isPlayable });
    if (isPlayable) {
      el.addEventListener('click', () => onCardClick(card));
      el.addEventListener('touchend', (e) => { e.preventDefault(); onCardClick(card); });
    }
    container.appendChild(el);
  });
}

function renderAICards(player, count) {
  const container = document.getElementById(`cards-${player}`);
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.appendChild(renderCardBack());
  }
}

// ---- Trick Area ----

function renderTrickCard(player, card) {
  const slot = document.getElementById(`trick-${player}`);
  slot.innerHTML = '';
  if (card) slot.appendChild(renderPlayCard(card));
}

function clearTrickArea() {
  ['north','south','east','west'].forEach(p => {
    const slot = document.getElementById(`trick-${p}`);
    if (slot) slot.innerHTML = '';
  });
  const info = document.getElementById('trick-info');
  if (info) info.textContent = '';
}

function showTrickWinner(player) {
  const slot = document.getElementById(`trick-${player}`);
  if (slot && slot.firstChild) slot.firstChild.classList.add('trick-winner');
  const info = document.getElementById('trick-info');
  if (info) info.textContent = player === 'south' ? 'You win!' : `${capitalize(player)} wins`;
}

// ---- HUD Updates ----

function updateHUD(state) {
  document.getElementById('score-us').textContent = state.scoreUs;
  document.getElementById('score-them').textContent = state.scoreThem;
  document.getElementById('bags-us').textContent = `🎒 ${state.bagsUs}`;
  document.getElementById('bags-them').textContent = `🎒 ${state.bagsThem}`;
  document.getElementById('hud-round').textContent = `Round ${state.round}`;
  document.getElementById('hud-mode-badge').textContent = capitalize(state.mode);

  // Score color
  const scoreUsEl = document.getElementById('score-us');
  const scoreThemEl = document.getElementById('score-them');
  scoreUsEl.style.color = state.scoreUs >= 400 ? '#2ecc71' : state.scoreUs < 0 ? '#e74c3c' : '';
  scoreThemEl.style.color = state.scoreThem >= 400 ? '#e74c3c' : '';
}

function updatePlayerBid(player, bid) {
  const el = document.getElementById(`bid-${player}`);
  if (!el) return;
  if (bid === null || bid === undefined) { el.textContent = '—'; return; }
  const bData = bid;
  if (bData.blindNil) el.textContent = 'Blind Nil';
  else if (bData.nil) el.textContent = 'Nil';
  else el.textContent = `Bid: ${bData.bid}`;
  el.style.color = '#c9a227';
}

function updateTricks(player, tricks) {
  const el = document.getElementById(`tricks-${player}`);
  if (el) el.textContent = tricks;
}

function updateSpadesIndicator(broken) {
  const dot = document.getElementById('spades-dot');
  const txt = document.getElementById('spades-text');
  if (broken) {
    dot.className = 'spades-dot broken';
    txt.textContent = 'Spades broken';
  } else {
    dot.className = 'spades-dot';
    txt.textContent = 'Spades locked';
  }
}

// ---- Turn indicator ----
function showTurnIndicator(player) {
  const el = document.getElementById('turn-indicator');
  el.textContent = player === 'south' ? 'Your turn!' : `${capitalize(player)} is thinking…`;
  el.classList.add('visible');
  if (player !== 'south') {
    setTimeout(() => el.classList.remove('visible'), 1500);
  }
}
function hideTurnIndicator() {
  document.getElementById('turn-indicator').classList.remove('visible');
}

// ---- Bid Hand Preview ----
function renderBidHandPreview(hand) {
  const el = document.getElementById('bid-hand-preview');
  el.innerHTML = '';
  const sorted = sortHand(hand);
  sorted.forEach(c => {
    const s = document.createElement('span');
    s.textContent = c.symbol;
    s.style.color = (c.suit === 'hearts' || c.suit === 'diamonds') ? '#e74c3c' : '#1a1a2e';
    s.style.background = '#fff';
    s.style.borderRadius = '3px';
    s.style.padding = '1px 3px';
    s.style.fontSize = '0.9rem';
    el.appendChild(s);
  });
}

// ---- Round Summary ----
function renderRoundSummary(result, scoreUs, scoreThem, bagsUs, bagsThem) {
  const container = document.getElementById('round-summary');
  container.innerHTML = '';

  const teams = [
    { name: 'Us (You + North)', data: result.us },
    { name: 'Them (East + West)', data: result.them }
  ];

  teams.forEach(team => {
    const div = document.createElement('div');
    div.className = 'round-team';
    let html = `<div class="round-team-name">${team.name}</div>`;
    team.data.breakdown.forEach(row => {
      html += `<div class="round-row">
        <span>${row.label}</span>
        <span class="round-val ${row.type}">${row.value}</span>
      </div>`;
    });
    const sign = team.data.points >= 0 ? '+' : '';
    html += `<div class="round-row total">
      <span>Round Total</span>
      <span class="round-val ${team.data.points >= 0 ? 'positive' : 'negative'}">${sign}${team.data.points}</span>
    </div>`;
    div.innerHTML = html;
    container.appendChild(div);
  });

  // Running totals
  const totalsDiv = document.createElement('div');
  totalsDiv.className = 'round-team';
  totalsDiv.innerHTML = `
    <div class="round-team-name">Running Score</div>
    <div class="round-row">
      <span>Us</span>
      <span class="round-val">${scoreUs} pts &nbsp; 🎒 ${bagsUs}</span>
    </div>
    <div class="round-row">
      <span>Them</span>
      <span class="round-val">${scoreThem} pts &nbsp; 🎒 ${bagsThem}</span>
    </div>`;
  container.appendChild(totalsDiv);
}

// ---- Game Over ----
function showGameOver(winner, scoreUs, scoreThem) {
  document.getElementById('screen-game').classList.remove('active');
  const screen = document.getElementById('screen-gameover');
  screen.classList.add('active');

  const isWin = winner === 'us';
  document.getElementById('gameover-icon').textContent = isWin ? '🏆' : '😔';
  document.getElementById('gameover-title').textContent = isWin ? 'You Win!' : 'You Lose';
  document.getElementById('gameover-subtitle').textContent = isWin
    ? 'Congratulations! Your team reached 500 points.'
    : 'The opponents reached 500 points first. Better luck next time!';

  document.getElementById('gameover-scores').innerHTML = `
    <div class="go-score-team">
      <div class="go-score-label">Us</div>
      <div class="go-score-val" style="color:${isWin?'#2ecc71':'#e74c3c'}">${scoreUs}</div>
    </div>
    <div style="color:#4a5568;font-size:1.2rem;align-self:center">vs</div>
    <div class="go-score-team">
      <div class="go-score-label">Them</div>
      <div class="go-score-val" style="color:${!isWin?'#2ecc71':'#e74c3c'}">${scoreThem}</div>
    </div>`;

  if (isWin) launchConfetti();
}

// ---- Screens ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ---- Toast ----
function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast${type ? ' ' + type : ''}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

// ---- Confetti ----
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#c9a227','#e8c547','#2ecc71','#3498db','#9b59b6','#e74c3c','#ffffff'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (Math.random() * 2 + 2) + 's';
    el.style.animationDelay = (Math.random() * 1.5) + 's';
    el.style.width = el.style.height = (Math.random() * 8 + 6) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(el);
  }
}

// ---- Utility ----
function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
