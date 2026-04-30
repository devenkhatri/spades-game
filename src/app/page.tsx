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

  // ── SPLASH ──────────────────────────────────────────────────────────────────
  if (state.phase === 'splash') {
    return (
      <div className="screen" style={{ background: 'linear-gradient(160deg,#060d1f 0%,#0d1a3a 50%,#060d1f 100%)', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '2rem 1.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 30px rgba(201,162,39,0.7))', color: 'var(--gold)', lineHeight: 1 }}>♠</div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.5rem,8vw,3.5rem)', fontWeight: 900, letterSpacing: '0.25em', background: 'linear-gradient(135deg,var(--gold),var(--gold2),var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '0.5rem' }}>SPADES</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', letterSpacing: '0.1em' }}>Select a difficulty to begin</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '420px', marginBottom: '2rem' }}>
          {(['casual', 'standard', 'expert'] as Mode[]).map(mode => {
            const isSelected = state.selectedMode === mode;
            const icons = { casual: '🃏', standard: '🎯', expert: '🏆' };
            const descs = { casual: 'Relaxed rules · Easy AI', standard: 'Full Spades rules · Smart AI', expert: 'Nil bids · Hardest AI' };
            return (
              <div key={mode} onClick={() => updateState({ selectedMode: mode })}
                   style={{
                     background: isSelected ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.04)',
                     border: `2px solid ${isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                     borderRadius: '14px', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.2s',
                     display: 'flex', alignItems: 'center', gap: '1rem',
                     boxShadow: isSelected ? '0 0 30px rgba(201,162,39,0.15)' : 'none'
                   }}>
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

  return (
    <div className="screen">
      {/* ── HUD ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', background: 'rgba(5,10,20,0.97)', borderBottom: '1px solid rgba(255,255,255,0.07)', zIndex: 20, flexShrink: 0 }}>
        <button onClick={() => { if(confirm('Exit to menu?')) updateState({ phase: 'splash' }) }}
                style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.3rem 0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          ← Exit
        </button>

        {/* Score block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Us</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{state.scoreUs}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--amber)' }}>🎒 {state.bagsUs}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>R{state.round}</div>
            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.12)' }}></div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Them</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{state.scoreThem}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--amber)' }}>🎒 {state.bagsThem}</div>
          </div>
        </div>

        <div style={{ fontSize: '0.65rem', padding: '0.25rem 0.6rem', borderRadius: '20px', background: 'rgba(201,162,39,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {state.mode}
        </div>
      </header>

      {/* ── TABLE ── */}
      <main className="pokerTable" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* North player */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem 0.5rem 0', gap: '4px', flexShrink: 0, zIndex: 4 }}>
          <PlayerArea player="north" name="North" avatar="N" bid={state.bids.north} tricks={state.tricks.north} lastTrick={state.lastTrickWonBy.north} />
          {/* compact fan of card backs */}
          <div style={{ display: 'flex' }}>
            {state.hands.north.slice(0,13).map((_, i) => (
              <div key={i} className={styles.cardBack} style={{ width: '22px', height: '30px', borderRadius: '4px', marginLeft: i === 0 ? 0 : '-14px', opacity: 0.9 }} />
            ))}
          </div>
        </div>

        {/* Middle row: West + Play area + East */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', minHeight: 0, padding: '0 0.25rem', gap: '0.25rem' }}>
          
          {/* West */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 4 }}>
            <PlayerArea player="west" name="West" avatar="W" bid={state.bids.west} tricks={state.tricks.west} lastTrick={state.lastTrickWonBy.west} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {state.hands.west.slice(0, 13).map((_, i) => (
                <div key={i} className={styles.cardBack} style={{ width: '28px', height: '20px', borderRadius: '3px', marginTop: i === 0 ? 0 : '-13px' }} />
              ))}
            </div>
          </div>

          {/* Center play area */}
          <div style={{ display: 'grid', gridTemplateAreas: '". n ." "w . e" ". s ."', gridTemplateColumns: '1fr auto 1fr', gridTemplateRows: '1fr auto 1fr', alignItems: 'center', justifyItems: 'center', gap: '6px', padding: '0.25rem', zIndex: 3 }}>
            <div style={{ gridArea: 'n' }}>{state.trick.find(t => t.player === 'north') && <Card card={state.trick.find(t => t.player === 'north')?.card} isPlayCard />}</div>
            <div style={{ gridArea: 'w' }}>{state.trick.find(t => t.player === 'west') && <Card card={state.trick.find(t => t.player === 'west')?.card} isPlayCard />}</div>
            <div style={{ gridArea: 'e' }}>{state.trick.find(t => t.player === 'east') && <Card card={state.trick.find(t => t.player === 'east')?.card} isPlayCard />}</div>
            <div style={{ gridArea: 's' }}>{state.trick.find(t => t.player === 'south') && <Card card={state.trick.find(t => t.player === 'south')?.card} isPlayCard />}</div>
          </div>

          {/* East */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 4 }}>
            <PlayerArea player="east" name="East" avatar="E" bid={state.bids.east} tricks={state.tricks.east} lastTrick={state.lastTrickWonBy.east} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {state.hands.east.slice(0, 13).map((_, i) => (
                <div key={i} className={styles.cardBack} style={{ width: '28px', height: '20px', borderRadius: '3px', marginTop: i === 0 ? 0 : '-13px' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Spades broken indicator */}
        <div style={{
          position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
          padding: '3px 10px', fontSize: '0.65rem', color: 'var(--text-muted)', zIndex: 5, whiteSpace: 'nowrap'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: state.spadesBroken ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}></span>
          {state.spadesBroken ? '♠ Spades broken' : '♠ Spades locked'}
        </div>

        {/* Human hand + HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0.5rem 0.4rem', gap: '6px', flexShrink: 0, zIndex: 5 }}>
          <div className={styles.playerHandContainer}>
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
      </main>

      {/* ── BIDDING OVERLAY (bottom sheet, no blur so cards stay visible) ── */}
      {isBidding && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>
          {/* transparent touch guard so user can't click through */}
          <div style={{ flex: 1, pointerEvents: 'auto' }} />
          <div style={{
            background: 'linear-gradient(0deg, rgba(5,10,20,0.98) 0%, rgba(10,18,35,0.95) 100%)',
            borderTop: '1px solid rgba(201,162,39,0.25)',
            borderRadius: '20px 20px 0 0',
            padding: '1rem 1.25rem 1.5rem',
            pointerEvents: 'auto',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.7)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 0.75rem' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Place Your Bid</h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Look at your hand above, then choose</p>
            </div>

            {/* Bid stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '1rem 0' }}>
              <button onClick={() => setBidVal(Math.max(1, bidVal - 1))}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>−</button>
              <div style={{ textAlign: 'center', minWidth: '60px' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, color: specialBid ? 'var(--blue)' : 'white' }}>
                  {specialBid ? '0' : bidVal}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>tricks</div>
              </div>
              <button onClick={() => setBidVal(Math.min(13, bidVal + 1))}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>+</button>
            </div>

            {/* Special bids */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button
                disabled={state.mode === 'casual'}
                onClick={() => setSpecialBid(specialBid === 'nil' ? null : 'nil')}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
                  background: specialBid === 'nil' ? 'rgba(52,152,219,0.18)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${specialBid === 'nil' ? 'var(--blue)' : 'rgba(255,255,255,0.1)'}`,
                  color: state.mode === 'casual' ? 'rgba(255,255,255,0.25)' : (specialBid === 'nil' ? 'var(--blue)' : 'white'),
                  cursor: state.mode === 'casual' ? 'not-allowed' : 'pointer'
                }}>
                Nil
              </button>
              <button
                disabled={state.mode !== 'expert'}
                onClick={() => setSpecialBid(specialBid === 'blindNil' ? null : 'blindNil')}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
                  background: specialBid === 'blindNil' ? 'rgba(52,152,219,0.18)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${specialBid === 'blindNil' ? 'var(--blue)' : 'rgba(255,255,255,0.1)'}`,
                  color: state.mode !== 'expert' ? 'rgba(255,255,255,0.25)' : (specialBid === 'blindNil' ? 'var(--blue)' : 'white'),
                  cursor: state.mode !== 'expert' ? 'not-allowed' : 'pointer'
                }}>
                Blind Nil
              </button>
            </div>

            <button className="btn-primary" onClick={() => {
              setSpecialBid(null);
              setBidVal(3);
              confirmPlayerBid({ bid: specialBid ? 0 : bidVal, nil: specialBid === 'nil', blindNil: specialBid === 'blindNil' });
            }}>
              Confirm Bid
            </button>
          </div>
        </div>
      )}

      {/* ── ROUND SUMMARY ── */}
      {state.phase === 'roundEnd' && roundSummary && (
        <div className="modal-backdrop">
          <div className="modal-sheet">
            <div className="modal-header"><h2>Round Complete</h2></div>
            <div className="modal-body">
              {[
                { label: 'Us (You + North)', data: roundSummary.result.us },
                { label: 'Them (East + West)', data: roundSummary.result.them }
              ].map(({ label, data }) => (
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

              {/* Score totals */}
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>US TOTAL</div><div style={{ fontSize: '2rem', fontWeight: 800 }}>{roundSummary.us}</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>THEM TOTAL</div><div style={{ fontSize: '2rem', fontWeight: 800 }}>{roundSummary.them}</div></div>
              </div>

              <button className="btn-primary" onClick={nextRound}>Next Round →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── GAME OVER ── */}
      {state.phase === 'gameOver' && (
        <div className="screen" style={{ background: 'linear-gradient(160deg,#060d1f,#0d1a3a)', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ fontSize: '5rem', marginBottom: '0.5rem' }}>{winner === 'us' ? '🏆' : '😔'}</div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.8rem', color: winner === 'us' ? 'var(--gold)' : 'var(--text)', marginBottom: '0.5rem' }}>
            {winner === 'us' ? 'You Win!' : 'You Lose'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Final score — Us: <strong style={{ color: 'white' }}>{state.scoreUs}</strong> · Them: <strong style={{ color: 'white' }}>{state.scoreThem}</strong>
          </p>
          <button className="btn-primary" style={{ maxWidth: '300px' }} onClick={() => updateState({ phase: 'splash' })}>Play Again</button>
        </div>
      )}

      {/* ── TOAST ── */}
      <div className="toast-container">
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </div>
  );
}
