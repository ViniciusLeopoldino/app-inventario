// app/(main)/gerenciamento/usuarios/_components/EditUserModal.js
'use client'

// AQUI ESTÁ A CORREÇÃO: Importamos cada hook da sua fonte correta.
import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { updateUserProfile } from '@/actions'

const initialState = {
  message: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" aria-disabled={pending} className="btn btn-primary text-white">
      {pending ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Salvando...
        </>
      ) : (
        'Salvar Alterações'
      )}
    </button>
  )
}

export default function EditUserModal({ user, onClose }) {
  const [state, formAction] = useActionState(updateUserProfile, initialState)
  
  useEffect(() => {
    if (state?.message === 'Perfil atualizado com sucesso!') {
      setTimeout(() => {
        onClose()
      }, 1500);
    }
  }, [state, onClose])

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        
        <h3 id="modal-title" className="font-bold text-xl dark:text-white">Editar Usuário</h3>
        <p className="py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-6">
          {user.email}
        </p>
        
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={user.id} />
          
          <div>
            <label htmlFor="full_name_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
            <input
              id="full_name_edit"
              name="full_name"
              type="text"
              required
              defaultValue={user.full_name}
              className="input input-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="role_edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil de Acesso</label>
            <select 
              id="role_edit" 
              name="role" 
              required 
              defaultValue={user.role}
              className="select select-bordered w-full mt-1 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="operacional">Operacional</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          {state?.message && (
            <div className={`text-center p-2 rounded-md bg-opacity-20 text-sm
              ${state.message.startsWith('Erro') ? 'bg-red-500 text-red-700 dark:text-red-300' : 'bg-green-500 text-green-700 dark:text-green-300'}`}>
              {state.message}
            </div>
          )}

          <div className="flex justify-end items-center space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
