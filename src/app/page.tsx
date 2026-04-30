"use client";

import React, { useState } from 'react';
import { useSpadesGame } from '../lib/gameEngine';
import { Card, MiniCard } from '../components/Card';
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
    updateState,
    completedGames
  } = useSpadesGame();

  const [bidVal, setBidVal] = useState(3);
  const [specialBid, setSpecialBid] = useState<'nil' | 'blindNil' | null>(null);

  // ── SPLASH ─────────────────────────────────────────────────────────────────
  if (state.phase === 'splash') {
    return (
      <div className="screen" style={{ background: 'var(--bg)', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '2rem 1.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '5rem', color: 'var(--gold)', lineHeight: 1 }}>♠</div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.5rem,8vw,3.5rem)', fontWeight: 900, letterSpacing: '0.25em', color: '#fff', marginTop: '0.5rem' }}>SPADES</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Select a difficulty</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', maxWidth: '420px', marginBottom: '2rem' }}>
          {(['casual', 'standard', 'expert'] as Mode[]).map(mode => {
            const isSelected = state.selectedMode === mode;
            const icons: Record<Mode, string> = { casual: '🃏', standard: '🎯', expert: '🏆' };
            const descs: Record<Mode, string> = { casual: 'Relaxed rules · Easy AI', standard: 'Full Spades rules · Smart AI', expert: 'Nil bids · Hardest AI' };
            return (
              <div key={mode} onClick={() => updateState({ selectedMode: mode })}
                   style={{ background: isSelected ? 'rgba(241, 196, 15, 0.15)' : 'rgba(255,255,255,0.04)', border: `2px solid ${isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

  // ── HEADER SCOREBOARD ──────────────────────────────────────────────────────────
  const Header = () => (
    <header style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '0.5rem 0.75rem', background: 'var(--bg)', borderBottom: '2px solid rgba(255,255,255,0.1)', 
      zIndex: 20, flexShrink: 0, height: '60px'
    }}>
      {/* Left: Coin/Status */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f1c40f, #f39c12)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>{completedGames}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '2px 8px' }}>
          <span style={{ fontSize: '0.8rem' }}>🏆</span>
          <span style={{ fontSize: '0.5rem', textTransform: 'uppercase' }}>Finished</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: state.spadesBroken ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '2px 8px', border: state.spadesBroken ? '1px solid #e74c3c' : '1px solid transparent' }}>
          <span style={{ fontSize: '0.8rem' }}>♠</span>
          <span style={{ fontSize: '0.5rem', textTransform: 'uppercase' }}>{state.phase === 'playing' || state.phase === 'roundEnd' ? (state.spadesBroken ? 'Broken' : 'Not Broken') : '---'}</span>
        </div>
      </div>

      {/* Center: Scoreboard */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.3)', 
        borderRadius: 8, overflow: 'hidden', width: '120px'
      }}>
        <div style={{ background: '#0a0e1a', color: 'white', textAlign: 'center', fontSize: '0.65rem', padding: '2px 0', fontWeight: 'bold' }}>
          🎯 250
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, background: '#3498db', padding: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '0.9rem' }}>
            {state.scoreUs}
          </div>
          <div style={{ flex: 1, background: '#e74c3c', padding: '4px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '0.9rem' }}>
            {state.scoreThem}
          </div>
        </div>
      </div>

      {/* Right: Settings */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { if(confirm('Exit to menu?')) updateState({ phase: 'splash' }) }} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⚙️</button>
      </div>
    </header>
  );

  return (
    <div className="screen" style={{ flexDirection: 'column' }}>
      <Header />

      {/* TABLE AREA */}
      <div className="pokerTable" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* TEAM BIDS (Top Left/Right on Table) */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, background: 'linear-gradient(to bottom, #3498db, #2980b9)', borderRadius: '12px', overflow: 'hidden', border: '1px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.4)', minWidth: '70px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', color: '#fff' }}>Our Bid</div>
          <div style={{ padding: '4px 6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{state.bids.south ? state.bids.south.bid + (state.bids.north?.bid || 0) : '-'}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 5, background: 'linear-gradient(to bottom, #e74c3c, #c0392b)', borderRadius: '12px', overflow: 'hidden', border: '1px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.4)', minWidth: '70px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', color: '#fff' }}>Their Bid</div>
          <div style={{ padding: '4px 6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{state.bids.west ? state.bids.west.bid + (state.bids.east?.bid || 0) : '...'}</div>
        </div>

        {/* OPPONENT HANDS & AVATARS */}
        {/* North */}
        <div style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: -15, marginLeft: 15 }}>
            {state.hands.north.map((_, i) => (
              <div key={i} className={styles.cardBack} style={{ width: 32, height: 48, marginLeft: -20, boxShadow: '-2px 0 5px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.3)' }} />
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <PlayerArea player="north" name="North" avatar="N" bid={state.bids.north} tricks={state.tricks.north} />
          </div>
        </div>

        {/* West */}
        <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: -15, marginTop: 15 }}>
            {state.hands.west.map((_, i) => (
              <div key={i} className={styles.cardBack} style={{ width: 48, height: 32, marginTop: -20, boxShadow: '0 -2px 5px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.3)' }} />
            ))}
          </div>
          <div style={{ marginLeft: 8 }}>
            <PlayerArea player="west" name="West" avatar="W" bid={state.bids.west} tricks={state.tricks.west} />
          </div>
        </div>

        {/* East */}
        <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: -15, marginTop: 15 }}>
            {state.hands.east.map((_, i) => (
              <div key={i} className={styles.cardBack} style={{ width: 48, height: 32, marginTop: -20, boxShadow: '0 -2px 5px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.3)' }} />
            ))}
          </div>
          <div style={{ marginRight: 8 }}>
            <PlayerArea player="east" name="East" avatar="E" bid={state.bids.east} tricks={state.tricks.east} />
          </div>
        </div>

        {/* PLAY AREA (Center Cross) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 3 }}>
          <div style={{ position: 'relative', width: 160, height: 160 }}>
            {state.trick.map(tc => {
              let posStyle: React.CSSProperties = {};
              if (tc.player === 'south') posStyle = { bottom: 0, left: '50%', transform: 'translateX(-50%)' };
              if (tc.player === 'north') posStyle = { top: 0, left: '50%', transform: 'translateX(-50%)' };
              if (tc.player === 'west') posStyle = { left: 0, top: '50%', transform: 'translateY(-50%)' };
              if (tc.player === 'east') posStyle = { right: 0, top: '50%', transform: 'translateY(-50%)' };
              
              return (
                <div key={tc.player} style={{ position: 'absolute', ...posStyle }}>
                  <Card card={tc.card} isPlayCard />
                </div>
              );
            })}
          </div>
        </div>

        {/* SOUTH (Player) */}
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 10 }}>
             <PlayerArea player="south" name="You" avatar="Y" bid={state.bids.south} tricks={state.tricks.south} isHuman />
          </div>

          <div style={{ display: 'flex', pointerEvents: awaitingPlayerCard ? 'auto' : 'none', marginBottom: 10 }}>
            {state.hands.south.map((card, i) => {
              const isPlayable = playable.some(c => c.suit === card.suit && c.rank === card.rank);
              return (
                <div key={i} className={styles.playerHandCardWrapper} onClick={() => isPlayable && handlePlayerCardPlay(card)}
                     style={{ 
                       opacity: awaitingPlayerCard && !isPlayable ? 0.5 : 1, 
                       cursor: isPlayable ? 'pointer' : 'default',
                       transform: isPlayable ? 'translateY(-10px)' : 'none',
                       transition: 'all 0.2s'
                     }}>
                  <Card card={card} />
                </div>
              );
            })}
          </div>
        </div>

        {/* BIDDING MODAL OVERLAY */}
        {isBidding && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '16px', width: '280px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '2px solid #3498db' }}>
              <div style={{ padding: '16px', textAlign: 'center', background: '#f8f9fa', borderBottom: '1px solid #eee', position: 'relative' }}>
                <h2 style={{ color: '#2c3e50', fontSize: '1.1rem', fontWeight: 'bold' }}>Select your Bid</h2>
                <button style={{ position: 'absolute', right: 12, top: 14, width: 24, height: 24, borderRadius: '50%', border: '1px solid #ccc', color: '#888', fontSize: '0.8rem', background: '#fff' }}>i</button>
              </div>
              
              <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                <button 
                  onClick={() => { setSpecialBid('nil'); setBidVal(0); }}
                  style={{ width: '56px', height: '44px', borderRadius: '8px', background: specialBid === 'nil' ? '#2ecc71' : '#fff', color: specialBid === 'nil' ? '#fff' : '#2c3e50', border: '1px solid #ddd', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >nil</button>
                {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(val => (
                  <button 
                    key={val}
                    onClick={() => { setSpecialBid(null); setBidVal(val); }}
                    style={{ width: '48px', height: '44px', borderRadius: '8px', background: bidVal === val && !specialBid ? '#2ecc71' : '#fff', color: bidVal === val && !specialBid ? '#fff' : '#2c3e50', border: '1px solid #ddd', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >{val}</button>
                ))}
              </div>

              <div style={{ background: '#3498db', padding: '12px', display: 'flex', gap: '8px' }}>
                <button style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#2980b9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>💡</button>
                <button 
                  onClick={() => {
                    confirmPlayerBid({ bid: specialBid ? 0 : bidVal, nil: specialBid === 'nil', blindNil: specialBid === 'blindNil' });
                    setSpecialBid(null); setBidVal(3);
                  }}
                  style={{ flex: 1, borderRadius: '8px', background: '#2ecc71', color: '#fff', fontWeight: 'bold', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 0 #27ae60' }}
                >
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROUND END MODAL OVERLAY */}
        {state.phase === 'roundEnd' && roundSummary && (
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ background: '#fff', borderRadius: '16px', width: '300px', padding: '24px', textAlign: 'center', color: '#2c3e50', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
               <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>Round Over</h2>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                 <span>Us:</span>
                 <span style={{ fontWeight: 'bold', color: '#3498db' }}>{roundSummary.us > 0 ? '+' : ''}{roundSummary.us}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                 <span>Them:</span>
                 <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>{roundSummary.them > 0 ? '+' : ''}{roundSummary.them}</span>
               </div>
               <button onClick={nextRound} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#3498db', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>Next Round</button>
             </div>
           </div>
        )}

      </div>

      <div className="toast-container">
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </div>
  );
}
