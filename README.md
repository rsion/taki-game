# 🎴 Taki Online

Play the classic Israeli card game **Taki** (טאקי) online with friends!

## Setup

### 1. Supabase

Create a [Supabase](https://supabase.com) project and run the SQL from `supabase/setup.sql` in the SQL Editor.

Set these environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Run locally

```bash
npm install
npm run dev
```

### 3. Deploy to Vercel

Push to GitHub and import in [Vercel](https://vercel.com). Add the environment variables above in project settings.

## How to Play

1. **Create a game** — get a 4-letter room code
2. **Share the code** with friends (2-4 players)
3. **Host starts** when everyone's joined
4. **Play cards** matching by color or number
5. **First to empty their hand wins!**

### Special Cards
- **TAKI** — play multiple same-color cards in a row
- **Super TAKI** — wild Taki (choose any color)
- **Plus (+)** — take another turn
- **Stop (🚫)** — skip next player
- **Change Direction (🔄)** — reverse play order
- **+2** — next player draws 2 (stackable!)
- **Change Color (🎨)** — pick a new color

## Tech Stack

- **Next.js 14** + TypeScript + Tailwind CSS
- **Supabase** Realtime Broadcast for multiplayer
- **Vercel** for deployment
