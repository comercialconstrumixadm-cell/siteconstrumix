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
    // Em produção o servidor roda com HTTPS (certificado autoassinado, ver
    // server.js) mesmo na rede local da loja, então um cookie "secure" é
    // salvo normalmente pelo navegador. Em dev (`next dev`, HTTP puro) fica
    // false pra não quebrar o login local — um cookie "secure" nunca é
    // salvo pelo navegador fora de HTTPS/localhost (foi exatamente esse
    // bug, com o servidor de produção ainda em HTTP puro, que quebrou o
    // login pela rede da loja antes do HTTPS existir).
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 12 * 60 * 60,
  });
  return response;
}
