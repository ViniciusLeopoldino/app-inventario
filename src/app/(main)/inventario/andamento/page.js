// app/(main)/inventario/andamento/page.js
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';

const supabase = createClient();

export default function InventariosEmAndamento() {
  
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventarios() {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventories')
        .select('id, name, responsible, created_at')
        .eq('status', 'em_andamento')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar inventários:', error);
      } else {
        setInventarios(data);
      }
      setLoading(false);
    }
    fetchInventarios();
  }, []);

  if (loading) return <p>Carregando inventários...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Inventários em Andamento</h1>
      {inventarios.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500 dark:text-gray-400">Nenhum inventário em andamento no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventarios.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{inv.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <strong>Responsável:</strong> {inv.responsible}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Iniciado em:</strong> {new Date(inv.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <Link href={`/inventario/contagem/${inv.id}`} className="mt-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer">
                  Retomar Contagem
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
