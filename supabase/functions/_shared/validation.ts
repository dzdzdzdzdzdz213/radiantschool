import { z } from 'https://esm.sh/zod@4.4.3';
import { jsonError } from './auth.ts';

/**
 * Parses the JSON body of a request and validates it against a Zod schema.
 * Returns a 400 response (with a message the web client can display) on
 * malformed JSON or schema violations.
 */
export async function validateRequest<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, response: jsonError(400, 'Invalid JSON body') };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (i) => `${i.path.length ? i.path.join('.') : 'body'}: ${i.message}`,
    );
    return {
      ok: false,
      response: jsonError(400, `Validation failed: ${issues.join('; ')}`),
    };
  }

  return { ok: true, data: parsed.data };
}
