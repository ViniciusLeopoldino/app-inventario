'use client'

import { useState, useTransition } from 'react'
import CreateUserForm from './CreateUserForm'
import EditUserModal from './EditUserModal'
import { deleteUser } from '@/actions'

export default function UserListAndForm({ users }) {
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
      {isCreateModalOpen && <CreateUserForm onClose={() => setIsCreateModalOpen(false)} />}
      {isEditModalOpen && selectedUser && <EditUserModal user={selectedUser} onClose={() => setIsEditModalOpen(false)} />}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gerenciamento de Usuários</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Cadastrar Novo Usuário
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Usuários Cadastrados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-700 dark:text-gray-300">
                <tr className="border-b dark:border-gray-700">
                  <th className="p-4 text-center">Nome Completo</th>
                  <th className="p-4 text-center">Email</th>
                  <th className="p-4 text-center">Perfil</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b dark:border-gray-700"
                  >
                    <td className="font-medium p-4 text-center">{user.full_name}</td>
                    <td className="p-4 text-center">{user.email}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'administrador' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="flex items-center justify-center space-x-2 p-4">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors duration-200 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user.id, user.full_name)}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? '...' : 'Excluir'}
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

