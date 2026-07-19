'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { GameState, CardColor } from '@/lib/types';
import * as logic from '@/lib/game-logic';
import { BOT_ID, botPlay } from '@/lib/bot';
import GameBoard from '@/components/GameBoard';

export default function GamePage({ params }: { params: { code: string } }) {
  const code = params.code;

  const [playerId, setPlayerId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isBotMode, setIsBotMode] = useState(false);
  const [error, setError] = useState('');

  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>['channel']> | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const isBotRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // ── Initialize & subscribe ────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem(`player_${code}`);
    if (!stored) {
      window.location.href = '/';
      return;
    }

    const { id, name, isHost: hostFlag } = JSON.parse(stored);
    setPlayerId(id);
    setIsHost(hostFlag || false);

    // Check bot mode
    const botGame = sessionStorage.getItem(`bot_${code}`) === 'true';
    setIsBotMode(botGame);
    isBotRef.current = botGame;

    if (botGame) {
      // Load pre-created game state from sessionStorage
      const saved = sessionStorage.getItem(`gameState_${code}`);
      if (saved) {
        try { setGameState(JSON.parse(saved)); } catch {}
      }
      setConnected(true);
      return; // no Supabase needed
    }

    // ── Multiplayer: Supabase Broadcast ──
    if (hostFlag) {
      let state = logic.createInitialGameState(code, id);
      state = logic.addPlayer(state, id, name);
      setGameState(state);
      saveState(code, state);
    } else {
      const saved = sessionStorage.getItem(`gameState_${code}`);
      if (saved) {
        try { setGameState(JSON.parse(saved)); } catch {}
      }
    }

    const supabase = createBrowserClient();
    const channel = supabase.channel(`game:${code}`, {
      config: { broadcast: { self: true } },
    });

    channel
      .on('broadcast', { event: 'state_update' }, ({ payload }: any) => {
        if (payload?.state) {
          setGameState(payload.state);
          saveState(code, payload.state);
        }
      })
      .on('broadcast', { event: 'join_request' }, ({ payload }: any) => {
        const s = sessionStorage.getItem(`player_${code}`);
        if (!s) return;
        const info = JSON.parse(s);
        if (!info.isHost) return;

        const current = stateRef.current;
        if (!current || current.status !== 'waiting') return;
        if (current.players.find((p: any) => p.id === payload.playerId)) {
          channel.send({ type: 'broadcast', event: 'state_update', payload: { state: current } });
          return;
        }

        try {
          const newState = logic.addPlayer(current, payload.playerId, payload.playerName);
          setGameState(newState);
          saveState(code, newState);
          channel.send({ type: 'broadcast', event: 'state_update', payload: { state: newState } });
        } catch (err) {
          console.error('Join failed:', err);
        }
      })
      .on('broadcast', { event: 'request_state' }, () => {
        const s = sessionStorage.getItem(`player_${code}`);
        if (!s) return;
        const info = JSON.parse(s);
        if (!info.isHost) return;

        const current = stateRef.current;
        if (current) {
          channel.send({ type: 'broadcast', event: 'state_update', payload: { state: current } });
        }
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);

          if (hostFlag) {
            setTimeout(() => {
              const current = stateRef.current;
              if (current) {
                channel.send({ type: 'broadcast', event: 'state_update', payload: { state: current } });
              }
            }, 500);
          } else {
            channel.send({
              type: 'broadcast',
              event: 'join_request',
              payload: { playerId: id, playerName: name },
            });
            setTimeout(() => {
              channel.send({ type: 'broadcast', event: 'request_state', payload: {} });
            }, 300);
          }
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ── Bot turn auto-play ────────────────────────────────────
  useEffect(() => {
    if (!isBotMode || !gameState || gameState.status !== 'playing') return;
    const current = gameState.players[gameState.currentPlayerIndex];
    if (!current || current.id !== BOT_ID) return;

    const delay = gameState.takiMode.active && gameState.takiMode.playerId === BOT_ID ? 500 : 900;

    const timer = setTimeout(() => {
      try {
        const newState = botPlay(gameState);
        setGameState(newState);
        saveState(code, newState);
      } catch (err) {
        console.error('Bot error:', err);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [gameState, isBotMode, code]);

  // ── Broadcast helper ──────────────────────────────────────
  const broadcast = useCallback((state: GameState) => {
    setGameState(state);
    saveState(code, state);
    if (!isBotRef.current && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'state_update',
        payload: { state },
      });
    }
  }, [code]);

  // ── Player actions ────────────────────────────────────────
  const handleStartGame = useCallback(() => {
    if (!gameState) return;
    try {
      broadcast(logic.startGame(gameState));
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  }, [gameState, broadcast]);

  const handlePlayCard = useCallback((cardId: string) => {
    if (!gameState || !playerId) return;
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;
    const card = player.cards.find(c => c.id === cardId);
    if (!card) return;

    if (card.type === 'change_color' || card.type === 'super_taki') {
      setPendingCardId(cardId);
      setShowColorPicker(true);
      return;
    }

    try {
      broadcast(logic.playCard(gameState, playerId, cardId));
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  }, [gameState, playerId, broadcast]);

  const handleChooseColor = useCallback((color: CardColor) => {
    if (!gameState || !playerId || !pendingCardId) return;
    try {
      broadcast(logic.playCard(gameState, playerId, pendingCardId, color));
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
    setShowColorPicker(false);
    setPendingCardId(null);
  }, [gameState, playerId, pendingCardId, broadcast]);

  const handleDrawCard = useCallback(() => {
    if (!gameState || !playerId) return;
    try {
      broadcast(logic.drawCard(gameState, playerId));
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  }, [gameState, playerId, broadcast]);

  const handleCloseTaki = useCallback(() => {
    if (!gameState || !playerId) return;
    try {
      broadcast(logic.closeTaki(gameState, playerId));
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  }, [gameState, playerId, broadcast]);

  // ── Loading ───────────────────────────────────────────────
  if (!gameState || !playerId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-white text-xl font-bold">Connecting to game...</div>
        <div className="text-white/50 text-sm">Room: {code}</div>
        {!connected && (
          <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full" />
        )}
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
          {error}
        </div>
      )}
      <GameBoard
        gameState={gameState}
        playerId={playerId}
        isHost={isHost}
        showColorPicker={showColorPicker}
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        onCloseTaki={handleCloseTaki}
        onStartGame={handleStartGame}
        onChooseColor={handleChooseColor}
        onCancelColorPicker={() => { setShowColorPicker(false); setPendingCardId(null); }}
      />
    </>
  );
}

function saveState(code: string, state: GameState) {
  try {
    sessionStorage.setItem(`gameState_${code}`, JSON.stringify(state));
  } catch {}
}
