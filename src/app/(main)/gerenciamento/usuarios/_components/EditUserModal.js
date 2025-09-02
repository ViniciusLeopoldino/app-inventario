// app/(main)/gerenciamento/usuarios/_components/EditUserModal.js
'use client'

import { useActionState, useFormStatus } from 'react'
import { updateUserProfile } from '@/actions'
import { useEffect, useRef } from 'react'

const initialState = {
  message: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" aria-disabled={pending} className="btn btn-primary text-white">
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </button>
  )
}

export default function EditUserModal({ user, onClose }) {
  const [state, formAction] = useActionState(updateUserProfile, initialState)
  const dialogRef = useRef(null)

  // Controla a exibição do modal e fecha se a ação for bem-sucedida
  useEffect(() => {
    if (state?.message === 'Perfil atualizado com sucesso!') {
      onClose()
    }
  }, [state, onClose])

  return (
    <dialog ref={dialogRef} open className="modal modal-bottom sm:modal-middle">
      <div className="modal-box dark:bg-gray-800">
        <h3 className="font-bold text-lg dark:text-white">Editar Usuário</h3>
        <p className="py-2 text-sm text-gray-500 dark:text-gray-400">Editando perfil de: {user.email}</p>
        
        <form action={formAction} className="space-y-4 mt-4">
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

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">Cancelar</button>
            <SubmitButton />
          </div>

          {state?.message && (
            <p className="text-sm text-center text-green-500">{state.message}</p>
          )}
        </form>
      </div>
    </dialog>
  )
}
