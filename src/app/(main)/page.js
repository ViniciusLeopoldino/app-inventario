// app/(main)/page.js
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const supabase = createClient();

export default function Dashboard() {

  const [stats, setStats] = useState({ emAndamento: 0, concluidos: 0 });

  // Estados para gerenciar as perdas
  const [latestLossValue, setLatestLossValue] = useState(0);
  const [totalLossValue, setTotalLossValue] = useState(0);
  const [lossType, setLossType] = useState('latest'); // 'latest' ou 'total'

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const [
        { count: emAndamento },
        { count: concluidos },
        { data: allCompletedInventories },
        { data: activity }
      ] = await Promise.all([
        supabase.from('inventories').select('*', { count: 'exact', head: true }).eq('status', 'em_andamento'),
        supabase.from('inventories').select('*', { count: 'exact', head: true }).eq('status', 'concluido'),
        supabase.from('inventories').select('result_data, finished_at').eq('status', 'concluido').order('finished_at', { ascending: false }),
        supabase.from('inventories').select('name, responsible, status, created_at, finished_at').order('created_at', { ascending: false }).limit(5)
      ]);

      setStats({ emAndamento: emAndamento ?? 0, concluidos: concluidos ?? 0 });

      if (allCompletedInventories && allCompletedInventories.length > 0) {
        const latestInventory = allCompletedInventories[0];

        if (latestInventory.result_data) {
          const latestLoss = latestInventory.result_data.reduce((acc, item) => {
            if (item.Diferenca < 0) return acc + (item.Diferenca * (item.ValorUnitario || 0));
            return acc;
          }, 0);
          setLatestLossValue(latestLoss);
        }

        const totalLoss = allCompletedInventories.reduce((totalAcc, inventory) => {
          if (!inventory.result_data) return totalAcc;
          const inventoryLoss = inventory.result_data.reduce((itemAcc, item) => {
            if (item.Diferenca < 0) return itemAcc + (item.Diferenca * (item.ValorUnitario || 0));
            return itemAcc;
          }, 0);
          return totalAcc + inventoryLoss;
        }, 0);
        setTotalLossValue(totalLoss);
      }

      setRecentActivity(activity || []);
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  const chartData = {
    labels: ['Status dos Inventários'],
    datasets: [
      {
        label: 'Em Andamento',
        data: [stats.emAndamento],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Concluídos',
        data: [stats.concluidos],
        backgroundColor: 'rgba(22, 163, 74, 0.7)',
        borderColor: 'rgba(22, 163, 74, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <p className="text-center mt-8">Carregando dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
          <h2 className="text-5xl text-center font-extrabold text-blue-500">{stats.emAndamento}</h2>
          <p className="mt-2 text-lg text-center font-medium text-gray-600 dark:text-gray-300">Inventários em Andamento</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
          <h2 className="text-5xl text-center font-extrabold text-green-600">{stats.concluidos}</h2>
          <p className="mt-2 text-lg text-center font-medium text-gray-600 dark:text-gray-300">Concluídos (Total)</p>
        </div>

        {/* Card de Perdas com o Seletor */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col">
          <div className="flex justify-center mb-4 bg-gray-100 dark:bg-gray-700 rounded-full p-1 text-sm font-semibold">
            <button
              onClick={() => setLossType('latest')}
              className={`w-1/2 py-1 cursor-pointer rounded-full transition-colors duration-300 ${lossType === 'latest' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Última
            </button>
            <button
              onClick={() => setLossType('total')}
              className={`w-1/2 py-1 cursor-pointer rounded-full transition-colors duration-300 ${lossType === 'total' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Total
            </button>
          </div>

          <div className="text-center flex-grow flex flex-col justify-center">
            {(() => {
              // determinando qual valor de perda está ativo
              const currentLossValue = lossType === 'latest' ? latestLossValue : totalLossValue;

              // renderizando o h2 com a classe de cor condicional (verde = 0,00 e vermelho <> 0,00)
              return (
                <h2 className={`text-5xl font-extrabold transition-colors duration-300 ${currentLossValue === 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                  {currentLossValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </h2>
              );
            })()}

            <p className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300">
              {lossType === 'latest' ? 'Perdas (Último Inventário)' : 'Perdas (Total)'}
            </p>
          </div>

          {/* <div className="text-center flex-grow flex flex-col justify-center">
            <h2 className="text-5xl font-extrabold text-red-500">
              {(lossType === 'latest' ? latestLossValue : totalLossValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h2>
            <p className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300">
              {lossType === 'latest' ? 'Perdas (Último Inventário)' : 'Perdas (Total)'}
            </p>
          </div> */}
        </div>
      </div>

      {/* Seção do Gráfico e Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">Visão Geral</h3>
          <div className="h-64"><Bar data={chartData} options={{ maintainAspectRatio: false }} /></div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-200">Atividade Recente</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.responsible} - {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'concluido'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                    {item.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhuma atividade recente para exibir.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
