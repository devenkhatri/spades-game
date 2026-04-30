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
  const bidDisplay = bid ? (bid.blindNil ? 'BN' : bid.nil ? 'Nil' : bid.bid) : '-';
  
  const getAvatarStyle = () => {
    switch(player) {
      case 'south': return { bg: '#3498db', emoji: '👽' };
      case 'north': return { bg: '#85c1e9', emoji: '🐸' };
      case 'west': return { bg: '#e74c3c', emoji: '🐦' };
      case 'east': return { bg: '#d35400', emoji: '🐴' };
      default: return { bg: '#95a5a6', emoji: '👤' };
    }
  };

  const avatarInfo = getAvatarStyle();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Avatar Box */}
      <div style={{
        width: '46px', 
        height: '46px', 
        borderRadius: '12px',
        background: avatarInfo.bg,
        border: '2px solid white',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        position: 'relative'
      }}>
        {avatarInfo.emoji}
      </div>
      
      {/* Bid/Tricks Text */}
      <div style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'white',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
      }}>
        {tricks}/{bidDisplay}
      </div>

      {/* Last Trick Display (Optional) */}
      {lastTrick && lastTrick.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          padding: '3px 6px',
          marginTop: '4px',
          gap: 2,
        }}>
          <span style={{ fontSize: '0.45rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
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
