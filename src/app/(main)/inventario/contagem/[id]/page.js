// app/(main)/inventario/contagem/[id]/page.js
'use client';

import { createClient } from '@/app/utils/supabase/client';
import { useState, useEffect, useRef, use } from 'react';
// Importando a biblioteca correta e mais moderna
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

const supabase = createClient();

// Componente para o ícone da câmera
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm12 12H4l4-8h4l4 8z" clipRule="odd" />
    <path d="M10 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
  </svg>
);

// Função para tocar um "bip" de confirmação
const playBeep = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (error) {
    console.error("Não foi possível tocar o som de bip:", error);
  }
};

export default function PaginaContagem({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id: inventoryId } = resolvedParams;

  const [considerarLote, setConsiderarLote] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState('localizacao');
  const [localizacao, setLocalizacao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState(0);
  const [scanningField, setScanningField] = useState(null);
  
  const html5QrCodeRef = useRef(null);

  const localizacaoInputRef = useRef(null);
  const codigoInputRef = useRef(null);
  const loteInputRef = useRef(null);
  const quantidadeInputRef = useRef(null);

  useEffect(() => {
    localizacaoInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (etapaAtual === 'localizacao') localizacaoInputRef.current?.focus();
    if (etapaAtual === 'codigo') codigoInputRef.current?.focus();
    if (etapaAtual === 'lote' && loteInputRef.current) loteInputRef.current?.focus();
    if (etapaAtual === 'quantidade') quantidadeInputRef.current?.focus();
  }, [etapaAtual]);

  useEffect(() => {
    if (scanningField) {
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        handleScanResult(decodedText);
      };

      const config = { fps: 10, qrbox: { width: 250, height: 150 } };

      html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
        .catch(err => {
          console.error("Falha ao iniciar o leitor de QR code.", err);
          alert("Não foi possível iniciar a câmera. Verifique as permissões.");
          setScanningField(null);
        });
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => {
          console.error("Falha ao parar o leitor de QR code.", err);
        });
      }
    };
  }, [scanningField]);

  const getEtapaLabel = () => {
    switch (etapaAtual) {
      case 'localizacao': return '1. Leia ou digite a LOCALIZAÇÃO';
      case 'codigo': return '2. Leia ou digite o CÓDIGO do produto';
      case 'lote': return '3. Leia ou digite o LOTE';
      case 'quantidade': return '4. Informe a QUANTIDADE';
      default: return '';
    }
  };
  
  const handleScanResult = (scannedText) => {
  if (scannedText) {
    playBeep();
    
    switch (scanningField) {
      case 'localizacao':
        setLocalizacao(scannedText);
        setEtapaAtual('codigo');
        break;
      case 'codigo':
        setCodigo(scannedText);
        setEtapaAtual(considerarLote ? 'lote' : 'quantidade');
        break;
      case 'lote':
        setLote(scannedText);
        setEtapaAtual('quantidade');
        break;
      // Novo caso para a quantidade
      case 'quantidade':
        // Tenta converter o texto lido para um número. Se não for um número válido, mantém 1.
        const numScanned = Number(scannedText);
        setQuantidade(isNaN(numScanned) ? 1 : numScanned);
        break;
    }
    // Fecha a câmera para TODOS os campos após a leitura bem-sucedida
    setScanningField(null);
  }
};
  
  const handleCameraButtonClick = (field) => {
    setScanningField(prev => (prev === field ? null : field));
  };

  const finalizarItem = async () => {
    if (!localizacao || !codigo || (considerarLote && !lote) || quantidade <= 0) {
        alert('Dados do item incompletos.');
        return;
    }
    const { error } = await supabase.from('counted_items').insert({ inventory_id: inventoryId, location: localizacao, product_code: codigo, lot: considerarLote ? lote : null, quantity: quantidade });
    if (error) {
      alert('Erro ao salvar item.');
      console.error(error);
    } else {
      alert('Item salvo!');
      setCodigo('');
      setLote('');
      setQuantidade(0);
      setEtapaAtual('codigo');
    }
  };

  const finalizarLocalizacao = () => {
    setLocalizacao('');
    setCodigo('');
    setLote('');
    setQuantidade(0);
    setEtapaAtual('localizacao');
  };

  const finalizarInventario = async () => {
    if (window.confirm('Deseja realmente finalizar e processar os resultados?')) {
      try {
        const response = await fetch('/api/inventario/processar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inventoryId }) });
        if (!response.ok) throw new Error('Falha no processamento');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Resultado_Inventario_${inventoryId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert('Inventário finalizado e relatório baixado!');
        router.push('/inventario/historico');
      } catch (error) {
        console.error('Erro ao finalizar:', error);
        alert('Ocorreu um erro ao finalizar o inventário.');
      }
    }
  };

  const handleKeyDown = (e, etapa) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (etapaAtual === 'localizacao') setEtapaAtual('codigo');
      if (etapaAtual === 'codigo') setEtapaAtual(considerarLote ? 'lote' : 'quantidade');
      if (etapaAtual === 'lote') setEtapaAtual('quantidade');
      if (etapaAtual === 'quantidade') finalizarItem();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Contagem do Inventário</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">ID do Inventário: {inventoryId}</p>
      
      <label className="flex items-center space-x-3 cursor-pointer mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <input type="checkbox" checked={considerarLote} onChange={(e) => setConsiderarLote(e.target.checked)} className="toggle toggle-info"/>
        <span className="font-medium dark:text-gray-300">Considerar Lote na Contagem</span> 
      </label>
      
      {scanningField && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl w-full max-w-md">
            <p className="text-center font-semibold mb-2 dark:text-white">Aponte para o código de barras</p>
            <div id="reader" className="w-full"></div>
          </div>
          <button onClick={() => setScanningField(null)} className="btn btn-warning mt-4">
            Cancelar
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{getEtapaLabel()}</h3>
        
        <div className="relative">
          <input ref={localizacaoInputRef} type="text" placeholder="Localização" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'localizacao')} className="input input-bordered w-full pr-12 dark:bg-gray-700 dark:border-gray-600" />
          <button onClick={() => handleCameraButtonClick('localizacao')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-500">
            <CameraIcon />
          </button>
        </div>

        <div className="relative">
          <input ref={codigoInputRef} type="text" placeholder="Código do Produto" value={codigo} onChange={(e) => setCodigo(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'codigo')} className="input input-bordered w-full pr-12 dark:bg-gray-700 dark:border-gray-600" />
          <button onClick={() => handleCameraButtonClick('codigo')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-500">
            <CameraIcon />
          </button>
        </div>

        {considerarLote && (
          <div className="relative">
            <input ref={loteInputRef} type="text" placeholder="Lote" value={lote} onChange={(e) => setLote(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'lote')} className="input input-bordered w-full pr-12 dark:bg-gray-700 dark:border-gray-600" />
            <button onClick={() => handleCameraButtonClick('lote')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-500">
              <CameraIcon />
            </button>
          </div>
        )}

        <div className="relative">
          <input ref={quantidadeInputRef} type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} onKeyDown={(e) => handleKeyDown(e, 'quantidade')} className="input input-bordered w-full pr-12 dark:bg-gray-700 dark:border-gray-600" />
          <button onClick={() => handleCameraButtonClick('quantidade')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-500">
            <CameraIcon />
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
      
      <h4 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Ações</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={finalizarItem} className="btn btn-success text-white">Finalizar Item</button>
        <button onClick={finalizarLocalizacao} className="btn btn-info text-white">Próxima Localização</button>
        <button onClick={finalizarInventario} className="btn btn-error text-white">Finalizar Inventário</button>
      </div>
    </div>
  );
}
