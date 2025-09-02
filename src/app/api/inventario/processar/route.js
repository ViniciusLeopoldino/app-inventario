// app/api/inventario/processar/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// Usamos createClient normal aqui, pois a chave de serviço já tem todas as permissões
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { inventoryId } = await request.json();

    // 1. Buscar dados do inventário e itens contados
    const { data: inventory, error: invError } = await supabaseAdmin
      .from('inventories')
      .select('base_stock_data')
      .eq('id', inventoryId)
      .single();

    const { data: countedItems, error: itemsError } = await supabaseAdmin
      .from('counted_items')
      .select('*')
      .eq('inventory_id', inventoryId);
    
    if (invError || itemsError) {
      throw new Error('Erro ao buscar dados do inventário.');
    }

    const baseStock = inventory.base_stock_data;

    // --- NOVA LÓGICA DE PROCESSAMENTO ---

    // 2. Criar mapas para consulta rápida
    const baseStockMapByCode = new Map(baseStock.map(item => [item.Codigo, item]));
    const baseStockMapByCodeLote = new Map(baseStock.map(item => [`${item.Codigo}|${item.Lote || ''}`, item]));

    // 3. Consolidar itens contados
    const consolidatedCount = new Map();
    countedItems.forEach(item => {
      const key = `${item.product_code}|${item.lot || ''}`;
      if (!consolidatedCount.has(key)) {
        consolidatedCount.set(key, { quantity: 0, locations: new Set() });
      }
      const current = consolidatedCount.get(key);
      current.quantity += item.quantity;
      current.locations.add(item.location);
      consolidatedCount.set(key, current);
    });

    const resultData = [];

    // 4. Processar itens do estoque base
    baseStock.forEach(baseItem => {
      const key = `${baseItem.Codigo}|${baseItem.Lote || ''}`;
      const countedData = consolidatedCount.get(key);

      if (countedData) {
        // Caso A: Item do estoque base foi contado (match exato de código e lote)
        const localizacoesContadas = [...countedData.locations].join(', ');
        let observacao = '';
        if (baseItem.Localizacao !== localizacoesContadas) {
          observacao = 'Divergência de Localização';
        }

        resultData.push({
          ...baseItem,
          QuantidadeInventariada: countedData.quantity,
          Diferenca: countedData.quantity - baseItem.Quantidade,
          LocalizacaoContada: localizacoesContadas,
          Observacao: observacao,
        });
        consolidatedCount.delete(key); // Remove para não reprocessar
      } else {
        // Caso B: Item do estoque base NÃO foi contado
        resultData.push({
          ...baseItem,
          QuantidadeInventariada: 0,
          Diferenca: -baseItem.Quantidade,
          LocalizacaoContada: '',
          Observacao: 'Item não encontrado',
        });
      }
    });

    // 5. Processar itens contados que sobraram (não tinham match exato)
    for (const [key, countedData] of consolidatedCount.entries()) {
      const [codigo, lote] = key.split('|');
      const baseItemInfo = baseStockMapByCode.get(codigo);

      if (baseItemInfo) {
        // Caso C: O CÓDIGO existe na base, mas o LOTE é diferente
        resultData.push({
          Localizacao: '', // Localização base não existe para este lote
          Codigo: codigo,
          Descricao: baseItemInfo.Descricao, // Puxa a descrição correta
          Lote: lote,
          Quantidade: 0, // Quantidade base é 0 para este lote
          ValorUnitario: baseItemInfo.ValorUnitario, // Puxa o valor correto
          QuantidadeInventariada: countedData.quantity,
          Diferenca: countedData.quantity,
          LocalizacaoContada: [...countedData.locations].join(', '),
          Observacao: 'Divergência de Lote',
        });
      } else {
        // Caso D: O CÓDIGO não existe na base (item totalmente novo)
        resultData.push({
          Localizacao: '',
          Codigo: codigo,
          Descricao: 'ITEM NÃO ESTAVA NA BASE',
          Lote: lote,
          Quantidade: 0,
          ValorUnitario: 0,
          QuantidadeInventariada: countedData.quantity,
          Diferenca: countedData.quantity,
          LocalizacaoContada: [...countedData.locations].join(', '),
          Observacao: 'Item sobrando',
        });
      }
    }

    // --- FIM DA NOVA LÓGICA ---

    // 6. Atualizar o banco e gerar o arquivo Excel
    await supabaseAdmin
      .from('inventories')
      .update({ 
        status: 'concluido', 
        result_data: resultData,
        finished_at: new Date().toISOString()
      })
      .eq('id', inventoryId);

    const worksheet = XLSX.utils.json_to_sheet(resultData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultado');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Resultado_Inventario_${inventoryId}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });

  } catch (error) {
    console.error('Erro no processamento do inventário:', error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
