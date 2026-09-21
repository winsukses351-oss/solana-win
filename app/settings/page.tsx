'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ShieldAlert } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SettingsPage() {
  const { data, mutate } = useSWR('/api/settings', fetcher);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    await mutate();
    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface p-6 rounded-lg border border-neutral-800 space-y-4">
           <div className="flex items-center justify-between p-4 bg-danger/10 border border-danger/20 rounded-md">
             <div>
               <h3 className="font-bold text-danger flex items-center gap-2"><ShieldAlert size={18}/> KILL SWITCH</h3>
               <p className="text-sm text-danger/80">Immediately block all trades and close logic.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" name="killSwitch" checked={form.killSwitch || false} onChange={handleChange} className="sr-only peer" />
               <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
             </label>
           </div>

           <div className="flex items-center justify-between py-2 border-b border-neutral-800">
             <span>Live Trading Enabled</span>
             <input type="checkbox" name="tradingEnabled" checked={form.tradingEnabled || false} onChange={handleChange} className="w-5 h-5 accent-primary" />
           </div>
           
           <div className="flex items-center justify-between py-2 border-b border-neutral-800">
             <span>Compounding Enabled</span>
             <input type="checkbox" name="compoundingEnabled" checked={form.compoundingEnabled || false} onChange={handleChange} className="w-5 h-5 accent-primary" />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-sm text-neutral-400">Starting Capital USD</label>
               <input type="number" step="0.1" name="startingCapitalUsd" value={form.startingCapitalUsd || ''} onChange={handleChange} className="w-full bg-background border border-neutral-700 rounded p-2 text-white" />
             </div>
             <div>
               <label className="text-sm text-neutral-400">Risk Per Trade %</label>
               <input type="number" step="0.1" name="riskPerTradePercent" value={form.riskPerTradePercent || ''} onChange={handleChange} className="w-full bg-background border border-neutral-700 rounded p-2 text-white" />
             </div>
             <div>
               <label className="text-sm text-neutral-400">Min Score (0-100)</label>
               <input type="number" name="minScore" value={form.minScore || ''} onChange={handleChange} className="w-full bg-background border border-neutral-700 rounded p-2 text-white" />
             </div>
             <div>
               <label className="text-sm text-neutral-400">Max Open Positions</label>
               <input type="number" name="maxOpenPositions" value={form.maxOpenPositions || ''} onChange={handleChange} className="w-full bg-background border border-neutral-700 rounded p-2 text-white" />
             </div>
           </div>
        </div>

        <button disabled={saving} type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded transition-colors">
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
