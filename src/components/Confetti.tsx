'use client';

import { useEffect, useState } from 'react';

const TAKI_COLORS = ['#E32636', '#1472B8', '#39A845', '#FDD835', '#FF6F00', '#9C27B0'];
const PARTICLE_COUNT = 80;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  shape: 'rect' | 'circle';
  drift: number;
}

function makeParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 30,
      color: TAKI_COLORS[Math.floor(Math.random() * TAKI_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      drift: (Math.random() - 0.5) * 60,
    });
  }
  return particles;
}

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setParticles(makeParticles());
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!visible || particles.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.shape === 'circle' ? p.size : p.size * 0.6,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            opacity: 0.9,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
