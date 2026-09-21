'use client';
import { useState, useEffect } from 'react';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      // Parameter ?t= meyakinkan browser tidak memakai cache lama
      const res = await fetch(`/api/scanner?t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tokens)) {
        setTokens(data.tokens);
      }
    } catch (err) {
      console.error('Gagal memindai:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      fetchTokens();
      interval = setInterval(fetchTokens, 10000);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="p-6 text-white w-full max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Token Scanner</h1>
          <p className="text-xs text-gray-400 mt-1">Pemindaian otomatis token Solana baru (Real-time)</p>
        </div>
        <button 
          onClick={() => setIsScanning(!isScanning)}
          className={`px-4 py-2 rounded font-bold transition ${isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isScanning ? 'Hentikan Pemindaian' : 'Mulai Memindai'}
        </button>
      </div>

      <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg">
        {isScanning && (
          <div className="flex items-center gap-3 mb-6 bg-blue-950/40 p-3 rounded-lg border border-blue-800/50">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-blue-300 font-mono">
              {loading ? 'Memuat token terbaru...' : 'Scanner aktif — Memindai setiap 10 detik'}
            </span>
          </div>
        )}

        {tokens.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-mono text-sm">
            {isScanning ? 'Mencari token baru...' : 'Scanner nonaktif. Klik "Mulai Memindai".'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase font-mono">
                  <th className="pb-3">Token</th>
                  <th className="pb-3">Umur</th>
                  <th className="pb-3">Harga</th>
                  <th className="pb-3">Alamat Kontrak</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {tokens.map((token, idx) => {
                  const addr = token.address || '';
                  return (
                    <tr key={idx} className="hover:bg-gray-800/30 transition">
                      <td className="py-3 font-semibold text-blue-300">
                        {token.symbol}
                      </td>
                      <td className="py-3 font-mono text-xs">
                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                          {token.age}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-xs text-gray-300">
                        {token.priceUsd}
                      </td>
                      <td className="py-3 font-mono text-xs text-gray-400">
                        {addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'N/A'}
                      </td>
                      <td className="py-3 text-right">
                        <a 
                          href={token.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-700/50 rounded text-xs hover:bg-blue-600/40 transition"
                        >
                          DexScreener ↗
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
