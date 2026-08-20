import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, X, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAiAssistant, AI_SUGGESTIONS, AI_ROLE_LABEL } from '@/hooks/useAiAssistant';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: `${i * 120}ms`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isMessagesPage = pathname.endsWith('/messages');
  const [input, setInput] = useState('');
  const [shown, setShown] = useState(0);
  const { messages, send, reset, loading } = useAiAssistant();
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
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || last.error) return;
    if (shown >= last.content.length) return;
    const iv = setInterval(() => {
      setShown((s) => {
        if (s >= last.content.length) { clearInterval(iv); return s; }
        return s + 2;
      });
    }, 8);
    return () => clearInterval(iv);
  }, [messages, open, shown]);

  const submit = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setShown(0);
    void send(text, lang);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant' && !m.error);

  return (
    <>
      {!isMessagesPage && !open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <div className="relative">
            <span className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-40 blur-md animate-pulse" />
            <button
              onClick={() => setOpen(true)}
              aria-label="Assistant IA"
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-xl shadow-purple-500/40 transition-transform hover:scale-105 active:scale-95"
            >
              <Bot className="h-7 w-7" />
            </button>
          </div>
        </div>
      )}

      {!isMessagesPage && open && (
        <div
          className="fixed bottom-5 right-5 z-50 flex h-[min(660px,calc(100dvh-2.5rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-6 fade-in duration-300"
        >
          <div className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 px-5 py-4 text-white">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.5) 0%, transparent 40%)' }} />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <Sparkles className="h-5.5 w-5.5" />
            </div>
            <div className="relative flex-1 leading-tight">
              <p className="font-display text-[15px] font-semibold">{title}</p>
              <p className="flex items-center gap-1 text-[11px] text-white/80">
                {lang === 'ar' ? 'مساعد ذكي' : lang === 'en' ? 'AI Assistant' : 'Piloté par l’IA'}
              </p>
            </div>
            <button
              onClick={reset}
              title={t('ai.new_conversation', lang)}
              className="relative rounded-full p-2 transition-colors hover:bg-white/15 active:bg-white/25"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="relative rounded-full p-2 transition-colors hover:bg-white/15 active:bg-white/25"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-center gap-6">
                <div className="space-y-2 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/30">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-display text-lg font-semibold text-foreground">{t('ai.how_can_i_help', lang)}</p>
                  <p className="mx-auto max-w-[260px] text-xs leading-relaxed text-muted-foreground">
                    {t('ai.choose_suggestion', lang)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                    {lang === 'ar' ? 'اقتراحات' : lang === 'en' ? 'Suggestions' : 'Suggestions'}
                  </p>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setShown(0); void send(s, lang); }}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[13px] leading-snug text-foreground">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => {
                  const full = m.content;
                  if (m.role === 'user') {
                    return (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-primary/85 px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-primary-foreground shadow-sm">
                          {full}
                        </div>
                      </div>
                    );
                  }
                  const isLast = m.id === lastAssistant?.id;
                  const visible = isLast ? full.slice(0, shown) : full;
                  return (
                    <div key={m.id} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 shadow-sm">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {m.toolCalls && m.toolCalls.length > 0 && (
                          <div className="mb-1.5 flex flex-wrap gap-1">
                            {m.toolCalls.map((tc, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
                                  tc.status === 'ok'
                                    ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
                                    : 'bg-destructive/10 text-destructive ring-destructive/20'
                                }`}
                              >
                                {tc.status === 'ok' ? '✓' : '✕'} {tc.tool}
                              </span>
                            ))}
                          </div>
                        )}
                        {m.error ? (
                          <div className="rounded-2xl rounded-tl-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-[13px] text-destructive">
                            {full}
                          </div>
                        ) : (
                          <div className="rounded-2xl rounded-tl-md border border-border bg-muted/40 px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
                            {visible}
                            {isLast && shown < full.length && (
                              <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse rounded bg-primary align-middle" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-md border border-border bg-muted/40 px-4">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-border bg-background/60 p-3 backdrop-blur">
            {!loading && messages.length > 0 && suggestions.length > 0 && (
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setShown(0); void send(s, lang); }}
                    className="shrink-0 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
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
                className="min-h-[44px] max-h-32 resize-none rounded-2xl border-border bg-card text-[13px] shadow-sm focus-visible:ring-primary/30"
              />
              <Button
                size="icon"
                onClick={submit}
                disabled={loading || !input.trim()}
                className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 shadow-md shadow-purple-500/30 hover:from-indigo-600 hover:to-fuchsia-600 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}