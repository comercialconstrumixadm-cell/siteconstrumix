import { NextRequest, NextResponse } from 'next/server';

/**
 * Protege /gestao/* com senha (módulo restrito a gestores). O módulo
 * /orcamento fica aberto, sem login, para uso dos vendedores no balcão.
 *
 * A validação criptográfica do token acontece nas rotas de servidor
 * (lib/auth.ts) porque `crypto` completo não roda no runtime de Edge do
 * middleware; aqui só checamos a presença do cookie de sessão.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/gestao/login')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/gestao')) {
    const session = request.cookies.get('gestao_session');
    if (!session) {
      const loginUrl = new URL('/gestao/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/gestao/:path*'],
};
