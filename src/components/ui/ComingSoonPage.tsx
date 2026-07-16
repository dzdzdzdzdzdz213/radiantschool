export default function ComingSoonPage({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-4xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold mb-2">{label || 'Page en cours de développement'}</h2>
      <p className="text-muted-foreground">Cette fonctionnalité sera bientôt disponible.</p>
    </div>
  );
}
