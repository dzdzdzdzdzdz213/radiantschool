import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { fetchSiteIdentity, DEFAULT_IDENTITY } from '@/lib/site-content';

const TURNSTILE_SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined;

export default function PublicContactPage() {
  const { toast } = useToast();
  const [identity, setIdentity] = useState(DEFAULT_IDENTITY);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchSiteIdentity().then((data) => { if (active) setIdentity(data); }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!TURNSTILE_SITEKEY || !turnstileRef.current) return;
    const w = window as unknown as { turnstile?: { render: (el: HTMLElement, opts: Record<string, string>) => number } };
    const render = () => {
      if (turnstileRef.current && w.turnstile) {
        widgetIdRef.current = w.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITEKEY,
          action: 'contact',
        });
      }
    };
    if (w.turnstile) {
      render();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    }
  }, []);

  const resetWidget = () => {
    const w = window as unknown as { turnstile?: { reset: (id: number) => void } };
    if (widgetIdRef.current != null && w.turnstile) w.turnstile.reset(widgetIdRef.current);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenInput = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement | null;
    const token = tokenInput?.value ?? '';
    if (!token) {
      toast('Veuillez valider la vérification anti-robot', 'error');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('contact-message', {
        body: {
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          'cf-turnstile-response': token,
        },
      });
      if (error) throw error;
      toast('Message envoyé avec succès', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
      resetWidget();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erreur lors de l\'envoi', 'error');
      resetWidget();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--primary)' }}>
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-10">Contact</h1>

        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Mail className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              <div><p className="text-sm font-medium">Email</p><p className="text-sm text-muted-foreground">{identity.email}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Phone className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              <div><p className="text-sm font-medium">Téléphone</p><p className="text-sm text-muted-foreground">{identity.phone}</p></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Envoyer un message</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nom complet</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
              </div>
              <div>
                <Label>Sujet</Label>
                <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
              </div>
              <div ref={turnstileRef} className="cf-turnstile" />
              <Button type="submit" disabled={sending}>
                {sending && <Loader className="h-4 w-4 animate-spin" />}
                <Send className="h-4 w-4" /> Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
