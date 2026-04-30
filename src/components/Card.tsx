import React from 'react';
import { Card as CardType } from '../lib/types';
import styles from '../styles/cards.module.css';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  selected?: boolean;
  unplayable?: boolean;
  isPlayCard?: boolean;
  isWinning?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ card, faceDown, selected, unplayable, isPlayCard, isWinning, onClick }) => {
  if (faceDown) {
    return <div className={styles.cardBack} />;
  }

  if (!card) return null;

  const className = [
    isPlayCard ? styles.playCard : styles.card,
    styles[card.suit],
    card.rank === 'A' ? styles.ace : '',
    selected ? styles.selected : '',
    unplayable ? styles.unplayable : '',
    isWinning ? styles.winning : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={className} onClick={!unplayable ? onClick : undefined}>
      <div className={styles.corner}>
        <div className={styles.rank}>{card.rank}</div>
        <div className={styles.suitSm}>{card.symbol}</div>
      </div>
    </div>
  );
};

export const MiniCard: React.FC<{ card: CardType }> = ({ card }) => {
  return (
    <div className={`${styles.miniCard} ${styles[card.suit]}`} title={`${card.rank} of ${card.suit}`}>
      <span className={styles.miniCardRank}>{card.rank}</span>
      <span className={styles.miniCardSuit}>{card.symbol}</span>
    </div>
  );
};
