const ORBS = [
  { size: 700, color: 'var(--primary)', opacity: 0.1, name: 'orb1' },
  { size: 600, color: 'var(--accent)', opacity: 0.08, name: 'orb2' },
  { size: 500, color: '#00cec9', opacity: 0.06, name: 'orb3' },
];

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes orb1Anim {
          0%, 100% { transform: translate(-10%, -15%); }
          25% { transform: translate(5%, -5%); }
          50% { transform: translate(-15%, 5%); }
          75% { transform: translate(-5%, -10%); }
        }
        @keyframes orb2Anim {
          0%, 100% { transform: translate(70%, 80%); }
          25% { transform: translate(60%, 65%); }
          50% { transform: translate(80%, 70%); }
          75% { transform: translate(65%, 85%); }
        }
        @keyframes orb3Anim {
          0%, 100% { transform: translate(30%, 20%); }
          25% { transform: translate(40%, 30%); }
          50% { transform: translate(25%, 15%); }
          75% { transform: translate(35%, 25%); }
        }
        .orb1 { animation: orb1Anim 25s ease-in-out infinite; will-change: transform; }
        .orb2 { animation: orb2Anim 30s ease-in-out infinite; will-change: transform; }
        .orb3 { animation: orb3Anim 22s ease-in-out infinite; will-change: transform; }
      `}</style>
      {ORBS.map((orb) => (
        <div
          key={orb.name}
          className={`absolute rounded-full ${orb.name}`}
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            opacity: orb.opacity,
            filter: 'blur(120px)',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
