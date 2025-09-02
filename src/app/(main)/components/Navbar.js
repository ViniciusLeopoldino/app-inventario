// app/(main)/components/Navbar.js
import Link from 'next/link'
import { createClient } from '@/app/utils/supabase/server'
import LogoutButton from './LogoutButton'
import MobileNav from './MobileNav'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Busca o perfil do usuário logado na nossa tabela 'profiles'
  let userProfile = null
  if (user) {
    // Esta busca agora deve funcionar corretamente com as novas regras de segurança
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white shadow-md z-30">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Inv. App
        </Link>

        {/* Menu para Telas Grandes (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-blue-400 transition-colors duration-200">
            Início
          </Link>
          <Link href="/inventario/novo" className="hover:text-blue-400 transition-colors duration-200">
            Novo Inventário
          </Link>
          <Link href="/inventario/andamento" className="hover:text-blue-400 transition-colors duration-200">
            Em Andamento
          </Link>
          <Link href="/inventario/historico" className="hover:text-blue-400 transition-colors duration-200">
            Histórico
          </Link>
          
          {/* Link condicional para administradores */}
          {userProfile?.role === 'administrador' && (
            <Link href="/gerenciamento/usuarios" className="hover:text-blue-400 transition-colors duration-200">
              Usuários
            </Link>
          )}
        </div>

        {/* Seção do Usuário para Telas Grandes (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-300">Olá, {user.email}</span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* Menu para Telas Pequenas (Mobile) */}
        <MobileNav user={user} profile={userProfile} />
      </div>
    </nav>
  )
}
