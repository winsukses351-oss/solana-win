'use client';
import { useState, useEffect } from 'react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities?t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.opportunities)) {
        setOpportunities(data.opportunities);
      }
    } catch (err) {
      console.error('Gagal memuat peluang:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    const interval = setInterval(fetchOpportunities, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 text-white w-full max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Peluang Trading (Opportunities)</h1>
          <p className="text-xs text-gray-400 mt-1">
            Daftar token hasil filter otomatis yang lolos evaluasi risiko
          </p>
        </div>
        <button 
          onClick={fetchOpportunities}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded border border-gray-700 transition"
        >
          {loading ? 'Memuat...' : 'Refresh Data'}
        </button>
      </div>

      {loading && opportunities.length === 0 ? (
        <div className="text-gray-400 text-sm font-mono animate-pulse">Menganalisis peluang token pasar...</div>
      ) : opportunities.length === 0 ? (
        <div className="text-gray-500 text-sm font-mono bg-gray-900 p-6 rounded-xl border border-gray-800">
          Belum ada token yang memenuhi kriteria risiko saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((item, i) => (
            <div key={i} className="bg-gray-900/80 p-5 rounded-xl border border-gray-800 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      {item.symbol}
                      <span className="text-xs text-gray-400 font-normal">{item.price}</span>
                    </h3>
                    <p className="font-mono text-xs text-gray-500 break-all">{item.address}</p>
                  </div>
                  <span className="bg-green-500/20 text-green-400 text-xs px-2.5 py-1 rounded-full font-bold border border-green-500/30">
                    Skor: {item.score}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 text-xs bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <div>
                    <span className="text-gray-500 block">Likuiditas</span>
                    <span className="font-bold text-gray-200">{item.liquidity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Market Cap (FDV)</span>
                    <span className="font-bold text-gray-200">{item.marketCap}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition">
                  Eksekusi Buy (Swap)
                </button>
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded text-xs transition text-center"
                >
                  Chart ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
