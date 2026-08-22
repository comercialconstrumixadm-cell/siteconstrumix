import crypto from 'node:crypto';

export const SESSION_COOKIE = 'gestao_session';

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET não configurado (ver .env.example).');
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

/** Gera o valor do cookie de sessão do módulo Gestão. */
export function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

/** Valida o cookie de sessão (assinatura + expiração de 12h). */
export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, signature] = token.split('.');
  if (!issuedAt || !signature) return false;

  const expected = Buffer.from(sign(issuedAt));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return false;

  const ageMs = Date.now() - Number(issuedAt);
  const twelveHoursMs = 12 * 60 * 60 * 1000;
  return ageMs >= 0 && ageMs < twelveHoursMs;
}

/** Usa em Server Components/route handlers de /gestao para exigir sessão válida. */
export async function requireSession(): Promise<boolean> {
  const { cookies } = await import('next/headers');
  const token = cookies().get(SESSION_COOKIE)?.value;
  return isValidSessionToken(token);
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.GESTAO_PASSWORD;
  if (!expected) {
    throw new Error('GESTAO_PASSWORD não configurado (ver .env.example).');
  }
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
