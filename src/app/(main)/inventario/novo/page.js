// app/(main)/inventario/novo/page.js
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export default function NovoInventario() {
  
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [estoqueBase, setEstoqueBase] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setResponsavel(user.email || '');
      }
      setLoading(false);
    };
    checkUserSession();
  }, []);

  const handleFileDownload = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Localizacao', 'Codigo', 'Descricao', 'Lote', 'Quantidade', 'ValorUnitario']
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo');
    XLSX.writeFile(workbook, 'Modelo_Inventario.xlsx');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      if (data.length > 0 && 'Codigo' in data[0] && 'Quantidade' in data[0]) {
        setEstoqueBase(data);
        alert(`Arquivo "${file.name}" carregado com sucesso!`);
      } else {
        alert('Arquivo fora do padrão. Verifique as colunas.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleStartInventory = async () => {
    if (!nome || !responsavel || !estoqueBase) {
      alert('Preencha todos os campos e carregue o arquivo de estoque.');
      return;
    }
    const { data, error } = await supabase
      .from('inventories')
      .insert([{ name: nome, responsible: responsavel, base_stock_data: estoqueBase }])
      .select()
      .single();
    if (error) {
      console.error('Erro ao criar inventário:', error);
      alert('Não foi possível iniciar o inventário.');
    } else {
      router.push(`/inventario/contagem/${data.id}`);
    }
  };

  if (loading) return <p>Verificando autenticação...</p>;
  if (!user) return <p>Você precisa estar logado para criar um novo inventário.</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Iniciar Novo Inventário</h1>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Inventário</label>
          <input
            type="text"
            id="nome"
            placeholder="Ex: Inventário Geral - Setembro/2025"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsável</label>
          <input
            type="text"
            id="responsavel"
            value={responsavel}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          />
        </div>

        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload do Estoque Base (.xlsx)</label>
          <input id="file-upload" type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"/>
          <button onClick={handleFileDownload} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Baixar planilha modelo
          </button>
        </div>

        <button 
          onClick={handleStartInventory} 
          disabled={!estoqueBase}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Iniciar Contagem
        </button>
      </div>
    </div>
  );
}
