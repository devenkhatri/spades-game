"use client";

import React, { useState } from 'react';
import { useSpadesGame } from '../lib/gameEngine';
import { Card } from '../components/Card';
import { PlayerArea } from '../components/PlayerArea';
import { getPlayableCards } from '../lib/cards';
import { Mode } from '../lib/types';
import styles from '../styles/cards.module.css';

export default function GamePage() {
  const {
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
  } = useSpadesGame();

  const [bidVal, setBidVal] = useState(3);
  const [specialBid, setSpecialBid] = useState<'nil' | 'blindNil' | null>(null);

  // ── SPLASH ─────────────────────────────────────────────────────────────────
  if (state.phase === 'splash') {
    return (
      <div className="screen" style={{ background: 'linear-gradient(160deg,#060d1f 0%,#0d1a3a 50%,#060d1f 100%)', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '2rem 1.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 30px rgba(201,162,39,0.7))', color: 'var(--gold)', lineHeight: 1 }}>♠</div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.5rem,8vw,3.5rem)', fontWeight: 900, letterSpacing: '0.25em', background: 'linear-gradient(135deg,var(--gold),var(--gold2),var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '0.5rem' }}>SPADES</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Select a difficulty to begin</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '420px', marginBottom: '2rem' }}>
          {(['casual', 'standard', 'expert'] as Mode[]).map(mode => {
            const isSelected = state.selectedMode === mode;
            const icons: Record<Mode, string> = { casual: '🃏', standard: '🎯', expert: '🏆' };
            const descs: Record<Mode, string> = { casual: 'Relaxed rules · Easy AI', standard: 'Full Spades rules · Smart AI', expert: 'Nil bids · Hardest AI' };
            return (
              <div key={mode} onClick={() => updateState({ selectedMode: mode })}
                   style={{ background: isSelected ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.04)', border: `2px solid ${isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: isSelected ? '0 0 30px rgba(201,162,39,0.15)' : 'none' }}>
                <span style={{ fontSize: '1.6rem' }}>{icons[mode]}</span>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize', color: isSelected ? 'var(--gold)' : 'white' }}>{mode}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{descs[mode]}</div>
                </div>
                {isSelected && <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: '1.1rem' }}>✓</span>}
              </div>
            );
          })}
        </div>
        <button className="btn-primary" style={{ maxWidth: '420px' }} onClick={() => startGame(state.selectedMode || 'standard')}>Start Game</button>
      </div>
    );
  }

  const playable = awaitingPlayerCard ? getPlayableCards(state.hands.south, state.trick, state.spadesBroken) : [];
  const isBidding = state.phase === 'bidding' && !state.bids.south;

  // ── SHARED HEADER ──────────────────────────────────────────────────────────
  const Header = () => (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(5,10,20,0.97)', borderBottom: '1px solid rgba(255,255,255,0.07)', zIndex: 20, flexShrink: 0 }}>
      <button onClick={() => { if(confirm('Exit to menu?')) updateState({ phase: 'splash' }) }}
              style={{ color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
        ← Exit
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Us</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>{state.scoreUs}</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--amber)' }}>🎒{state.bagsUs}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>R{state.round}</div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.12)' }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Them</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>{state.scoreThem}</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--amber)' }}>🎒{state.bagsThem}</div>
        </div>
      </div>
      <div style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '20px', background: 'rgba(201,162,39,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.2)', textTransform: 'uppercase' }}>
        {state.mode}
      </div>
    </header>
  );

  // ── BIDDING SCREEN — completely replaces the game board ───────────────────
  if (isBidding) {
    return (
      <div className="screen" style={{ flexDirection: 'column', background: '#050a14' }}>
        <Header />

        {/* Bid controls */}
        <div style={{ flexShrink: 0, padding: '1rem 1rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', fontWeight: 600 }}>
            📋 Place Your Bid
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '0.6rem' }}>
            <button onClick={() => { setSpecialBid(null); setBidVal(v => Math.max(1, v - 1)); }}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>−</button>
            <div style={{ fontSize: '3rem', fontWeight: 900, minWidth: 48, textAlign: 'center', color: specialBid ? 'var(--blue)' : 'white', lineHeight: 1 }}>
              {specialBid ? '0' : bidVal}
            </div>
            <button onClick={() => { setSpecialBid(null); setBidVal(v => Math.min(13, v + 1)); }}
                    style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>+</button>
            <div style={{ width: '1px', height: 36, background: 'rgba(255,255,255,0.1)' }} />
            {state.mode !== 'casual' && (
              <button onClick={() => setSpecialBid(s => s === 'nil' ? null : 'nil')}
                      style={{ padding: '8px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, background: specialBid === 'nil' ? 'rgba(52,152,219,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${specialBid === 'nil' ? 'var(--blue)' : 'rgba(255,255,255,0.15)'}`, color: specialBid === 'nil' ? 'var(--blue)' : 'white' }}>
                Nil
              </button>
            )}
            {state.mode === 'expert' && (
              <button onClick={() => setSpecialBid(s => s === 'blindNil' ? null : 'blindNil')}
                      style={{ padding: '8px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: specialBid === 'blindNil' ? 'rgba(52,152,219,0.2)' : 'rgba(255,255,255,0.07)', border: `1px solid ${specialBid === 'blindNil' ? 'var(--blue)' : 'rgba(255,255,255,0.15)'}`, color: specialBid === 'blindNil' ? 'var(--blue)' : 'white', whiteSpace: 'nowrap' }}>
                Blind Nil
              </button>
            )}
            <button onClick={() => {
                      confirmPlayerBid({ bid: specialBid ? 0 : bidVal, nil: specialBid === 'nil', blindNil: specialBid === 'blindNil' });
                      setSpecialBid(null); setBidVal(3);
                    }}
                    style={{ padding: '10px 18px', borderRadius: '22px', background: 'linear-gradient(135deg,var(--gold),var(--gold2))', color: '#000', fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              Confirm ✓
            </button>
          </div>
        </div>

        {/* ALL 13 cards — flex wrap, fully visible, no overlap */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div style={{ padding: '4px 8px 2px', textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Hand ({state.hands.south.length} cards)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, padding: '6px 8px 8px' }}>
            {state.hands.south.map((card, i) => (
              <div key={i} style={{ flexShrink: 0 }}>
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>

        <div className="toast-container">
          {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
        </div>
      </div>
    );
  }

  // ── GAME BOARD (non-bidding phases) ───────────────────────────────────────
  return (
    <div className="screen" style={{ flexDirection: 'column' }}>
      <Header />

      {/* TABLE */}
      <main className="pokerTable" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* North */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.4rem 0.5rem 0.2rem', gap: 3, flexShrink: 0, zIndex: 4 }}>
          <PlayerArea player="north" name="North" avatar="N" bid={state.bids.north} tricks={state.tricks.north} lastTrick={state.lastTrickWonBy.north} />
          <div style={{ display: 'flex' }}>
            {state.hands.north.slice(0, 13).map((_, i) => (
              <div key={i} style={{ width: 16, height: 22, borderRadius: 3, background: 'linear-gradient(135deg,#1a2a6e,#2a3f9e)', border: '1px solid rgba(255,255,255,0.2)', marginLeft: i === 0 ? 0 : -10, boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
            ))}
          </div>
        </div>

        {/* Middle: West | Play Area | East */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'auto 1fr auto', minHeight: 0, padding: '0 0.25rem', gap: 4, alignItems: 'center' }}>

          {/* West */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 4, maxWidth: 110, overflow: 'hidden' }}>
            <PlayerArea player="west" name="West" avatar="W" bid={state.bids.west} tricks={state.tricks.west} lastTrick={state.lastTrickWonBy.west} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {state.hands.west.slice(0, Math.min(state.hands.west.length, 8)).map((_, i) => (
                <div key={i} style={{ width: 20, height: 14, borderRadius: 2, background: 'linear-gradient(135deg,#1a2a6e,#2a3f9e)', border: '1px solid rgba(255,255,255,0.2)', marginTop: i === 0 ? 0 : -9 }} />
              ))}
            </div>
          </div>

          {/* Center play area */}
          <div style={{ display: 'grid', gridTemplateAreas: '". n ." "w sp e" ". s ."', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', alignItems: 'center', justifyItems: 'center', width: '100%', height: '100%', padding: '0.25rem', gap: 4 }}>
            <div style={{ gridArea: 'n' }}>{state.trick.find(t => t.player === 'north') && <Card card={state.trick.find(t => t.player === 'north')?.card} isPlayCard />}</div>
            <div style={{ gridArea: 'w' }}>{state.trick.find(t => t.player === 'west') && <Card card={state.trick.find(t => t.player === 'west')?.card} isPlayCard />}</div>
            <div style={{ gridArea: 'sp' }} />
            <div style={{ gridArea: 'e' }}>{state.trick.find(t => t.player === 'east') && <Card card={state.trick.find(t => t.player === 'east')?.card} isPlayCard />}</div>
            <div style={{ gridArea: 's' }}>{state.trick.find(t => t.player === 'south') && <Card card={state.trick.find(t => t.player === 'south')?.card} isPlayCard />}</div>
          </div>

          {/* East */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 4, maxWidth: 110, overflow: 'hidden' }}>
            <PlayerArea player="east" name="East" avatar="E" bid={state.bids.east} tricks={state.tricks.east} lastTrick={state.lastTrickWonBy.east} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {state.hands.east.slice(0, Math.min(state.hands.east.length, 8)).map((_, i) => (
                <div key={i} style={{ width: 20, height: 14, borderRadius: 2, background: 'linear-gradient(135deg,#1a2a6e,#2a3f9e)', border: '1px solid rgba(255,255,255,0.2)', marginTop: i === 0 ? 0 : -9 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Spades indicator */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2px 10px', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: state.spadesBroken ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
            {state.spadesBroken ? '♠ Spades broken' : '♠ Spades locked'}
          </div>
        </div>
      </main>

      {/* PLAYER HAND (play mode only — overlapping fan) */}
      <div style={{ flexShrink: 0, background: 'rgba(5,10,20,0.85)', borderTop: '1px solid rgba(255,255,255,0.07)', zIndex: 5 }}>
        <div className={styles.playerHandContainer} style={{ paddingTop: 14, paddingBottom: 4, minHeight: 'auto' }}>
          {state.hands.south.map((card, i) => {
            const isPlayable = playable.some(c => c.suit === card.suit && c.rank === card.rank);
            return (
              <div key={i} className={styles.playerHandCardWrapper} style={{ zIndex: isPlayable ? 10 : 1 }}>
                <Card
                  card={card}
                  unplayable={awaitingPlayerCard && !isPlayable}
                  onClick={() => { if(isPlayable) handlePlayerCardPlay(card); }}
                />
              </div>
            );
          })}
        </div>
        <PlayerArea player="south" name="You" avatar="YOU" bid={state.bids.south} tricks={state.tricks.south} lastTrick={state.lastTrickWonBy.south} isHuman />
      </div>

      {/* ROUND SUMMARY */}
      {state.phase === 'roundEnd' && roundSummary && (
        <div className="modal-backdrop">
          <div className="modal-sheet">
            <div className="modal-header"><h2>Round Complete</h2></div>
            <div className="modal-body">
              {([{ label: 'Us (You + North)', data: roundSummary.result.us }, { label: 'Them (East + West)', data: roundSummary.result.them }] as const).map(({ label, data }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{label}</h3>
                  {data.breakdown.map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.2rem 0' }}>
                      <span>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.type === 'positive' ? 'var(--green)' : row.type === 'negative' ? 'var(--red)' : 'var(--amber)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>US TOTAL</div><div style={{ fontSize: '2rem', fontWeight: 800 }}>{roundSummary.us}</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>THEM TOTAL</div><div style={{ fontSize: '2rem', fontWeight: 800 }}>{roundSummary.them}</div></div>
              </div>
              <button className="btn-primary" onClick={nextRound}>Next Round →</button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {state.phase === 'gameOver' && (
        <div className="screen" style={{ background: 'linear-gradient(160deg,#060d1f,#0d1a3a)', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ fontSize: '5rem', marginBottom: '0.5rem' }}>{winner === 'us' ? '🏆' : '😔'}</div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.8rem', color: winner === 'us' ? 'var(--gold)' : 'var(--text)', marginBottom: '0.5rem' }}>
            {winner === 'us' ? 'You Win!' : 'You Lose'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Final — Us: <strong style={{ color: 'white' }}>{state.scoreUs}</strong> · Them: <strong style={{ color: 'white' }}>{state.scoreThem}</strong>
          </p>
          <button className="btn-primary" style={{ maxWidth: '300px' }} onClick={() => updateState({ phase: 'splash' })}>Play Again</button>
        </div>
      )}

      {/* TOAST */}
      <div className="toast-container">
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </div>
  );
}
