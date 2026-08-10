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

  const send = useCallback(async (message: string) => {
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

export const AI_SUGGESTIONS: Record<string, string[]> = {
  admin: [
    'Aperçu de l\u2019école : élèves, revenus, impayés',
    'Analyse des revenus par mois et par cours',
    'Quels cours sont presque pleins ?',
    'Élèves absents plus de 3 fois ce mois',
  ],
  assistant: [
    'Aperçu de l\u2019école aujourd\u2019hui',
    'Factures en retard à relancer',
    'Chercher un élève',
  ],
  teacher: [
    'Mes élèves et leur assiduité',
    'Performance de mes cours',
  ],
  student: [
    'Ma progression : cours, présences, factures',
    'Mes prochains paiements',
  ],
  parent: [
    'Comment fonctionne la plateforme ?',
  ],
};

export const AI_ROLE_LABEL: Record<string, string> = {
  admin: 'Radiant AI — Assistant Direction',
  assistant: 'Radiant AI — Assistant Opérations',
  teacher: 'Radiant AI — Assistant Enseignant',
  student: 'Radiant AI — Assistant Élève',
  parent: 'Radiant AI — Assistant Parent',
};
