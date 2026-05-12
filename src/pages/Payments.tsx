import React, { useState } from 'react';
import { 
  Send, 
  History, 
  UserPlus, 
  Globe, 
  Clock, 
  ShieldCheck, 
  MoreHorizontal,
  ChevronRight,
  Search,
  History as HistoryIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/src/components/PageWrapper';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/src/hooks/useWallet';
import { useTokenBalances } from '@/src/hooks/useTokenBalances';

export function Payments() {
  const { isConnected } = useWallet();
  const { balances, isLoading: isLoadingBalances } = useTokenBalances();
  const [recipient, setRecipient] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');

  const currentBalance = balances[currency]?.balance || '0.00';

  return (
    <PageWrapper>
      <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans italic serif">Global Pay</h2>
            <p className="text-[#888] font-mono text-xs uppercase italic tracking-widest">Cross-border Stable Settlement</p>
          </div>
          <ConnectButton />
        </header>

        {!isConnected ? (
          <div className="py-24 flex flex-col items-center justify-center gap-6 border border-[#333] rounded-2xl bg-[#1a1a1a]/40 border-dashed">
             <Globe className="w-12 h-12 text-[#222]" />
             <div className="text-center">
               <h3 className="text-xl font-bold italic serif">Settlement Rail Offline</h3>
               <p className="text-[#666] font-mono text-xs uppercase tracking-widest">Connect wallet to authorize cross-border payments</p>
             </div>
             <ConnectButton />
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* Quick Send */}
            <Card className="bg-[#1a1a1a] border-[#333] text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888]">New Transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-widest">Recipient</label>
                    <div className="relative">
                      <Input 
                        placeholder="0x... or handle" 
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="bg-[#111] border-[#222] focus:ring-indigo-500 rounded-xl pl-10"
                      />
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#444]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-mono text-[#666] uppercase tracking-widest">Currency</label>
                      <span className="text-[10px] font-mono text-[#444]">Balance: {isLoadingBalances ? '...' : currentBalance} {currency}</span>
                    </div>
                    <div className="flex gap-2">
                      {['USDC', 'EURC'].map((c) => (
                        <Button 
                          key={c}
                          variant={currency === c ? 'default' : 'outline'}
                          onClick={() => setCurrency(c)}
                          className={cn(
                            "flex-1 font-mono text-[10px] h-10 transition-all rounded-lg uppercase",
                            currency === c ? "bg-white text-black" : "border-[#222] hover:bg-[#222]"
                          )}
                        >
                          {c}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-[#666] uppercase tracking-widest">Amount</label>
                  <div className="relative">
                    <Input 
                      placeholder="0.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-20 bg-[#111] border-[#222] text-3xl font-bold font-mono placeholder:text-[#222] rounded-xl pl-6"
                    />
                    <div className="absolute right-4 top-5 text-right">
                      <div className="text-sm font-bold font-mono text-indigo-400">≈ $0.00</div>
                      <div className="text-[9px] font-mono text-[#444] uppercase">Fee: 0.05 {currency}</div>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-14 bg-white text-black hover:bg-gray-200 text-sm font-bold uppercase tracking-[0.2em] rounded-xl">
                  Execute Remittance
                </Button>
                
                <p className="text-center text-[10px] font-mono text-[#444] italic uppercase">
                  Powered by Arc Financial Rails • Sub-second finality guaranteed
                </p>
              </CardContent>
            </Card>

            {/* Contacts & Recent */}
            <Card className="bg-[#1a1a1a] border-[#333] text-white flex flex-col">
              <CardHeader className="border-b border-[#222]">
                <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888] flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4" />
                  Recent Beneficiaries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-[#222]">
                    {[
                      { name: 'Alice Schmidt', handle: '@alice_berlin', icon: 'AS', country: 'Germany', last: '2h ago' },
                      { name: 'Tanvir Ahmed', handle: '@tanvir_dhaka', icon: 'TA', country: 'Bangladesh', last: '1d ago' },
                      { name: 'Global Logistics', handle: '@logistics_pay', icon: 'GL', country: 'Multi', last: '3d ago' },
                      { name: 'Ngozi Okonjo', handle: '@ngozi_lagos', icon: 'NO', country: 'Nigeria', last: '1w ago' },
                      { name: 'Chen Wei', handle: '@chen_shanghai', icon: 'CW', country: 'China', last: '2w ago' },
                    ].map((contact, i) => (
                      <motion.div 
                        key={contact.handle}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 hover:bg-[#222] transition-colors cursor-pointer group"
                        onClick={() => setRecipient(contact.handle)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center font-mono text-xs text-[#666] group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-400 transition-all">
                            {contact.icon}
                          </div>
                          <div>
                            <div className="text-sm font-bold font-mono group-hover:text-indigo-400 transition-colors uppercase italic">{contact.name}</div>
                            <div className="text-[10px] text-[#444] font-mono">{contact.handle}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-[#666] uppercase">{contact.country}</div>
                          <div className="text-[9px] text-[#333] font-mono tracking-widest italic">{contact.last}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <div className="p-4 bg-[#222] border-t border-[#333]">
                <Button variant="outline" className="w-full text-xs text-[#888] font-mono uppercase italic border-[#333] hover:bg-[#111] hover:text-white">
                  View All History
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Global Markets */}
            <Card className="bg-[#1a1a1a] border-[#333] text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888]">Live FX Rails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { pair: 'USDC/EURC', rate: '0.9242', change: '+0.02%' },
                  { pair: 'EURC/USDC', rate: '1.0821', change: '-0.02%' },
                ].map((market) => (
                  <div key={market.pair} className="p-3 bg-[#111] rounded-lg border border-[#222] flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold font-mono">{market.pair}</div>
                      <div className="text-[9px] text-[#444] font-mono uppercase tracking-widest">Active Rail</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">{market.rate}</div>
                      <div className={cn("text-[8px] font-mono", market.change.startsWith('+') ? 'text-green-500' : 'text-red-500')}>{market.change}</div>
                    </div>
                  </div>
                ))}
                
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold font-mono uppercase italic">Settlement Time</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">420ms</div>
                  <p className="text-[9px] text-[#666] font-mono leading-tight">Current Arc Testnet latency for cross-border EURC-to-BDT conversion.</p>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Stats */}
            <Card className="bg-[#1a1a1a] border-[#333] text-white">
              <CardContent className="pt-6 space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full border border-indigo-500/20 flex items-center justify-center bg-indigo-500/5">
                     <ShieldCheck className="w-6 h-6 text-indigo-500" />
                   </div>
                   <div>
                     <div className="text-sm font-bold font-sans italic">KYC L-2 Verified</div>
                     <div className="text-[10px] font-mono text-[#666] uppercase uppercase tracking-tighter">Daily Limit: $100k</div>
                   </div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] font-mono text-[#666]">
                     <span>Remittance Quota</span>
                     <span>65%</span>
                   </div>
                   <div className="h-1 bg-[#111] rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 w-[65%]" />
                   </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-green-500 opacity-50" />
          <div>
            <h4 className="text-xs font-bold text-green-500 uppercase tracking-[0.2em]">Anti-Fraud Protocol Active</h4>
            <p className="text-[10px] text-green-500/60 font-mono italic">
              Each transaction is screened by Arc's real-time risk engine. All BDT transfers are compliant with local remittance regulations.
            </p>
          </div>
        </div>
        </>
        )}
      </div>
    </PageWrapper>
  );
}
