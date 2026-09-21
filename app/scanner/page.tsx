'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TokenItem {
  symbol: string;
  name?: string;
  age?: string;
  price?: string;
  address: string;
  url?: string;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR';
  message: string;
}

export default function ScannerPage() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [lastUpdate, setLastUpdate] = useState<string>('-');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fungsi untuk menambah log terminal
  const addLog = (type: 'INFO' | 'SUCCESS' | 'ERROR', message: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID');
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: timeStr,
      type,
      message,
    };
    setLogs((prevLogs) => [...prevLogs.slice(-19), newLog]); // Simpan 20 log terakhir
  };

  // Fungsi fetch token data dari backend
  const fetchTokens = async () => {
    setIsLoading(true);
    addLog('INFO', 'Mengirim permintaan scan token baru ke API...');

    try {
      // Tambahkan query parameter timestamp (?t=...) untuk menghindari cache browser
      const res = await fetch(`/api/scanner?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setTokens(json.data);
        const timeNow = json.timestamp || new Date().toLocaleTimeString('id-ID');
        setLastUpdate(timeNow);
        addLog('SUCCESS', `Scan berhasil pada ${timeNow}. Terdeteksi ${json.data.length} token.`);
      } else {
        addLog('ERROR', `Scan gagal: ${json.error || 'Response tidak valid'}`);
      }
    } catch (err: any) {
      addLog('ERROR', `Terjadi kesalahan jaringan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect pemindaian awal saat pertama dimuat
  useEffect(() => {
    addLog('INFO', 'Sistem Pemindaian Otomatis Diaktifkan.');
    fetchTokens();
  }, []);

  // Effect timer countdown 10 detik
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isScanning) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchTokens();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isScanning]);

  const toggleScanning = () => {
    if (isScanning) {
      setIsScanning(false);
      addLog('INFO', 'Pemindaian dihentikan oleh pengguna.');
    } else {
      setIsScanning(true);
      setCountdown(10);
      addLog('INFO', 'Pemindaian dilanjutkan.');
      fetchTokens();
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Helper pemotong alamat kontrak yang aman dari error .slice()
  const formatAddress = (addr?: string) => {
    if (!addr || typeof addr !== 'string') return 'N/A';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-4 md:p-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-400">
            Token Scanner Solana
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Pemindaian otomatis token meme Solana secara real-time
          </p>
        </div>

        <button
          onClick={toggleScanning}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            isScanning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isScanning ? 'Hentikan Pemindaian' : 'Mulai Pemindaian'}
        </button>
      </div>

      {/* Info Status Box */}
      <div className="bg-[#131822] border border-gray-800 rounded-lg p-3 md:p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span>
            {isScanning
              ? `Scanner aktif – Memindai ulang dalam ${countdown}s`
              : 'Scanner dihentikan'}
          </span>
        </div>
        <div className="text-gray-400">
          Terakhir update: <span className="text-blue-400 font-mono">{lastUpdate}</span>
        </div>
      </div>

      {/* Tabel Token */}
      <div className="bg-[#131822] border border-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-[#1a202c] text-gray-400 uppercase text-[11px] border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">TOKEN</th>
                <th className="py-3 px-4">UMUR</th>
                <th className="py-3 px-4">HARGA</th>
                <th className="py-3 px-4">ALAMAT KONTRAK</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {tokens.length > 0 ? (
                tokens.map((token, index) => (
                  <tr key={token.address || index} className="hover:bg-[#1a2130] transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-400">
                      {token.symbol || 'TOKEN'}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {token.age || 'Baru'}
                    </td>
                    <td className="py-3 px-4 font-mono text-green-400">
                      {token.price || '$0.00'}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-400">
                      {formatAddress(token.address)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={token.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded text-xs transition-colors"
                      >
                        DexScreener ↗
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    {isLoading ? 'Sedang memindai token...' : 'Tidak ada data token ditemukan'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal Live Log / Debugger */}
      <div className="bg-[#0e121b] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-bold text-gray-300">
              Terminal Live Log (Debug Scanner)
            </span>
          </div>
          <button
            onClick={clearLogs}
            className="text-[11px] text-gray-500 hover:text-gray-300 underline"
          >
            Bersihkan Log
          </button>
        </div>

        <div className="font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto space-y-1">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-gray-500">[{log.time}]</span>
                <span
                  className={
                    log.type === 'SUCCESS'
                      ? 'text-green-400 font-bold'
                      : log.type === 'ERROR'
                      ? 'text-red-400 font-bold'
                      : 'text-blue-400 font-bold'
                  }
                >
                  [{log.type}]
                </span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="text-gray-600 italic">Belum ada log aktivitas...</div>
          )}
        </div>
      </div>
    </div>
  );
}
