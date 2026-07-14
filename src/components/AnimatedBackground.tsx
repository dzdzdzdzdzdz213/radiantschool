const ORBS = [
  { size: 500, color: 'var(--primary)', opacity: 0.12 },
  { size: 400, color: 'var(--accent)', opacity: 0.1 },
  { size: 350, color: '#00cec9', opacity: 0.08 },
];

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {ORBS.map((orb, i) => {
        const animName = `orbAnim${i}`;
        const x1 = [-20, 10, -30, -10][i] ?? 0;
        const y1 = [-20, -5, 10, -15][i] ?? 0;
        const x2 = [60, 50, 70, 55][i] ?? 50;
        const y2 = [70, 55, 60, 75][i] ?? 60;
        return (
          <div key={i}>
            <style>{`
              @keyframes ${animName} {
                0%, 100% { transform: translate(${x1}%, ${y1}%); }
                50% { transform: translate(${x2}%, ${y2}%); }
              }
            `}</style>
            <div
              style={{
                width: orb.size,
                height: orb.size,
                background: orb.color,
                opacity: orb.opacity,
                borderRadius: '50%',
                position: 'absolute',
                filter: 'blur(60px)',
                willChange: 'transform',
                animation: `${animName} 30s ease-in-out infinite`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
