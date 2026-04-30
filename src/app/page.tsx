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

  if (state.phase === 'splash') {
    return (
      <div className="screen" style={{ background: 'linear-gradient(135deg,var(--bg) 0%,#0d1a3a 50%,var(--bg) 100%)', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px rgba(201,162,39,0.6))', color: 'var(--gold)' }}>♠</div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', fontWeight: 900, letterSpacing: '0.2em', background: 'linear-gradient(135deg,var(--gold),var(--gold2),var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SPADES</h1>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', width: '100%', maxWidth: '900px', marginBottom: '2rem' }}>
          {(['casual', 'standard', 'expert'] as Mode[]).map(mode => (
            <div key={mode} onClick={() => updateState({ selectedMode: mode })}
                 style={{
                   background: 'var(--glass)', border: `1px solid ${state.selectedMode === mode ? 'var(--gold)' : 'var(--glass-border)'}`,
                   borderRadius: 'var(--radius-lg)', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                   boxShadow: state.selectedMode === mode ? '0 0 0 2px rgba(201,162,39,0.3), 0 12px 40px rgba(201,162,39,0.2)' : 'none'
                 }}>
              <h3 style={{ fontSize: '1.2rem', textTransform: 'capitalize', color: state.selectedMode === mode ? 'var(--gold)' : 'white' }}>{mode}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {mode === 'casual' ? 'Relaxed rules, easy AI.' : mode === 'standard' ? 'Full Spades rules, smart AI.' : 'Advanced AI with blind nil bids.'}
              </p>
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ maxWidth: '300px' }} onClick={() => startGame(state.selectedMode || 'standard')}>Start Game</button>
      </div>
    );
  }

  const playable = awaitingPlayerCard ? getPlayableCards(state.hands.south, state.trick, state.spadesBroken) : [];

  return (
    <div className="screen">
      {/* HUD */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(10,14,26,0.95)', borderBottom: '1px solid var(--glass-border)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => { if(confirm('Exit to menu?')) updateState({ phase: 'splash' }) }} style={{ color: 'var(--text-muted)' }}>Exit</button>
          <div style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(201,162,39,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.25)', textTransform: 'uppercase' }}>{state.mode}</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>US</div><div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{state.scoreUs}</div><div style={{ fontSize: '0.65rem', color: 'var(--amber)' }}>🎒 {state.bagsUs}</div></div>
          <div style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>vs</div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>THEM</div><div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{state.scoreThem}</div><div style={{ fontSize: '0.65rem', color: 'var(--amber)' }}>🎒 {state.bagsThem}</div></div>
        </div>
        <div style={{ alignSelf: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Round {state.round}</div>
      </header>

      {/* Table */}
      <main style={{ flex: 1, position: 'relative', background: 'radial-gradient(ellipse at center,var(--table2) 0%,var(--table) 60%,#061208 100%)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', overflow: 'hidden' }}>
        
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PlayerArea player="north" name="North" avatar="N" bid={state.bids.north} tricks={state.tricks.north} lastTrick={state.lastTrickWonBy.north} />
            <div style={{ display: 'flex', marginLeft: '-14px' }}>
              {state.hands.north.map((_, i) => <div key={i} className={styles.cardBack} style={{ marginLeft: i === 0 ? 0 : '-14px' }} />)}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem' }}>
          <PlayerArea player="west" name="West" avatar="W" bid={state.bids.west} tricks={state.tricks.west} lastTrick={state.lastTrickWonBy.west} />
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
            {state.hands.west.map((_, i) => <div key={i} className={styles.cardBack} style={{ width: '36px', height: '24px', marginTop: i === 0 ? 0 : '-12px' }} />)}
          </div>
        </div>

        <div style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem' }}>
          <PlayerArea player="east" name="East" avatar="E" bid={state.bids.east} tricks={state.tricks.east} lastTrick={state.lastTrickWonBy.east} />
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
            {state.hands.east.map((_, i) => <div key={i} className={styles.cardBack} style={{ width: '36px', height: '24px', marginTop: i === 0 ? 0 : '-12px' }} />)}
          </div>
        </div>

        {/* Play Area */}
        <div style={{ flex: 1, display: 'grid', gridTemplateAreas: '". north ." "west center east" ". south ."', gridTemplateColumns: '1fr auto 1fr', gridTemplateRows: '1fr auto 1fr', alignItems: 'center', justifyItems: 'center', padding: '0.5rem' }}>
          <div style={{ gridArea: 'north' }}>{state.trick.find(t => t.player === 'north') && <Card card={state.trick.find(t => t.player === 'north')?.card} isPlayCard />}</div>
          <div style={{ gridArea: 'west' }}>{state.trick.find(t => t.player === 'west') && <Card card={state.trick.find(t => t.player === 'west')?.card} isPlayCard />}</div>
          <div style={{ gridArea: 'center', width: '60px', height: '60px' }}></div>
          <div style={{ gridArea: 'east' }}>{state.trick.find(t => t.player === 'east') && <Card card={state.trick.find(t => t.player === 'east')?.card} isPlayCard />}</div>
          <div style={{ gridArea: 'south' }}>{state.trick.find(t => t.player === 'south') && <Card card={state.trick.find(t => t.player === 'south')?.card} isPlayCard />}</div>
        </div>

        {/* Human Hand */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0', minHeight: '90px' }}>
            {state.hands.south.map((card, i) => {
              const isPlayable = playable.some(c => c.suit === card.suit && c.rank === card.rank);
              return (
                <div key={i} style={{ marginLeft: i === 0 ? 0 : '-22px', position: 'relative', zIndex: isPlayable ? 10 : 1 }}>
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

        <div style={{ position: 'absolute', bottom: '100px', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.7)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: state.spadesBroken ? 'var(--green)' : 'var(--red)' }}></span>
          {state.spadesBroken ? 'Spades broken' : 'Spades locked'}
        </div>
      </main>

      {/* Bidding Modal */}
      {state.phase === 'bidding' && !state.bids.south && (
        <div className="modal-backdrop">
          <div className="modal-sheet">
            <div className="modal-header"><h2>Place Your Bid</h2></div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0' }}>
                <button onClick={() => setBidVal(Math.max(1, bidVal - 1))} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--glass)', border: '2px solid var(--glass-border)', color: 'white', fontSize: '1.5rem' }}>-</button>
                <div style={{ fontSize: '3.5rem', fontWeight: 800 }}>{specialBid ? '0' : bidVal}</div>
                <button onClick={() => setBidVal(Math.min(13, bidVal + 1))} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--glass)', border: '2px solid var(--glass-border)', color: 'white', fontSize: '1.5rem' }}>+</button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button 
                  disabled={state.mode === 'casual'}
                  onClick={() => setSpecialBid(specialBid === 'nil' ? null : 'nil')}
                  style={{ flex: 1, padding: '0.7rem', borderRadius: '12px', background: specialBid === 'nil' ? 'rgba(52,152,219,0.2)' : 'var(--glass)', border: `1px solid ${specialBid === 'nil' ? 'var(--blue)' : 'var(--glass-border)'}`, color: 'white' }}>
                  Nil
                </button>
                <button 
                  disabled={state.mode !== 'expert'}
                  onClick={() => setSpecialBid(specialBid === 'blindNil' ? null : 'blindNil')}
                  style={{ flex: 1, padding: '0.7rem', borderRadius: '12px', background: specialBid === 'blindNil' ? 'rgba(52,152,219,0.2)' : 'var(--glass)', border: `1px solid ${specialBid === 'blindNil' ? 'var(--blue)' : 'var(--glass-border)'}`, color: 'white' }}>
                  Blind Nil
                </button>
              </div>
              <button className="btn-primary" onClick={() => {
                confirmPlayerBid({ bid: specialBid ? 0 : bidVal, nil: specialBid === 'nil', blindNil: specialBid === 'blindNil' });
              }}>Confirm Bid</button>
            </div>
          </div>
        </div>
      )}

      {/* Round Summary Modal */}
      {state.phase === 'roundEnd' && roundSummary && (
        <div className="modal-backdrop">
          <div className="modal-sheet">
            <div className="modal-header"><h2>Round Complete</h2></div>
            <div className="modal-body">
              <div style={{ background: 'var(--glass)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Us (You + North)</h3>
                {roundSummary.result.us.breakdown.map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '0.2rem 0' }}>
                    <span>{row.label}</span>
                    <span style={{ color: row.type === 'positive' ? 'var(--green)' : row.type === 'negative' ? 'var(--red)' : 'var(--amber)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--glass)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Them (East + West)</h3>
                {roundSummary.result.them.breakdown.map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '0.2rem 0' }}>
                    <span>{row.label}</span>
                    <span style={{ color: row.type === 'positive' ? 'var(--green)' : row.type === 'negative' ? 'var(--red)' : 'var(--amber)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={nextRound}>Next Round →</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {state.phase === 'gameOver' && (
        <div className="screen" style={{ background: 'var(--bg)', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{winner === 'us' ? '🏆' : '😔'}</div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', color: winner === 'us' ? 'var(--gold)' : 'var(--text)' }}>
            {winner === 'us' ? 'You Win!' : 'You Lose'}
          </h1>
          <button className="btn-primary" style={{ maxWidth: '300px', marginTop: '2rem' }} onClick={() => updateState({ phase: 'splash' })}>Play Again</button>
        </div>
      )}

      {/* Toast */}
      <div className="toast-container">
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </div>
  );
}
