// app/(main)/gerenciamento/usuarios/page.js
import { createClient } from '@/app/utils/supabase/server'
// Importando o cliente base do Supabase para criar nosso cliente de admin
import { createClient as createAdminClient } from '@supabase/supabase-js'
import UserListAndForm from './_components/UserListAndForm'

export default async function GerenciamentoUsuariosPage() {
  // Cliente padrão para buscar dados respeitando as regras de segurança (RLS)
  const supabase = createClient()

  // Cliente especial de ADMIN para realizar ações de superadministrador
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // 1. Usa o cliente de ADMIN para buscar todos os usuários do sistema
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
  if (usersError) {
    console.error("Erro ao buscar usuários da autenticação:", usersError.message)
  }
  
  // 2. Usa o cliente PADRÃO para buscar os perfis (isso respeita nossa RLS)
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*')
  if (profilesError) {
    console.error("Erro ao buscar perfis:", profilesError.message)
  }
  
  // 3. Combina os dados: para cada usuário, encontramos seu perfil correspondente
  const usersWithProfiles = users?.map(user => {
    const profile = profiles?.find(p => p.id === user.id)
    return {
      ...user, // Pega todos os dados do usuário (id, email, etc.)
      role: profile?.role || 'Não definido', // Pega o perfil, ou 'Não definido' se não encontrar
      full_name: profile?.full_name || 'Não definido' // Pega o nome, ou 'Não definido'
    }
  }) || []

  return (
    // A página agora renderiza nosso componente interativo, passando os dados dos usuários
    <UserListAndForm users={usersWithProfiles} />
  )
}
