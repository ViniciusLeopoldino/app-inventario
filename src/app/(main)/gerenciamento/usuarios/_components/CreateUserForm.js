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
    <button type="submit" aria-disabled={pending} className="btn btn-primary w-full text-white">
      {pending ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Cadastrando...
        </>
      ) : (
        'Cadastrar Usuário'
      )}
    </button>
  )
}

// O componente agora recebe 'onClose' para poder ser fechado
export default function CreateUserForm({ onClose }) {
  const [state, formAction] = useActionState(createUser, initialState)

  // Efeito para fechar o modal e limpar o formulário após o sucesso
  useEffect(() => {
    if (state?.message === 'Usuário criado com sucesso!') {
      setTimeout(() => {
        onClose();
      }, 1500); // Fecha após 1.5 segundos
    }
  }, [state, onClose]);

  return (
    // Estrutura de modal idêntica à do EditUserModal
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 flex items-center justify-center p-4"
      aria-labelledby="create-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        
        <h3 id="create-modal-title" className="font-bold text-xl dark:text-white">Cadastrar Novo Usuário</h3>
        <p className="py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-6">
          O novo usuário receberá um email para definir a senha.
        </p>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="full_name_create" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
            <input id="full_name_create" name="full_name" type="text" required className="input input-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="email_create" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input id="email_create" name="email" type="email" required className="input input-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="role_create" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil de Acesso</label>
            <select id="role_create" name="role" required defaultValue="operacional" className="select select-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600">
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

