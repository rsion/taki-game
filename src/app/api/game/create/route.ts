import { NextResponse } from 'next/server';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const { playerName } = await request.json();
    if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    const code = generateRoomCode();
    const playerId = crypto.randomUUID();

    return NextResponse.json({
      code,
      playerId,
      playerName: playerName.trim(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create game' }, { status: 500 });
  }
}
