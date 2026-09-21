'use client';
import { useState } from 'react';

export default function OpportunitiesPage() {
  // Sample data peluang hasil kalkulasi skor dari backend
  const [opportunities] = useState([
    {
      symbol: 'BONK2',
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      score: 88,
      liquidity: '$12,450',
      marketCap: '$45,000',
      status: 'HIGH_SCORE',
    },
  ]);

  return (
    <div className="p-6 text-white w-full max-w-6xl">
      <h1 className="text-2xl font-bold mb-2 text-blue-400">Peluang Trading (Opportunities)</h1>
      <p className="text-xs text-gray-400 mb-6">Daftar token yang memenuhi syarat kriteria manajemen risiko Anda</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((item, i) => (
          <div key={i} className="bg-gray-900/80 p-5 rounded-xl border border-gray-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-white">{item.symbol}</h3>
                  <p className="font-mono text-xs text-gray-500 break-all">{item.address}</p>
                </div>
                <span className="bg-green-500/20 text-green-400 text-xs px-2,5 py-1 rounded-full font-bold border border-green-500/30">
                  Skor: {item.score}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-4 text-xs bg-gray-950 p-3 rounded-lg border border-gray-800">
                <div>
                  <span className="text-gray-500 block">Likuiditas</span>
                  <span className="font-bold text-gray-200">{item.liquidity}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Market Cap</span>
                  <span className="font-bold text-gray-200">{item.marketCap}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition">
                Beli (Auto Swap)
              </button>
              <a 
                href={`https://dexscreener.com/solana/${item.address}`}
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
    </div>
  );
}
