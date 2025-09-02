// app/(main)/components/LogoutButton.js
'use client'

import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'

  

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    // Adiciona um refresh para garantir que o layout do servidor seja atualizado
    router.refresh() 
  }

  return (
    <button 
      onClick={handleLogout}
      // ESTILOS ATUALIZADOS AQUI:
      // Removemos todo o fundo e borda, deixando-o como texto.
      // Adicionamos o hover para a cor vermelha e uma transição suave.
      className="hover:text-red-500 transition-colors duration-200 cursor-pointer"
    >
      Sair
    </button>
  )
}
