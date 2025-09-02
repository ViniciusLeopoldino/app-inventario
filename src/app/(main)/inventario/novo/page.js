'use client';

import { useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export default function NovoInventario() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [estoqueBase, setEstoqueBase] = useState(null);
  
  // Novo estado para guardar o nome do arquivo selecionado
  const [fileName, setFileName] = useState('');

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

    setFileName(file.name); // Guarda o nome do arquivo para exibir na tela

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      if (data.length > 0 && 'Codigo' in data[0] && 'Quantidade' in data[0]) {
        setEstoqueBase(data);
      } else {
        alert('Arquivo fora do padrão. Verifique as colunas.');
        setFileName(''); // Limpa o nome do arquivo se der erro
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleStartInventory = async () => {
    if (!nome || !responsavel || !estoqueBase) {
      alert('Preencha todos os campos e carregue o arquivo de estoque.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert('Sessão expirada. Por favor, faça o login novamente.');
        return;
    }

    const { data, error } = await supabase
      .from('inventories')
      .insert([{ 
        name: nome, 
        responsible: responsavel, 
        base_stock_data: estoqueBase 
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar inventário:', error);
      alert('Não foi possível iniciar o inventário.');
    } else {
      router.push(`/inventario/contagem/${data.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Novo Inventário</h1>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <label htmlFor="nome_inventario" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Inventário</label>
            <input
              id="nome_inventario"
              type="text"
              placeholder="Ex: Inventário Geral - Setembro/2025"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsável</label>
            <input
              id="responsavel"
              type="text"
              placeholder="Nome do responsável pela contagem"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload do Estoque Base</h4>
            <div className="flex items-center space-x-4">
              {/* 1. O input de arquivo real, agora escondido */}
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".xlsx, .csv" 
                onChange={handleFileUpload} 
              />
              
              {/* 2. A <label> que parece um botão e ativa o input escondido */}
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Selecionar Planilha...
              </label>

              {/* 3. Um texto que mostra o nome do arquivo selecionado */}
              <span className="text-sm text-gray-500 dark:text-gray-400">{fileName || "Nenhum arquivo selecionado"}</span>
            </div>
          </div>
          
          <div className="border-t dark:border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <button 
              onClick={handleFileDownload}
              type="button"
              className="sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 cursor-pointer"
            >
              Baixar Modelo Exemplo
            </button>
            <button 
              onClick={handleStartInventory}
              type="submit"
              className="sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              Iniciar Contagem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
