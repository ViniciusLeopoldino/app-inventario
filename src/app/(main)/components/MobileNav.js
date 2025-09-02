// app/(main)/components/MobileNav.js
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

// O ícone do menu hambúrguer (três linhas)
const HamburgerIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// O ícone de fechar (X)
const CloseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function MobileNav({ user, profile }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button onClick={toggleMenu} className="text-white focus:outline-none z-50 relative">
        {isOpen ? <CloseIcon /> : <HamburgerIcon />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-95 z-40 flex flex-col justify-between p-8"
          onClick={toggleMenu}
        >
          <div className="flex flex-col items-center space-y-8 mt-16">
            <Link href="/" onClick={toggleMenu} className="text-3xl text-gray-200 hover:text-blue-400">Início</Link>
            <Link href="/inventario/novo" onClick={toggleMenu} className="text-3xl text-gray-200 hover:text-blue-400">Novo Inventário</Link>
            <Link href="/inventario/andamento" onClick={toggleMenu} className="text-3xl text-gray-200 hover:text-blue-400">Em Andamento</Link>
            <Link href="/inventario/historico" onClick={toggleMenu} className="text-3xl text-gray-200 hover:text-blue-400">Histórico</Link>
            
            {profile?.role === 'administrador' && (
              <Link href="/gerenciamento/usuarios" onClick={toggleMenu} className="text-3xl text-gray-200 hover:text-blue-400">
                Usuários
              </Link>
            )}
          </div>
          
          <div className="w-full text-center">
            {user ? (
              <div className="flex flex-col items-center space-y-4">
                <span className="text-sm text-gray-400">{user.email}</span>
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login" onClick={toggleMenu}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
