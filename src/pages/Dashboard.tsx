import React from 'react';
import { 
  CircleDollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  History,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/src/components/PageWrapper';

const data = [
  { name: '01 May', value: 12400 },
  { name: '03 May', value: 13200 },
  { name: '05 May', value: 12800 },
  { name: '07 May', value: 14500 },
  { name: '09 May', value: 14100 },
  { name: '11 May', value: 15600 },
  { name: '12 May', value: 15150 },
];

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/src/hooks/useWallet';

import { useTokenBalances } from '@/src/hooks/useTokenBalances';

export function Dashboard() {
  const { isConnected } = useWallet();
  const { balances, isLoading } = useTokenBalances();
  
  const assetsList = [
    { name: 'USDC', balance: balances.USDC.balance, value: `$${balances.USDC.balance}`, icon: 'U' },
    { name: 'EURC', balance: balances.EURC.balance, value: `€${balances.EURC.balance}`, icon: '€' },
  ];

  const totalValue = (Number(balances.USDC.balance) + Number(balances.EURC.balance) * 1.08).toFixed(2);

  return (
    <PageWrapper>
      <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans italic serif">Dashboard</h2>
            <p className="text-[#888] font-mono text-xs uppercase italic tracking-widest">Global Portfolio Command Center</p>
          </div>
          <div className="flex gap-3 items-center">
            <Button variant="outline" className="h-10 border-[#333] hover:bg-[#222] text-white hidden md:flex">
              <History className="w-4 h-4 mr-2" />
              Activity
            </Button>
            <ConnectButton />
          </div>
        </header>

        {!isConnected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 border-2 border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center text-center gap-6 bg-[#1a1a1a]/50"
          >
            <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-[#444]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-sans italic">Connect your wallet</h3>
              <p className="text-[#666] text-sm font-mono max-w-xs">Authentication required to access Arc Testnet financial rails and protocol statistics.</p>
            </div>
            <ConnectButton />
          </motion.div>
        )}

        {isConnected && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {[
            { label: 'Total Value (USD)', value: `$${totalValue}`, change: '+0.4%', icon: CircleDollarSign },
            { label: 'Available USDC', value: balances.USDC.balance, change: 'Stable', icon: Activity },
            { label: 'Available EURC', value: balances.EURC.balance, change: 'Stable', icon: Activity },
            { label: 'Settlement Node', value: 'Active', change: 'Synced', icon: ShieldCheckIcon },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-[#1a1a1a] border-[#333] text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666] italic">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-[#888]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono tracking-tighter">{isLoading ? '...' : stat.value}</div>
                  <p className={cn(
                    "text-[10px] flex items-center mt-1 font-mono text-green-400"
                  )}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 bg-[#1a1a1a] border-[#333] text-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888]">Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="white" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="white" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="JetBrains Mono"
                  />
                  <YAxis 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="JetBrains Mono"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="white" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                   />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Assets List */}
          <Card className="bg-[#1a1a1a] border-[#333] text-white overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888]">Settled Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#222]">
                {assetsList.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between p-4 hover:bg-[#222] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center font-mono text-xs bg-[#222] group-hover:bg-white group-hover:text-black transition-all">
                        {asset.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold font-mono">{asset.name}</div>
                        <div className="text-[10px] text-[#666] font-mono">{isLoading ? '...' : `${asset.balance} units`}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">{isLoading ? '...' : asset.value}</div>
                      <div className="text-[10px] text-green-500 font-mono">Real-time</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#222] border-t border-[#333]">
                <Button variant="link" className="w-full text-xs text-[#888] font-mono uppercase italic hover:text-white">
                  Only USDC & EURC Supported
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
        )}
      </div>
    </PageWrapper>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
