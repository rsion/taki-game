'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState, CardColor, Card as CardType } from '@/lib/types';
import { canPlayCard } from '@/lib/game-logic';
import Card, { CardBack, cardPoints } from './Card';
import ColorPicker from './ColorPicker';

const COLOR_BG: Record<string, string> = {
  red: 'bg-red-600/30 border-red-500',
  blue: 'bg-blue-600/30 border-blue-500',
  green: 'bg-green-600/30 border-green-500',
  yellow: 'bg-yellow-500/30 border-yellow-400',
};

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  isHost: boolean;
  showColorPicker: boolean;
  onPlayCard: (cardId: string) => void;
  onDrawCard: () => void;
  onCloseTaki: () => void;
  onStartGame: () => void;
  onChooseColor: (color: CardColor) => void;
  onCancelColorPicker: () => void;
}

export default function GameBoard({
  gameState,
  playerId,
  isHost,
  showColorPicker,
  onPlayCard,
  onDrawCard,
  onCloseTaki,
  onStartGame,
  onChooseColor,
  onCancelColorPicker,
}: GameBoardProps) {
  const myPlayer = gameState.players.find(p => p.id === playerId);
  const otherPlayers = gameState.players.filter(p => p.id !== playerId);
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const inMyTaki = gameState.takiMode.active && gameState.takiMode.playerId === playerId;

  /* ═══ Card reorder state ═══════════════════════════════════ */
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const cardWidthRef = useRef(92); // card width + gap

  // Sync card order whenever the hand changes
  useEffect(() => {
    if (!myPlayer) return;
    const ids = myPlayer.cards.map(c => c.id);
    setCardOrder(prev => {
      const kept = prev.filter(id => ids.includes(id));
      const added = ids.filter(id => !prev.includes(id));
      return [...kept, ...added];
    });
  }, [myPlayer?.cards.length, myPlayer?.cards.map(c => c.id).join(',')]);

  // Build display-ordered cards
  const orderedCards = useMemo(() => {
    if (!myPlayer) return [];
    return cardOrder
      .map(id => myPlayer.cards.find(c => c.id === id))
      .filter((c): c is CardType => !!c);
  }, [cardOrder, myPlayer]);

  /* ─── Touch handlers for drag-to-reorder ───────────────── */
  const handleCardTouchStart = useCallback((idx: number, e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };

    longPressRef.current = setTimeout(() => {
      setDragIdx(idx);
      setDragOffsetX(0);
      if (navigator.vibrate) navigator.vibrate(25);
    }, 350);
  }, []);

  const handleContainerTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];

    if (dragIdx === null) {
      // Not dragging yet — cancel long press if scrolling
      if (longPressRef.current && dragStartRef.current) {
        const dx = Math.abs(touch.clientX - dragStartRef.current.x);
        const dy = Math.abs(touch.clientY - dragStartRef.current.y);
        if (dx > 8 || dy > 8) {
          clearTimeout(longPressRef.current);
          longPressRef.current = null;
        }
      }
      return;
    }

    // Dragging — prevent scroll
    e.preventDefault();
    const dx = touch.clientX - dragStartRef.current!.x;
    setDragOffsetX(dx);

    // Swap when dragged far enough
    const threshold = cardWidthRef.current * 0.55;
    if (Math.abs(dx) > threshold) {
      const dir = dx > 0 ? 1 : -1;
      const newIdx = dragIdx + dir;
      setCardOrder(prev => {
        if (newIdx < 0 || newIdx >= prev.length) return prev;
        const next = [...prev];
        [next[dragIdx], next[newIdx]] = [next[newIdx], next[dragIdx]];
        return next;
      });
      if (newIdx >= 0 && newIdx < cardOrder.length) {
        setDragIdx(newIdx);
        dragStartRef.current = { x: touch.clientX, y: dragStartRef.current!.y };
        setDragOffsetX(0);
        if (navigator.vibrate) navigator.vibrate(15);
      }
    }
  }, [dragIdx, cardOrder.length]);

  const handleContainerTouchEnd = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    setDragIdx(null);
    setDragOffsetX(0);
    dragStartRef.current = null;
  }, []);

  // WAITING / LOBBY
  if (gameState.status === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Game Lobby</h2>
          <div className="my-6">
            <p className="text-white/60 text-sm mb-1">Room Code</p>
            <p className="text-5xl font-mono font-black text-white tracking-[0.3em]">
              {gameState.roomCode}
            </p>
            <p className="text-white/40 text-xs mt-2">Share this code with friends</p>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-white/70 text-sm font-semibold">
              Players ({gameState.players.length}/4)
            </p>
            {gameState.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2"
              >
                <span className="text-white font-medium">
                  {p.name} {p.id === playerId && '(you)'}
                </span>
                {p.id === gameState.hostId && (
                  <span className="text-yellow-400 text-xs font-semibold">👑 Host</span>
                )}
              </div>
            ))}
            {gameState.players.length < 2 && (
              <p className="text-white/40 text-sm italic">Waiting for more players...</p>
            )}
          </div>

          {isHost && gameState.players.length >= 2 && (
            <button
              onClick={onStartGame}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:scale-[1.02] active:scale-95"
            >
              🎬 Start Game
            </button>
          )}
          {isHost && gameState.players.length < 2 && (
            <p className="text-white/40 text-sm">Need at least 2 players to start</p>
          )}
          {!isHost && (
            <p className="text-white/50 text-sm">Waiting for host to start the game...</p>
          )}
        </div>
      </div>
    );
  }

  // FINISHED
  if (gameState.status === 'finished') {
    const scores = gameState.players.map(p => {
      if (p.id === gameState.winnerId) {
        return gameState.players
          .filter(op => op.id !== p.id)
          .reduce((sum, op) => sum + op.cards.reduce((cs, c) => cs + cardPoints(c), 0), 0);
      }
      return 0;
    });

    const ranked = gameState.players
      .map((p, i) => ({ ...p, score: scores[i] }))
      .sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div style={{
          background: 'linear-gradient(180deg, #1A6FA0 0%, #154C72 100%)',
          border: '2px solid #3498DB',
          borderRadius: 20,
          padding: '32px 24px 24px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 0 30px rgba(52,152,219,0.3), 0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{
            color: '#FFFFFF', fontSize: 28, fontWeight: 800,
            textAlign: 'center', marginBottom: 24,
            fontFamily: "'Arial Black', sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            סיכום משחק
          </h2>

          <div style={{ marginBottom: 24 }}>
            {ranked.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'transparent',
                borderRadius: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: 700, minWidth: 20 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 600 }}>
                    {p.name} {p.id === playerId ? '(you)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800 }}>{p.score}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>נק&apos;</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => { sessionStorage.clear(); window.location.href = '/'; }}
              style={{
                background: 'linear-gradient(180deg, #5FD35F 0%, #3CB43C 100%)',
                color: '#FFFFFF', fontWeight: 800, fontSize: 18,
                padding: '14px 32px', borderRadius: 30,
                border: '2px solid #2E8B2E', cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                fontFamily: "'Arial Black', sans-serif",
              }}
            >
              שחק שוב
            </button>
            <button
              onClick={() => { sessionStorage.clear(); window.location.href = '/'; }}
              style={{
                background: 'linear-gradient(180deg, #E74C3C 0%, #C0392B 100%)',
                color: '#FFFFFF', fontWeight: 800, fontSize: 18,
                padding: '14px 32px', borderRadius: 30,
                border: '2px solid #A93226', cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                fontFamily: "'Arial Black', sans-serif",
              }}
            >
              תפריט
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING
  return (
    <div className="h-dvh game-table flex flex-col relative overflow-hidden" style={{ height: '100dvh' }}>
      {/* Color picker overlay */}
      {showColorPicker && (
        <ColorPicker onChoose={onChooseColor} onCancel={onCancelColorPicker} />
      )}

      {/* Top bar - game info */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm font-mono">{gameState.roomCode}</span>
          <span className="text-white/40">•</span>
          <span className={`text-sm font-bold ${isMyTurn ? 'text-green-400' : 'text-white/60'}`}>
            {isMyTurn ? "Your turn!" : `${currentPlayer?.name}'s turn`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-sm">{gameState.direction === 1 ? '→' : '←'}</span>
          {gameState.pendingDrawCount > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              +{gameState.pendingDrawCount}
            </span>
          )}
        </div>
      </div>

      {/* Other players */}
      <div className="flex justify-center gap-3 px-3 py-1.5 flex-wrap">
        {otherPlayers.map(p => {
          const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === p.id;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                isCurrentTurn
                  ? 'bg-green-500/30 border border-green-400 current-turn'
                  : 'bg-white/10 border border-white/10'
              }`}
            >
              <span className="text-white font-medium text-sm">{p.name}</span>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {p.cards.length} 🃏
              </span>
            </div>
          );
        })}
      </div>

      {/* Center - discard & draw piles */}
      <div className="flex-1 min-h-0 flex items-center justify-center gap-6 px-4">
        {/* Draw pile */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDrawCard}
            disabled={!isMyTurn || (gameState.takiMode.active && gameState.takiMode.playerId === playerId)}
            className={`relative transition-all ${
              isMyTurn && !inMyTaki
                ? 'hover:scale-105 cursor-pointer active:scale-95'
                : 'opacity-70'
            }`}
          >
            <CardBack />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {gameState.deck.length}
              </span>
            </div>
          </button>
          {isMyTurn && !inMyTaki && (
            <span className="text-white/50 text-xs">
              {gameState.pendingDrawCount > 0 ? `Draw ${gameState.pendingDrawCount}` : 'Draw'}
            </span>
          )}
        </div>

        {/* Discard pile */}
        <div className="flex flex-col items-center gap-2">
          {topCard && <Card card={topCard} />}
          {gameState.activeColor && (
            <div className={`px-3 py-1 rounded-full border text-xs font-bold text-white ${COLOR_BG[gameState.activeColor] || ''}`}>
              {gameState.activeColor.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Taki mode indicator + close button */}
      {inMyTaki && (
        <div className="flex justify-center px-4 pb-2">
          <button
            onClick={onCloseTaki}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg animate-pulse hover:animate-none active:scale-95"
          >
            🔒 Close TAKI
          </button>
        </div>
      )}

      {/* My turn indicator */}
      {isMyTurn && !inMyTaki && (
        <div className="flex justify-center pb-1">
          <span className="text-green-400 text-sm font-bold animate-pulse">▼ Play a card or draw ▼</span>
        </div>
      )}

      {/* ═══ My hand — green shelf with drag-to-reorder ═══ */}
      <div
        className={`px-2 pb-3 pt-2 border-t border-white/10 ${isMyTurn ? 'ring-2 ring-green-400/60 ring-inset' : ''}`}
        style={{
          background: 'linear-gradient(180deg, #4CAF50 0%, #2E7D32 40%, #1B5E20 100%)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <div
          className="overflow-x-auto pb-2 -mx-2 px-2"
          style={{
            WebkitOverflowScrolling: dragIdx !== null ? undefined : 'touch',
            scrollbarWidth: 'thin',
            touchAction: dragIdx !== null ? 'none' : 'pan-x',
          }}
          onTouchMove={handleContainerTouchMove}
          onTouchEnd={handleContainerTouchEnd}
          onTouchCancel={handleContainerTouchEnd}
        >
          <div className="flex gap-1.5 sm:gap-2 w-max mx-auto">
            {orderedCards.map((card, idx) => {
              const playable = isMyTurn && canPlayCard(gameState, card, playerId);
              const isDragging = dragIdx === idx;
              return (
                <div
                  key={card.id}
                  className={`flex-shrink-0 ${isDragging ? '' : 'card-enter'}`}
                  style={{
                    transform: isDragging
                      ? `translateX(${dragOffsetX}px) scale(1.12)`
                      : undefined,
                    zIndex: isDragging ? 50 : 1,
                    opacity: isDragging ? 0.85 : 1,
                    transition: isDragging ? 'none' : 'transform 0.15s ease',
                  }}
                  onTouchStart={(e) => handleCardTouchStart(idx, e)}
                >
                  <Card
                    card={card}
                    playable={dragIdx === null && playable}
                    onClick={() => dragIdx === null && playable && onPlayCard(card.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center mt-1">
          <span className="text-white/40 text-xs">
            {myPlayer?.name} • {myPlayer?.cards.length} cards
            {dragIdx !== null && ' • hold & drag to reorder'}
          </span>
        </div>
      </div>
    </div>
  );
}
