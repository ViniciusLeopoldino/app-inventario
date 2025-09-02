'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import * as XLSX from 'xlsx';

const supabase = createClient();
const ITEMS_PER_PAGE = 10;

export default function Historico() {
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalInventories, setTotalInventories] = useState(0);

  const fetchHistorico = useCallback(async () => {
    setLoading(true);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('inventories')
      .select('id, name, responsible, finished_at, result_data', { count: 'exact' })
      .eq('status', 'concluido');

    if (startDate) query = query.gte('finished_at', startDate);
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query = query.lte('finished_at', endOfDay.toISOString());
    }

    query = query.order('finished_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      setInventarios([]);
      setTotalInventories(0);
    } else {
      setInventarios(data || []);
      setTotalInventories(count || 0);
    }

    setLoading(false);
  }, [currentPage, startDate, endDate]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchHistorico();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalInventories / ITEMS_PER_PAGE);

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

  // **Função de cálculo atualizada para incluir valores de sobras e faltas**
  const calculateSummary = (resultData) => {
    if (!resultData) return { totalItens: 0, totalSobras: 0, totalFaltas: 0, sobrasValue: 0, faltasValue: 0 };

    let totalItens = 0;
    let totalSobras = 0;
    let totalFaltas = 0;
    let sobrasValue = 0;
    let faltasValue = 0;

    resultData.forEach(item => {
      const diferenca = item.Diferenca || 0;
      const valorUnitario = item.ValorUnitario || 0;

      totalItens += (item.QuantidadeInventariada || 0);

      if (diferenca > 0) {
        totalSobras += diferenca;
        sobrasValue += diferenca * valorUnitario;
      } else if (diferenca < 0) {
        totalFaltas += Math.abs(diferenca);
        faltasValue += diferenca * valorUnitario; // Mantém o valor negativo
      }
    });

    return { totalItens, totalSobras, totalFaltas, sobrasValue, faltasValue };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Histórico de Inventários</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input input-bordered input-sm dark:bg-gray-700 cursor-pointer" />
          <span className="text-gray-500">até</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input input-bordered input-sm dark:bg-gray-700 cursor-pointer" />
          <button onClick={handleFilter} className="btn btn-sm btn-primary text-white cursor-pointer hover:text-blue-400 transition-colors duration-200">Filtrar</button>
          {(startDate || endDate) && (
            <button onClick={handleClearFilters} className="btn btn-sm btn-ghost cursor-pointer hover:text-blue-400 transition-colors duration-200">Limpar</button>
          )}

        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-left">Responsável</th>
                <th className="p-4 text-left">Data Finalização</th>
                <th className="p-4 text-left">Resumo</th>
                <th className="p-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8">Carregando...</td></tr>
              ) : inventarios.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8">Nenhum registro encontrado.</td></tr>
              ) : (
                inventarios.map((inv) => {
                  const summary = calculateSummary(inv.result_data);
                  return (
                    <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-4 font-medium">{inv.name}</td>
                      <td className="p-4">{inv.responsible}</td>
                      <td className="p-4">{new Date(inv.finished_at).toLocaleString('pt-BR')}</td>
                      <td className="p-4 text-sm">
                        {/* **Exibindo o novo formato de resumo** */}
                        <p>Itens: {summary.totalItens}</p>
                        <p className="text-green-500 font-semibold">
                          Sobras: {summary.totalSobras} | {summary.sobrasValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-red-500 font-semibold">
                          Faltas: {summary.totalFaltas} | {summary.faltasValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleDownloadResult(inv.result_data, inv.id)} className="btn btn-sm btn-outline cursor-pointer hover:text-blue-400 transition-colors duration-200">
                          Baixar Relatório
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="btn btn-sm cursor-pointer hover:text-blue-400 transition-colors duration-200">
            Anterior
          </button>
          <span className="text-sm font-medium">Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="btn btn-sm cursor-pointer hover:text-blue-400 transition-colors duration-200">
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

