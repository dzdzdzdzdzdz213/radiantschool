import SubjectManager from '@/features/admin/cms/SubjectManager';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function AssistantSubjectsPage() {
  const { lang } = useLang();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('subjects.title', lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('subjects.subtitle', lang)}</p>
      </div>
      <SubjectManager />
    </div>
  );
}