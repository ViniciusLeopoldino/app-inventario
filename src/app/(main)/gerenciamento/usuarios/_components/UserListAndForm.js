// app/(main)/gerenciamento/usuarios/_components/UserListAndForm.js
'use client'

import { useState, useTransition } from 'react'
import CreateUserForm from './CreateUserForm'
import EditUserModal from './EditUserModal' // Importa o modal
import { deleteUser } from '@/actions' // Importa a ação de exclusão

export default function UserListAndForm({ users }) {
  const [isFormVisible, setIsFormVisible] = useState(false)
  // Estados para controlar o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  
  const [isPending, startTransition] = useTransition()

  const handleEditClick = (user) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (userId, userName) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      startTransition(async () => {
        const result = await deleteUser(userId)
        if (result?.error) {
          alert(`Erro ao excluir: ${result.error}`)
        } else {
          alert('Usuário excluído com sucesso!')
        }
      })
    }
  }

  return (
    <>
      {/* O modal de edição só é renderizado quando necessário */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal user={selectedUser} onClose={() => setIsEditModalOpen(false)} />
      )}

      <div className="space-y-8">
        <div className="text-right">
          {!isFormVisible && (
            <button onClick={() => setIsFormVisible(true)} className="btn btn-primary text-white">
              Cadastrar Novo Usuário
            </button>
          )}
        </div>

        {isFormVisible && (
          <div>
            <CreateUserForm />
            <div className="text-center mt-4">
              <button onClick={() => setIsFormVisible(false)} className="btn btn-ghost">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Usuários Cadastrados</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="text-gray-700 dark:text-gray-300">
                <tr>
                  <th>Nome Completo</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="font-medium">{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'administrador' ? 'badge-primary' : 'badge-ghost'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      <button 
                        onClick={() => handleEditClick(user)} 
                        className="btn btn-sm btn-outline btn-info"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user.id, user.full_name)}
                        disabled={isPending}
                        className="btn btn-sm btn-outline btn-error"
                      >
                        {isPending ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
