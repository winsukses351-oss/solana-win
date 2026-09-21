'use client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil status:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 text-white w-full">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">System Dashboard</h1>
      
      {loading ? (
        <div className="animate-pulse text-gray-400">Memuat status sistem dari jaringan Solana...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel RPC & Network */}
          <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Status Jaringan</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-400">Jaringan:</span> 
                <span className="font-mono">{status?.network || 'Terputus'}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">RPC Solana:</span> 
                <span className={`font-bold ${status?.rpcStatus === 'READY' ? 'text-green-500' : 'text-red-500'}`}>
                  {status?.rpcStatus || 'ERROR'}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Mesin Trading:</span> 
                <span className={`font-bold ${status?.tradingStatus === 'READY' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {status?.tradingStatus || 'BLOCKED'}
                </span>
              </li>
            </ul>
          </div>

          {/* Panel Wallet */}
          <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Dompet (Wallet)</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-400">Status Wallet:</span> 
                <span className={`font-bold ${status?.walletStatus === 'READY' ? 'text-green-500' : 'text-red-500'}`}>
                  {status?.walletStatus || 'KOSONG'}
                </span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-gray-400">Alamat Publik (Address):</span> 
                <span className="font-mono text-xs text-blue-300 break-all bg-gray-950 p-2 rounded">
                  {status?.walletAddress || 'Belum diatur di Vercel Env'}
                </span>
              </li>
              <li className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Saldo Tersedia:</span> 
                <span className="font-bold text-xl text-green-400">
                  {status?.walletBalanceSol ? status.walletBalanceSol.toFixed(4) : '0.0000'} SOL
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
