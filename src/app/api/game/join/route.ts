import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { playerName, code } = await request.json();
    if (!playerName || !code) {
      return NextResponse.json({ error: 'Player name and room code required' }, { status: 400 });
    }

    const playerId = crypto.randomUUID();

    return NextResponse.json({
      code: code.toUpperCase(),
      playerId,
      playerName: playerName.trim(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to join game' }, { status: 500 });
  }
}
