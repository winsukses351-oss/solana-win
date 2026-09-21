'use client';
import { useState, useEffect, useRef } from 'react';

interface LogItem {
  id: number;
  time: string;
  type: 'info' | 'success' | 'error' | 'warn';
  text: string;
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('-');
  const [countdown, setCountdown] = useState<number>(10);

  // State untuk Live Log
  const [logs, setLogs] = useState<LogItem[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogItem['type'], text: string) => {
    const time = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLogs((prev) => [...prev.slice(-49), { id: Date.now(), time, type, text }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchTokens = async () => {
    setLoading(true);
    addLog('info', 'Mengirim permintaan scan ke API...');
    try {
      const res = await fetch(`/api/scanner?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();

      if (data.updatedAt) {
        setLastUpdated(data.updatedAt);
      }

      if (data.success && Array.isArray(data.tokens)) {
        setTokens(data.tokens);
        addLog(
          'success',
          `Scan berhasil pada ${data.updatedAt}. Diterima ${data.tokensCount ?? data.tokens.length} token.`
        );
      } else {
        addLog('error', `Gagal: ${data.error || 'Respon tidak valid dari API'}`);
      }
    } catch (err: any) {
      addLog('error', `Error Koneksi: ${err.message || 'Tidak dapat terhubung ke server'}`);
    } finally {
      setLoading(false);
      setCountdown(10);
    }
  };

  useEffect(() => {
    let interval: any;
    let timer: any;

    if (isScanning) {
      addLog('info', 'Sistem Pemindaian Otomatis Diaktifkan.');
      fetchTokens();

      interval = setInterval(fetchTokens, 10000);

      timer = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 10));
      }, 1000);
    } else {
      addLog('warn', 'Sistem Pemindaian Dihentikan Pengguna.');
    }

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isScanning]);

  return (
    <div className="p-6 text-white w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Token Scanner</h1>
          <p className="text-xs text-gray-400 mt-1">
            Pemindaian otomatis token & pergerakan pasar Solana
          </p>
        </div>
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={`px-4 py-2 rounded font-bold text-xs transition ${
            isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isScanning ? 'Hentikan Pemindaian' : 'Mulai Memindai'}
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg">
        {isScanning && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 bg-blue-950/40 p-3 rounded-lg border border-blue-800/50">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-blue-300 font-mono">
                {loading ? 'Mengambil data pasar...' : `Scan ulang dalam ${countdown}s`}
              </span>
            </div>
            <span className="text-xs text-gray-300 font-mono">
              Terakhir update: <strong className="text-green-400 font-bold">{lastUpdated}</strong>
            </span>
          </div>
        )}

        {tokens.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-mono text-sm">
            {isScanning ? 'Mencari token...' : 'Scanner nonaktif. Klik "Mulai Memindai".'}
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
                      <td className="py-3 font-semibold text-blue-300">{token.symbol}</td>
                      <td className="py-3 font-mono text-xs">
                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                          {token.age}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-xs text-gray-300">{token.priceUsd}</td>
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

      {/* Live Console Terminal Log */}
      <div className="bg-black/90 p-4 rounded-xl border border-gray-800 font-mono text-xs shadow-2xl">
        <div className="flex justify-between items-center pb-2 mb-3 border-b border-gray-800">
          <span className="text-gray-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Terminal Live Log (Debug Scanner)
          </span>
          <button
            onClick={() => setLogs([])}
            className="text-gray-500 hover:text-gray-300 text-[10px] underline"
          >
            Bersihkan Log
          </button>
        </div>

        <div className="h-40 overflow-y-auto space-y-1.5 text-[11px] pr-2 scrollbar-thin">
          {logs.length === 0 ? (
            <div className="text-gray-600 italic">Belum ada aktivitas log...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-2 items-start leading-tight">
                <span className="text-gray-600">[{log.time}]</span>
                {log.type === 'info' && <span className="text-blue-400">[INFO]</span>}
                {log.type === 'success' && <span className="text-green-400 font-bold">[SUCCESS]</span>}
                {log.type === 'error' && <span className="text-red-400 font-bold">[ERROR]</span>}
                {log.type === 'warn' && <span className="text-yellow-400">[WARN]</span>}
                <span
                  className={
                    log.type === 'error'
                      ? 'text-red-300'
                      : log.type === 'success'
                      : 'text-gray-200'
                      : 'text-gray-400'
                  }
                >
                  {log.text}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
