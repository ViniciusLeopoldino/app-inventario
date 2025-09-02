// app/(main)/inventario/historico/page.js
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import * as XLSX from 'xlsx';

const supabase = createClient();

export default function Historico() {
  
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistorico() {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventories')
        .select('id, name, responsible, finished_at, result_data')
        .eq('status', 'concluido')
        .order('finished_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
      } else {
        setInventarios(data);
      }
      setLoading(false);
    }
    fetchHistorico();
  }, []);

  const handleDownloadResult = (resultData, inventoryId) => {
    if (!resultData || resultData.length === 0) {
      alert('Não há dados de resultado para baixar.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(resultData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultado');
    XLSX.writeFile(workbook, `Resultado_Inventario_${inventoryId}.xlsx`);
  };

  const calculateSummary = (resultData) => {
    if (!resultData) return { totalItens: 0, totalDivergencia: 0 };
    const totalItens = resultData.reduce((acc, item) => acc + (item.QuantidadeInventariada || 0), 0);
    const totalDivergencia = resultData.reduce((acc, item) => {
      const divergenciaValor = (item.Diferenca || 0) * (item.ValorUnitario || 0);
      return acc + divergenciaValor;
    }, 0);
    return { totalItens, totalDivergencia };
  };

  if (loading) return <p>Carregando histórico...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Histórico de Inventários Concluídos</h1>
      {inventarios.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500 dark:text-gray-400">Nenhum inventário foi concluído ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventarios.map((inv) => {
            const summary = calculateSummary(inv.result_data);
            return (
              <div key={inv.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{inv.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2"><strong>Responsável:</strong> {inv.responsible}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400"><strong>Finalizado em:</strong> {new Date(inv.finished_at).toLocaleString('pt-BR')}</p>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Resumo:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Itens Contados: {summary.totalItens}</p>
                  <p className={`text-sm font-bold ${summary.totalDivergencia < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    Valor da Divergência: {summary.totalDivergencia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <button onClick={() => handleDownloadResult(inv.result_data, inv.id)} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                  Baixar Relatório
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
