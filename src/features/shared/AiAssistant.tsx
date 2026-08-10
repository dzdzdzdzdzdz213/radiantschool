import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Sparkles, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAiAssistant, AI_SUGGESTIONS, AI_ROLE_LABEL } from '@/hooks/useAiAssistant';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, send, reset, loading, error } = useAiAssistant();
  const { profile } = useAuth();
  const { lang } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);

  const role = profile?.role ?? 'admin';
  const suggestions = (AI_SUGGESTIONS[role] as Record<string, string[]> | undefined)?.[lang] ?? [];
  const title = (AI_ROLE_LABEL[role] as Record<string, string> | undefined)?.[lang] ?? 'Radiant AI';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const submit = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    void send(text, lang);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Assistant IA"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-tight">{title}</p>
              <p className="text-xs text-white/80 leading-tight">{t('ai.gemini_driven', lang)}</p>
            </div>
            <button
              onClick={reset}
              title={t('ai.new_conversation', lang)}
              className="rounded-full p-1.5 hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-center gap-4">
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium text-foreground">{t('ai.how_can_i_help', lang)}</p>
                  <p className="text-xs text-muted-foreground">{t('ai.choose_suggestion', lang)}</p>
                </div>
                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => void send(s, lang)}
                      className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : m.error
                          ? 'rounded-bl-sm border border-destructive/40 bg-destructive/5 text-foreground'
                          : 'rounded-bl-sm border border-border bg-muted/50 text-foreground'
                    }`}
                  >
                    {m.role === 'assistant' && !m.error && m.toolCalls && m.toolCalls.length > 0 && (
                      <div className="mb-1.5 flex flex-wrap gap-1">
                        {m.toolCalls.map((tool, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              tool.status === 'ok'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {tool.status === 'ok' ? '✓' : '✕'} {tool.tool}
                          </span>
                        ))}
                      </div>
                    )}
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('ai.thinking', lang)}
                </div>
              </div>
            )}
            {!loading && error && messages.length === 1 && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive">
                  {t('ai.no_session', lang)}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            {!loading && messages.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {suggestions.slice(0, 2).map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s, lang)}
                    className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ai.ask_question', lang)}
                rows={1}
                className="min-h-[40px] max-h-32 resize-none"
              />
              <Button
                size="icon"
                onClick={submit}
                disabled={loading || !input.trim()}
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
              <AlertCircle className="h-3 w-3" /> {t('ai.real_data', lang)}
            </p>
          </div>
        </div>
      )}
    </>
  );
}