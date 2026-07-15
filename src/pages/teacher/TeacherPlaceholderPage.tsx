import { useLang } from '@/contexts/LangContext';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export default function TeacherPlaceholderPage() {
  const { lang } = useLang();
  const path = useLocation().pathname;
  const name = path.split('/').pop()?.replace(/-/g, ' ') ?? '';

  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="text-4xl mb-4 opacity-20">⚡</div>
        <h2 className="text-lg font-semibold mb-1 capitalize">{name}</h2>
        <p className="text-sm text-muted-foreground">Fonctionnalité disponible prochainement</p>
      </CardContent>
    </Card>
  );
}
