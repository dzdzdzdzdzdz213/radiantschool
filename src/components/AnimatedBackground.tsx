export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(52% 40% at 12% -8%, rgba(14, 107, 92, 0.05), transparent 62%), radial-gradient(40% 34% at 96% 108%, rgba(192, 86, 33, 0.05), transparent 60%)',
        }}
      />
    </div>
  );
}