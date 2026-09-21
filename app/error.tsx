'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke console browser untuk memudahkan debugging
    console.error('Runtime Error:', error);
  }, [error]);

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-bold text-red-500 mb-4">Terjadi Kesalahan (Crash)</h2>
      <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6 max-w-2xl overflow-auto">
        <code>{error.message || 'Unknown error occurred'}</code>
      </div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Coba Muat Ulang
      </button>
    </div>
  );
}
