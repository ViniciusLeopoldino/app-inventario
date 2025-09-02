// app/(main)/layout.js

import Navbar from './components/Navbar';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      {/* AQUI ESTÁ A CORREÇÃO:
        - Trocamos 'md:pt-24' por 'sm:pt-24'.
        - O padding maior agora se aplica a partir de 640px de largura.
      */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-18 text-gray-900 dark:text-gray-100">
        {children}
      </main>
    </div>
  );
}
