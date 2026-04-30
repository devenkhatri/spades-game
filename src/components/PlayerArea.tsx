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
    <div style={{
      display: 'flex',
      flexDirection: isHuman ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid var(--glass-border)',
      borderRadius: '10px',
      padding: '0.35rem 0.75rem',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: isHuman ? 'linear-gradient(135deg,var(--gold),#9a7a1a)' : 'linear-gradient(135deg,#2a3f6e,#3d5a9e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isHuman ? '0.55rem' : '0.65rem', fontWeight: 800, color: isHuman ? '#000' : '#fff'
      }}>
        {avatar}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{name}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{bidDisplay}</span>
      </div>
      <div style={{
        minWidth: '24px', height: '24px', borderRadius: '6px',
        background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)'
      }}>
        {tricks}
      </div>
      
      {/* Last Trick Display */}
      {lastTrick && lastTrick.length > 0 && (
        <div className={styles.lastTrickContainer}>
          <span className={styles.lastTrickLabel}>Last Trick</span>
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
