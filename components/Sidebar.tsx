'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Target, Briefcase, Activity, Settings, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Scanner', href: '/scanner', icon: Search },
  { name: 'Opportunities', href: '/opportunities', icon: Target },
  { name: 'Positions', href: '/positions', icon: Briefcase },
  { name: 'Trades', href: '/trades', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="w-16 sm:w-64 bg-surface border-r border-neutral-800 flex flex-col">
      <div className="h-16 flex items-center justify-center sm:justify-start sm:px-6 font-bold text-primary border-b border-neutral-800">
        <span className="hidden sm:block">MEME HUNTER</span>
        <span className="sm:hidden">MH</span>
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className={clsx("flex items-center gap-3 p-3 rounded-md transition-colors", isActive ? "bg-primary/10 text-primary" : "text-neutral-400 hover:text-white hover:bg-neutral-800")}>
              <Icon size={20} />
              <span className="hidden sm:block">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
