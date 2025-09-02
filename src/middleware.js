// middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) { req.cookies.set({ name, value, ...options }) },
        remove(name, options) { req.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Se o usuário não está logado e tenta acessar qualquer página protegida (que não seja /login)
  if (!user && req.nextUrl.pathname !== '/login') {
    // Redireciona para a página de login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto as de sistema (_next/static, _next/image, favicon.ico)
     * e a nossa rota de callback de autenticação.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}