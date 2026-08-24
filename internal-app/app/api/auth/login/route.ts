import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (typeof password !== 'string' || !checkPassword(password)) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    // Sempre roda em HTTP puro, na rede local da loja (sem TLS) — um
    // cookie "secure" nunca é salvo pelo navegador fora de HTTPS/localhost,
    // então marcar isso por NODE_ENV quebrava o login ao acessar por IP
    // (ex: http://192.168.0.200:3000) em vez de localhost.
    secure: false,
    path: '/',
    maxAge: 12 * 60 * 60,
  });
  return response;
}
