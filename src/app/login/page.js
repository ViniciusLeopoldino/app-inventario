// app/login/page.js
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { signIn } from '@/actions' // Importa a nova ação de login

const initialState = {
  message: null,
}

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" aria-disabled={pending} className="btn btn-primary w-full text-white">
      {pending ? 'Entrando...' : 'Entrar'}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(signIn, initialState)

  // A lógica de login com GitHub continua a mesma
  const handleGitHubLogin = async () => {
    const supabase = require('@/app/utils/supabase/client').createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
          Acessar o Sistema
        </h1>
        
        <form action={formAction} className="space-y-6 mt-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input input-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input input-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <LoginButton />

          {state?.message && (
            <p aria-live="polite" className="text-sm text-red-500 text-center" role="status">
              {state.message}
            </p>
          )}
        </form>

        <div className="divider dark:text-gray-400 my-6">OU</div>

        <button 
          onClick={handleGitHubLogin} 
          className="btn btn-outline w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Entrar com GitHub
        </button>
      </div>
    </div>
  )
}
