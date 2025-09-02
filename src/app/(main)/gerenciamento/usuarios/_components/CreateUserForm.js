// app/(main)/gerenciamento/usuarios/_components/CreateUserForm.js
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createUser } from '@/actions'

const initialState = {
  message: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      aria-disabled={pending}
      className="btn btn-primary w-full text-white"
    >
      {pending ? (
        <>
          <span className="loading loading-spinner"></span>
          Cadastrando...
        </>
      ) : (
        'Cadastrar Novo Usuário'
      )}
    </button>
  )
}

export default function CreateUserForm() {
  const [state, formAction] = useActionState(createUser, initialState)

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Cadastrar Novo Usuário</h1>
      
      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            className="input input-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha Provisória</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="input input-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil de Acesso</label>
          <select id="role" name="role" required className="select select-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600">
            <option value="operacional">Operacional</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <SubmitButton />
        {state?.message && (
          <p aria-live="polite" className="text-sm text-red-500 text-center" role="status">
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
