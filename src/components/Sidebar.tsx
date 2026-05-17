import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Coins, 
  SendHorizontal, 
  ShieldAlert, 
  Settings, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ArrowLeftRight, label: 'Swap', path: '/swap' },
  { icon: Coins, label: 'Lend & Borrow', path: '/lend-borrow' },
  { icon: SendHorizontal, label: 'Payments', path: '/payments' },
  { icon: ShieldAlert, label: 'Risk Engine', path: '/risk' },
];

import { useAccount } from 'wagmi';

export function Sidebar() {
  const { isConnected, address } = useAccount();

  return (
    <div className="hidden md:flex w-64 h-screen bg-[#141414] text-white flex-col border-r border-[#333]">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <TrendingUp className="text-black w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">StableFi Hub</h1>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        <div className="text-[10px] font-mono text-[#666] uppercase mb-4 px-2 italic">Main Terminal</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-white text-black" 
                  : "text-[#888] hover:bg-[#222] hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#222] space-y-2">
        {isConnected && (
          <div className="mb-4 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
            <div className="text-[9px] text-indigo-400 font-mono uppercase italic mb-1">Authenticated Wallet</div>
            <div className="text-[11px] font-mono text-white truncate">{address}</div>
          </div>
        )}
        
        <div className="flex items-center gap-3 px-3 py-2 text-[#666] hover:text-white cursor-pointer transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-xs font-medium">Settings</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 text-[#666] hover:text-white cursor-pointer transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Support</span>
        </div>
        
        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
          <div className="text-[10px] text-[#666] uppercase italic font-mono mb-1">Network Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-mono">Arc Testnet (Active)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
