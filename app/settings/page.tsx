'use client';

export default function SettingsPage() {
  return (
    <div className="p-6 text-white w-full max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">Konfigurasi Sistem</h1>
      
      <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg space-y-6">
        <div>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">Manajemen Risiko</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Skor Minimal Token (0-100)</label>
              <input type="number" defaultValue={75} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Minimal Likuiditas (USD)</label>
              <input type="number" defaultValue={5000} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Maksimal Posisi Terbuka</label>
              <input type="number" defaultValue={3} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Batas Kerugian Harian (USD)</label>
              <input type="number" defaultValue={50} className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <button className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-800 rounded hover:bg-red-600/40 font-bold transition">
            AKTIFKAN KILL SWITCH
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold transition">
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
