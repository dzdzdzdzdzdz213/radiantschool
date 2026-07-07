import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { text, target } = await req.json();

    if (!text || !target) {
      return new Response(JSON.stringify({ error: 'Missing text or target' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!['en', 'ar'].includes(target)) {
      return new Response(JSON.stringify({ error: 'Target must be en or ar' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    // NOTE: Uses an unofficial Google Translate API endpoint (translate.googleapis.com).
    // This endpoint is undocumented, may break without notice, and does not provide
    // authentication or rate limiting. In production, replace with a paid translation
    // service such as DeepL or Google Cloud Translation.
    const source = 'fr';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url);
    const data = await res.json();

    // Validate response shape before parsing
    if (!Array.isArray(data?.[0])) {
      throw new Error('Unexpected translation API response format');
    }

    const translated = data[0].map((r: unknown[]) => r[0]).join('') || text;

    return new Response(JSON.stringify({ translated, source: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Translation failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});