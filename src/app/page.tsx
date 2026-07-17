'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim()) { setError('Enter your name'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create game');
      // Store player info in sessionStorage
      sessionStorage.setItem(`player_${data.code}`, JSON.stringify({
        id: data.playerId,
        name: name.trim(),
        isHost: true,
      }));
      router.push(`/game/${data.code}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) { setError('Enter your name'); return; }
    if (!roomCode.trim()) { setError('Enter room code'); return; }
    setLoading(true);
    setError('');
    try {
      const code = roomCode.trim().toUpperCase();
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join game');
      sessionStorage.setItem(`player_${code}`, JSON.stringify({
        id: data.playerId,
        name: name.trim(),
        isHost: false,
      }));
      router.push(`/game/${code}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white mb-2 tracking-tight">
            <span className="text-red-500">T</span>
            <span className="text-blue-500">A</span>
            <span className="text-green-400">K</span>
            <span className="text-yellow-400">I</span>
          </h1>
          <p className="text-2xl text-white/70 font-bold">טאקי</p>
          <p className="text-white/50 mt-1">Play online with friends</p>
        </div>

        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              🎮 Create Game
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
            >
              🚪 Join Game
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-lg"
                autoFocus
              />
            </div>

            {mode === 'join' && (
              <div>
                <label className="block text-white/70 text-sm mb-1">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABCD"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 text-2xl text-center tracking-[0.5em] font-mono uppercase"
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={mode === 'create' ? handleCreate : handleJoin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Loading...' : mode === 'create' ? 'Create Room' : 'Join Room'}
            </button>

            <button
              onClick={() => { setMode('menu'); setError(''); }}
              className="w-full py-2 text-white/50 hover:text-white/80 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
