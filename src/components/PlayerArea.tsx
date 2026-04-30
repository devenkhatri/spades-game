import React from 'react';
import { Player, Bid, PlayedCard } from '../lib/types';
import { MiniCard } from './Card';
import styles from '../styles/cards.module.css';

interface PlayerAreaProps {
  player: Player;
  name: string;
  avatar: string;
  bid: Bid | undefined;
  tricks: number;
  lastTrick?: PlayedCard[];
  isHuman?: boolean;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({ player, name, avatar, bid, tricks, lastTrick, isHuman }) => {
  const bidDisplay = bid ? (bid.blindNil ? 'Blind Nil' : bid.nil ? 'Nil' : `Bid: ${bid.bid}`) : '—';

  return (
    // Wrapper stacks HUD pill and Last Trick vertically — HUD pill drives the column width
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>

      {/* HUD pill */}
      <div style={{
        display: 'flex',
        flexDirection: isHuman ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        padding: '0.3rem 0.6rem',
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: isHuman ? 'linear-gradient(135deg,var(--gold),#9a7a1a)' : 'linear-gradient(135deg,#2a3f6e,#3d5a9e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isHuman ? '0.5rem' : '0.6rem', fontWeight: 800, color: isHuman ? '#000' : '#fff',
          flexShrink: 0,
        }}>
          {avatar}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text)' }}>{name}</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{bidDisplay}</span>
        </div>
        <div style={{
          minWidth: '22px', height: '22px', borderRadius: '5px',
          background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)',
        }}>
          {tricks}
        </div>
      </div>

      {/* Last Trick — shown BELOW the HUD pill, never beside it */}
      {lastTrick && lastTrick.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(201,162,39,0.2)',
          borderRadius: '8px',
          padding: '3px 6px 4px',
          gap: 2,
        }}>
          <span style={{ fontSize: '0.45rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Last Trick
          </span>
          <div className={styles.miniCardsList}>
            {lastTrick.map((tc, idx) => (
              <MiniCard key={idx} card={tc.card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
