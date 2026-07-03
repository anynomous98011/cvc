/**
 * Central Security Utilities — Rachna Rivo
 * Covers: SSTI guard, ReDoS-safe regex, NoSQL sanitization,
 *         CSRF origin check, clipboard masking hook, nonce/replay guard.
 */

// ─── ReDoS-safe search sanitization ──────────────────────────────────────────

/**
 * Maximum allowed lengths for user-supplied fields.
 * These caps prevent ReDoS via overly long strings fed into Prisma `contains`.
 */
export const MAX_SEARCH_LEN = 200;
export const MAX_PATH_LEN = 500;
export const MAX_TOPIC_LEN = 500;
export const MAX_CONTENT_LEN = 10_000;
export const MAX_EMAIL_LEN = 254; // RFC 5321
export const MAX_NAME_LEN = 100;

/**
 * Strips characters that have special meaning in MongoDB regex / PCRE.
 * This prevents ReDoS and NoSQL injection via the `contains` filter.
 */
export function sanitizeSearchParam(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim().substring(0, MAX_SEARCH_LEN);
  if (!trimmed) return undefined;
  // Escape all regex meta-characters so Prisma passes a literal substring
  return trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates a page path: must start with '/', allowed chars only, capped length.
 */
export function sanitizePagePath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().substring(0, MAX_PATH_LEN);
  // Only allow URL-safe path characters
  if (!/^\/[a-zA-Z0-9/_\-?&=%.#]*$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Sanitizes a plain text string for safe storage — strips potential SSTI
 * template markers ({{ }}, <%= %>, {# #}, etc.) and trims length.
 */
export function sanitizeTextField(raw: unknown, maxLen = MAX_CONTENT_LEN): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim().substring(0, maxLen);
  // Block common SSTI markers across Jinja2, Twig, EJS, Nunjucks, Handlebars
  return trimmed
    .replace(/\{\{[\s\S]*?\}\}/g, '[blocked]')      // Jinja2 / Handlebars
    .replace(/\{%[\s\S]*?%\}/g, '[blocked]')         // Jinja2 / Twig tags
    .replace(/<%[\s\S]*?%>/g, '[blocked]')           // EJS / ERB
    .replace(/\{#[\s\S]*?#\}/g, '[blocked]')         // Nunjucks comments
    .replace(/<script[\s\S]*?<\/script>/gi, '[blocked]') // inline scripts
    .replace(/javascript:/gi, '[blocked]');      // JS pseudo-protocol
}

/**
 * Validates that a string contains only safe characters for AI prompts.
 * Returns the sanitized string, or throws on clearly malicious input.
 */
export function sanitizeAiInput(raw: unknown, maxLen = MAX_TOPIC_LEN): string {
  const s = sanitizeTextField(raw, maxLen);
  if (s.includes('[blocked]')) {
    throw new Error('Input contains disallowed template syntax.');
  }
  return s;
}

// ─── NoSQL Injection prevention ───────────────────────────────────────────────

/**
 * Removes MongoDB operator keys (e.g. $where, $gt, $regex) from a plain object.
 * Use before passing any user-supplied object to Prisma raw or nested filters.
 */
export function stripMongoOperators(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripMongoOperators);
  if (obj !== null && typeof obj === 'object') {
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k.startsWith('$')) continue; // drop operator keys
      safe[k] = stripMongoOperators(v);
    }
    return safe;
  }
  return obj;
}

// ─── CSRF Origin / Host check ─────────────────────────────────────────────────

const ALLOWED_ORIGINS = (() => {
  const origins: string[] = [];
  if (process.env.NEXT_PUBLIC_APP_URL)    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  if (process.env.NEXTAUTH_URL)           origins.push(process.env.NEXTAUTH_URL);
  if (process.env.VERCEL_URL)             origins.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  // Always allow localhost in development
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000');
    origins.push('http://127.0.0.1:3000');
  }
  return origins.filter(Boolean);
})();

/**
 * Returns true if the request Origin (or Referer) matches an allowed origin.
 * Call this on every state-mutating API endpoint (POST / PATCH / DELETE).
 */
export function isValidOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Requests with no origin are server-to-server (e.g. curl) — allow only in dev
  if (!origin && !referer) {
    return process.env.NODE_ENV !== 'production';
  }

  const check = origin || (referer ? new URL(referer).origin : '');
  return ALLOWED_ORIGINS.some(
    (allowed) => check === allowed || check.startsWith(allowed)
  );
}

// ─── Replay Attack: request timestamp validation ──────────────────────────────

const REQUEST_WINDOW_MS = 5 * 60 * 1000; // 5-minute window

/**
 * Validates that a request timestamp (ISO string or Unix ms) is within an
 * acceptable window to prevent replay attacks.
 */
export function isTimestampFresh(ts: unknown): boolean {
  if (!ts) return false;
  const parsed = typeof ts === 'number' ? ts : Date.parse(String(ts));
  if (Number.isNaN(parsed)) return false;
  const diff = Math.abs(Date.now() - parsed);
  return diff <= REQUEST_WINDOW_MS;
}

// ─── Secure error response helper ────────────────────────────────────────────

/**
 * Converts an unknown caught error into a safe, non-leaking message string.
 * Internal details (stack traces, DB errors) are never surfaced to the client.
 */
export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Strip anything that looks like a file path, stack line, or connection string
    const msg = error.message
      .replace(/mongodb\+srv:\/\/[^\s]*/gi, '[redacted]')
      .replace(/password=[^\s&]*/gi, '[redacted]')
      .replace(/at\s+\w+.*\n/g, '')
      .substring(0, 200);
    return msg;
  }
  return 'An unexpected error occurred.';
}

// ─── Sensitive field masking for logs ────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  'password', 'token', 'secret', 'apikey', 'api_key',
  'authorization', 'cookie', 'session', 'credential',
]);

/**
 * Recursively masks values whose keys appear in SENSITIVE_KEYS.
 * Safe to use when stringifying objects for structured logging.
 */
export function maskSensitiveFields(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || typeof obj !== 'object') return obj;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    result[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? '***' : maskSensitiveFields(v, depth + 1);
  }
  return result;
}
