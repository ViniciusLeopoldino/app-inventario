// src/actions.js
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Função para criar um novo usuário (Admin)
export async function createUser(prevState, formData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')
  const fullName = formData.get('full_name')

  if (!email || !password || !role || !fullName) {
    return { message: 'Por favor, preencha todos os campos.' }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    app_metadata: { role: role },
    user_metadata: { full_name: fullName }
  })

  if (error) {
    console.error('Erro ao criar usuário:', error)
    return { message: `Erro: ${error.message}` }
  }

  revalidatePath('/gerenciamento/usuarios')
  redirect('/gerenciamento/usuarios?message=Usuário criado com sucesso!')
}

// Função para fazer login com email e senha
export async function signIn(prevState, formData) {
  // Para login, usamos o cliente de servidor padrão que gerencia cookies.
  const supabase = require('@/app/utils/supabase/server').createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    return { message: 'Email e senha são obrigatórios.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Erro de login:', error)
    return { message: 'Credenciais inválidas. Verifique o email e a senha.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}


// Função para atualizar o perfil de um usuário (Admin)
export async function updateUserProfile(prevState, formData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const id = formData.get('id')
  const fullName = formData.get('full_name')
  const role = formData.get('role')

  if (!id || !fullName || !role) {
    return { message: 'Dados insuficientes para atualizar.' }
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName, role: role })
    .eq('id', id)

  if (error) {
    console.error("Erro ao atualizar perfil:", error)
    return { message: `Erro: ${error.message}` }
  }

  revalidatePath('/gerenciamento/usuarios')
  return { message: 'Perfil atualizado com sucesso!' }
}


// Função para excluir um usuário (Admin)
export async function deleteUser(userId) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  if (!userId) {
    return { error: 'ID do usuário não fornecido.' }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    console.error("Erro ao excluir usuário:", error)
    return { error: error.message }
  }

  revalidatePath('/gerenciamento/usuarios')
  return { success: true }
}
