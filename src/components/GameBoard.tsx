'use client';

import { GameState, CardColor } from '@/lib/types';
import { canPlayCard } from '@/lib/game-logic';
import Card, { CardBack } from './Card';
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
            {gameState.players.map((p, i) => (
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
    const winner = gameState.players.find(p => p.id === gameState.winnerId);
    const isWinner = gameState.winnerId === playerId;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 text-center">
          <div className="text-6xl mb-4">{isWinner ? '🎉' : '😮'}</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isWinner ? 'You Win!' : `${winner?.name || 'Someone'} Wins!`}
          </h2>
          <p className="text-white/60 mb-6">
            {isWinner ? 'Congratulations! You got rid of all your cards!' : 'Better luck next time!'}
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = '/';
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // PLAYING
  return (
    <div className="min-h-screen game-table flex flex-col relative overflow-hidden">
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
      <div className="flex justify-center gap-4 px-4 py-3 flex-wrap">
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
      <div className="flex-1 flex items-center justify-center gap-6 px-4">
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
            <CardBack large />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">
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
          {topCard && <Card card={topCard} large />}
          {/* Active color indicator */}
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

      {/* My hand */}
      <div className={`px-2 pb-4 pt-2 bg-black/30 border-t border-white/10 ${isMyTurn ? 'ring-2 ring-green-500/50 ring-inset' : ''}`}>
        <div
          className="overflow-x-auto pb-2 -mx-2 px-2"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}
        >
          <div className="flex gap-1.5 sm:gap-2 w-max mx-auto">
            {myPlayer?.cards.map(card => {
              const playable = isMyTurn && canPlayCard(gameState, card, playerId);
              return (
                <div key={card.id} className="flex-shrink-0 card-enter">
                  <Card
                    card={card}
                    playable={playable}
                    onClick={() => playable && onPlayCard(card.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center mt-1">
          <span className="text-white/40 text-xs">
            {myPlayer?.name} • {myPlayer?.cards.length} cards
          </span>
        </div>
      </div>
    </div>
  );
}
