'use client';

import { useState, useEffect, useRef } from 'react';

interface LogItem {
  id: number;
  time: string;
  type: 'info' | 'success' | 'error' | 'warn';
  text: string;
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('-');
  const [countdown, setCountdown] = useState<number>(10);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogItem['type'], text: string) => {
    const time = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLogs((prev) => [...prev.slice(-49), { id: Date.now() + Math.random(), time, type, text }]);
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
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;

    if (isScanning) {
      addLog('info', 'Sistem Pemindaian Otomatis Diaktifkan.');
      fetchTokens();

      interval = setInterval(fetchTokens, 10000);

      timer = setInterval(() => {
        setCountdown((prev) => (prev > 1 ? prev - 1 : 10));
      }, 1000);
    } else {
