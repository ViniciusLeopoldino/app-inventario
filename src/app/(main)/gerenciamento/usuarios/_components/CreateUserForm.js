'use client'

import { useActionState, useEffect } from 'react'
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
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer w-full disabled:opacity-50"
    >
      {pending ? 'Cadastrando...' : 'Cadastrar Usuário'}
    </button>
  )
}

export default function CreateUserForm({ onClose }) {
  const [state, formAction] = useActionState(createUser, initialState)

  useEffect(() => {
    if (state?.message === 'Usuário criado com sucesso!') {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [state, onClose]);

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 flex items-center justify-center p-4"
      aria-labelledby="create-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h3 id="create-modal-title" className="font-bold text-xl text-center dark:text-white">Cadastrar Novo Usuário</h3>
        <p className="py-2 text-sm text-center text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-6">
          O novo usuário receberá um email para definir a senha.
        </p>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="full_name_create" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
            <input 
              id="full_name_create" 
              name="full_name" 
              type="text" 
              required 
              className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="email_create" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input 
              id="email_create" 
              name="email" 
              type="email" 
              required 
              className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="role_create" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil de Acesso</label>
            <select 
              id="role_create" 
              name="role" 
              required 
              defaultValue="operacional" 
              className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="operacional">Operacional</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          
          <div className="pt-4">
            <SubmitButton />
          </div>

          {state?.message && (
            <div className={`text-center p-2 rounded-md bg-opacity-20 text-sm
              ${state.message.startsWith('Erro') ? 'bg-red-500 text-red-700 dark:text-red-300' : 'bg-green-500 text-green-700 dark:text-green-300'}`}>
              {state.message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
