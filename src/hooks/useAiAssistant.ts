import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: { tool: string; status: string }[];
  error?: boolean;
}

export interface AiResponse {
  reply: string;
  conversation_id: string;
  tool_calls: { tool: string; status: string }[];
  tokens: { in: number; out: number };
  latency_ms: number;
}

export function useAiAssistant() {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (message: string, lang: string = 'fr') => {
    const text = message.trim();
    if (!text || loading) return;

    const userMsg: AiMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error('No session');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text,
            conversation_id: conversationId,
            lang,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: AiResponse = await res.json();
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply,
          toolCalls: data.tool_calls,
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: msg, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, conversationId]);

  const reset = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return { messages, send, reset, loading, error };
}

export const AI_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  admin: {
    fr: [
      'Aperçu de l\u2019école : élèves, revenus, impayés',
      'Créer un cours de Mathématiques pour 1AM, 25 places, 4000 DZD',
      'Analyse des revenus par mois et par cours',
      'Quels cours sont presque pleins ?',
      'Élèves absents plus de 3 fois ce mois',
    ],
    en: [
      'School overview: students, revenue, unpaid',
      'Create a Math course for 1AM, 25 seats, 4000 DZD',
      'Revenue analysis by month and course',
      'Which courses are nearly full?',
      'Students absent more than 3 times this month',
    ],
    ar: [
      'نظرة عامة على المدرسة: الطلاب، الإيرادات، غير المدفوع',
      'إنشاء دورة رياضيات لـ 1AM، 25 مقعداً، 4000 دج',
      'تحليل الإيرادات حسب الشهر والدورة',
      'ما هي الدورات الممتلئة تقريباً؟',
      'الطلاب الغائبين أكثر من 3 مرات هذا الشهر',
    ],
  },
  assistant: {
    fr: ['Aperçu de l\u2019école aujourd\u2019hui', 'Créer un nouveau cours', 'Factures en retard à relancer', 'Chercher un élève'],
    en: ['School overview today', 'Create a new course', 'Overdue invoices to follow up', 'Search for a student'],
    ar: ['نظرة عامة على المدرسة اليوم', 'إنشاء دورة جديدة', 'فواتير متأخرة للمتابعة', 'البحث عن طالب'],
  },
  teacher: {
    fr: ['Mes élèves et leur assiduité', 'Performance de mes cours'],
    en: ['My students and their attendance', 'My course performance'],
    ar: ['طلابي ومواظبتهم', 'أداء دوراتي'],
  },
  student: {
    fr: ['Ma progression : cours, présences, factures', 'Mes prochains paiements'],
    en: ['My progress: courses, attendance, invoices', 'My upcoming payments'],
    ar: ['تقدمي: الدورات، الحضور، الفواتير', 'مدفوعاتي القادمة'],
  },
  parent: {
    fr: ['Comment fonctionne la plateforme ?'],
    en: ['How does the platform work?'],
    ar: ['كيف تعمل المنصة؟'],
  },
};

export const AI_ROLE_LABEL: Record<string, Record<string, string>> = {
  admin: { fr: 'Radiant AI — Assistant Direction', en: 'Radiant AI — Admin Assistant', ar: 'راديانت AI — مساعد الإدارة' },
  assistant: { fr: 'Radiant AI — Assistant Opérations', en: 'Radiant AI — Operations Assistant', ar: 'راديانت AI — مساعد العمليات' },
  teacher: { fr: 'Radiant AI — Assistant Enseignant', en: 'Radiant AI — Teacher Assistant', ar: 'راديانت AI — مساعد المعلم' },
  student: { fr: 'Radiant AI — Assistant Élève', en: 'Radiant AI — Student Assistant', ar: 'راديانت AI — مساعد الطالب' },
  parent: { fr: 'Radiant AI — Assistant Parent', en: 'Radiant AI — Parent Assistant', ar: 'راديانت AI — مساعد ولي الأمر' },
};
