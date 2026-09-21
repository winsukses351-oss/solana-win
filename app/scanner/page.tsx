'use client';
import { useState, useEffect } from 'react';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);

  // Menjalankan scanner secara otomatis saat halaman dimuat
  useEffect(() => {
    setIsScanning(true);
    
    // Logika pemanggilan API ke backend (Solana/Raydium) dapat ditempatkan di sini nantinya
    // fetch('/api/scanner/start', { method: 'POST' })...
  }, []);

  return (
    <div className="p-6 text-white w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-400">Token Scanner</h1>
        <button 
          onClick={() => setIsScanning(!isScanning)}
          className={`px-4 py-2 rounded font-bold transition ${isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isScanning ? 'Hentikan Pemindaian' : 'Mulai Memindai'}
        </button>
      </div>

      <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg min-h-[300px] flex items-center justify-center">
        {isScanning ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300 font-mono text-sm text-center">
              Mendengarkan jaringan Solana untuk pool likuiditas baru (Raydium)...
            </p>
            <p className="text-yellow-500 text-xs mt-2">
              Status: Berjalan otomatis
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Scanner sedang nonaktif. Klik "Mulai Memindai" untuk mencari token.</p>
        )}
      </div>
    </div>
  );
}
