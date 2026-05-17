import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu,
  X,
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
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ArrowLeftRight, label: 'Swap', path: '/swap' },
  { icon: Coins, label: 'Lend & Borrow', path: '/lend-borrow' },
  { icon: SendHorizontal, label: 'Payments', path: '/payments' },
  { icon: ShieldAlert, label: 'Risk Engine', path: '/risk' },
];

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address } = useAccount();

  // Close menu when a navigation item is clicked
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-[#141414] border-b border-[#333] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <TrendingUp className="text-black w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">StableFi</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 text-[#888] hover:text-white hover:bg-[#222] rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
              onClick={closeMenu}
            />

            {/* Slide-out Menu */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80vw] max-w-sm bg-[#141414] border-l border-[#333] z-[70] flex flex-col md:hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-[#333]">
                <h2 className="font-bold text-white tracking-tight">Menu</h2>
                <button 
                  onClick={closeMenu}
                  className="p-2 text-[#888] hover:text-white hover:bg-[#222] rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 flex justify-center border-b border-[#222]">
                <ConnectButton />
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="text-[10px] font-mono text-[#666] uppercase mb-4 px-2 italic">Main Terminal</div>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
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

              <div className="p-4 border-t border-[#222] space-y-2 bg-[#1A1A1A]">
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
                
                <div className="mt-4 p-3 bg-[#111] rounded-lg border border-[#333]">
                  <div className="text-[10px] text-[#666] uppercase italic font-mono mb-1">Network Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono text-white">Arc Testnet (Active)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
