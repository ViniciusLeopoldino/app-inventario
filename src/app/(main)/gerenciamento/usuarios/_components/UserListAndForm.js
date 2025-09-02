'use client'

import { useState, useTransition } from 'react'
import CreateUserForm from './CreateUserForm'
import EditUserModal from './EditUserModal'
import { deleteUser } from '@/actions'

export default function UserListAndForm({ users }) {
  // Estado para controlar o modal de criação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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
      {/* Renderização condicional dos modais */}
      {isCreateModalOpen && <CreateUserForm onClose={() => setIsCreateModalOpen(false)} />}
      {isEditModalOpen && selectedUser && <EditUserModal user={selectedUser} onClose={() => setIsEditModalOpen(false)} />}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gerenciamento de Usuários</h1>
          {/* Botão agora abre o modal de criação */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary text-white"
          >
            Cadastrar Novo Usuário
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Usuários Cadastrados</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="text-left p-4">Nome Completo</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Perfil</th>
                  <th className="text-left p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b dark:border-gray-700"
                  >
                    <td className="font-medium p-4">{user.full_name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`badge ${user.role === 'administrador' ? 'badge-primary' : 'badge-ghost'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="flex items-center space-x-2 p-4">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="btn btn-sm btn-info text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user.id, user.full_name)}
                        disabled={isPending}
                        className="btn btn-sm btn-error text-white"
                      >
                        {isPending ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          'Excluir'
                        )}
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

