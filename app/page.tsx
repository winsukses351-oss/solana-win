'use client';
import useSWR from 'swr';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: status, error: statusErr } = useSWR('/api/system/status', fetcher, { refreshInterval: 5000 });
  const { data: settings } = useSWR('/api/settings', fetcher);

  if (!status) return <div className="animate-pulse flex gap-4"><div className="h-32 w-full bg-surface rounded-lg"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Dashboard</h1>
      
      {status.killSwitch && (
        <div className="bg-danger/20 border border-danger text-danger p-4 rounded-lg flex items-center gap-3 font-bold">
          <ShieldAlert />
          KILL SWITCH ACTIVE - ALL TRADING BLOCKED
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard title="Network" value={status.network} isReady={true} />
        <StatusCard title="RPC Status" value={status.rpcStatus} isReady={status.rpcStatus === 'READY'} />
        <StatusCard title="Wallet Status" value={status.walletStatus} isReady={status.walletStatus === 'READY'} />
        <StatusCard title="Trading Engine" value={status.tradingStatus} isReady={status.tradingStatus === 'READY'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface p-6 rounded-lg border border-neutral-800">
          <h2 className="text-neutral-400 text-sm font-semibold mb-4">Live Wallet Info</h2>
          {status.walletAddress ? (
            <div className="space-y-2">
              <p className="text-sm break-all font-mono text-neutral-300">{status.walletAddress}</p>
              <p className="text-2xl font-bold">{status.walletBalanceSol.toFixed(4)} SOL</p>
            </div>
          ) : (
            <p className="text-warning">NOT CONFIGURED</p>
          )}
        </div>
        
        <div className="bg-surface p-6 rounded-lg border border-neutral-800">
          <h2 className="text-neutral-400 text-sm font-semibold mb-4">Compounding & Risk</h2>
          {settings ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Base Capital:</span> <span className="font-mono">${settings.startingCapitalUsd}</span></div>
              <div className="flex justify-between"><span>Risk / Trade:</span> <span className="font-mono">{settings.riskPerTradePercent}%</span></div>
              <div className="flex justify-between"><span>Compounding:</span> <span className={settings.compoundingEnabled ? 'text-success' : 'text-neutral-500'}>{settings.compoundingEnabled ? 'ENABLED' : 'DISABLED'}</span></div>
            </div>
          ) : <p className="text-neutral-500">DATA_UNAVAILABLE</p>}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, isReady }: { title: string, value: string, isReady: boolean }) {
  return (
    <div className="bg-surface p-6 rounded-lg border border-neutral-800">
      <h3 className="text-neutral-400 text-sm font-medium">{title}</h3>
      <div className="mt-2 flex items-center gap-2">
        {isReady ? <CheckCircle2 className="text-success" size={20} /> : <XCircle className="text-danger" size={20} />}
        <span className={isReady ? 'text-white font-bold' : 'text-danger font-bold'}>{value}</span>
      </div>
    </div>
  );
}
