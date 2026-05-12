import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  Activity,
  Zap,
  Lock,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/src/components/PageWrapper';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/src/hooks/useWallet';
import { useDeFiActions } from '@/src/hooks/useDeFiActions';
import { useTokenBalances } from '@/src/hooks/useTokenBalances';

export function LendBorrow() {
  const { isConnected } = useWallet();
  const { balances, isLoading } = useTokenBalances();
  const { executeAction, isPending: isTxPending } = useDeFiActions();
  const [activeTab, setActiveTab] = useState('lend');

  const handleAction = async (action: string, asset: string) => {
    await executeAction(`${action} ${asset}`);
  };

  const lendAssets = [
    { symbol: 'USDC', balance: balances.USDC.balance, apy: '4.52%', tvl: '$124M' },
    { symbol: 'EURC', balance: balances.EURC.balance, apy: '3.80%', tvl: '$42M' },
  ];

  const borrowAssets = [
    { asset: 'USDC', apy: '5.2%', liquidity: '$420k' },
    { asset: 'EURC', apy: '4.8%', liquidity: '$120k' },
  ];

  return (
    <PageWrapper>
      <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
        <header className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-white font-sans italic serif">Liquidity Market</h2>
            <div className="flex items-center gap-4">
              <p className="text-[#888] font-mono text-xs uppercase italic tracking-widest">Protocol Health: Optimal</p>
              <div className="flex items-center gap-2 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span className="text-[10px] text-green-500 font-mono font-bold uppercase">Audited by Arc Core</span>
              </div>
            </div>
          </div>
          <ConnectButton />
        </header>

        {!isConnected ? (
          <div className="py-24 flex flex-col items-center justify-center gap-6 border border-[#333] rounded-2xl bg-[#1a1a1a]/40 border-dashed">
            <Lock className="w-12 h-12 text-[#222]" />
            <div className="text-center">
              <h3 className="text-xl font-bold italic serif">Market Locked</h3>
              <p className="text-[#666] font-mono text-xs uppercase tracking-widest">Connect wallet to view supply/borrow rates</p>
            </div>
            <ConnectButton />
          </div>
        ) : (
          <Tabs defaultValue="lend" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-[#1a1a1a] border border-[#333] p-1">
                <TabsTrigger value="lend" className="data-[state=active]:bg-white data-[state=active]:text-black font-mono text-xs uppercase tracking-wider px-8">Lending</TabsTrigger>
                <TabsTrigger value="borrow" className="data-[state=active]:bg-white data-[state=active]:text-black font-mono text-xs uppercase tracking-wider px-8">Borrowing</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#666] uppercase">Supply Balance</div>
                  <div className="text-lg font-bold font-mono text-indigo-400">$0.00</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#666] uppercase">Borrow Limit</div>
                  <div className="text-lg font-bold font-mono text-white">$0.00</div>
                </div>
              </div>
            </div>

            <TabsContent value="lend" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-[#1a1a1a] border-[#333] text-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888]">Available Assets to Lend</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="border-[#222]">
                        <TableRow className="hover:bg-transparent border-[#222]">
                          <TableHead className="font-mono text-[10px] uppercase text-[#444]">Asset</TableHead>
                          <TableHead className="font-mono text-[10px] uppercase text-[#444]">Wallet Balance</TableHead>
                          <TableHead className="font-mono text-[10px] uppercase text-[#444]">APY</TableHead>
                          <TableHead className="font-mono text-[10px] uppercase text-[#444] text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lendAssets.map((asset) => (
                          <TableRow key={asset.symbol} className="border-[#222] hover:bg-[#222] transition-colors group">
                            <TableCell className="font-bold">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#333] flex items-center justify-center font-mono text-[10px]">{asset.symbol[0]}</div>
                                <div className="font-mono">{asset.symbol}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-[#888]">{isLoading ? '...' : asset.balance}</TableCell>
                            <TableCell className="font-mono text-xs text-green-400">{asset.apy}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-[#333] hover:bg-white hover:text-black font-mono text-[10px] uppercase h-8"
                                onClick={() => handleAction('Deposit', asset.symbol)}
                              >
                                Deposit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="bg-indigo-900/10 border-indigo-500/20 text-white flex flex-col justify-between overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="w-32 h-32 text-indigo-500 rotate-12" />
                  </div>
                  <CardHeader>
                    <Badge className="w-fit bg-indigo-500 text-white border-none mb-2 font-mono text-[9px] uppercase tracking-tighter">AI Insight</Badge>
                    <CardTitle className="text-lg font-bold font-sans italic">Yield Optimizer</CardTitle>
                    <CardDescription className="text-[#888] text-xs font-mono italic leading-relaxed">
                      Arc Testnet faucet USDC is currently yielding 4.5% APY. We recommend depositing to earn cross-chain loyalty points.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest h-10" onClick={() => handleAction('Auto-Deposit', 'USDC')}>
                      Quick Deposit USDC
                    </Button>
                    <p className="text-[9px] font-mono text-[#666] text-center uppercase">Fixed Arc Gas Fee applies</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="borrow" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#1a1a1a] border-[#333] text-white overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50" />
                  <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                      <CardTitle className="text-xs font-mono uppercase italic text-[#888]">Risk Monitor</CardTitle>
                      <Activity className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold font-mono tracking-tighter">∞</div>
                      <p className="text-[10px] font-mono text-[#666] uppercase">Current Health Factor</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg flex gap-3 italic">
                      <Lock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      <p className="text-[10px] text-indigo-400 font-mono leading-tight uppercase">
                        No active debt. You have {isLoading ? '...' : `${balances.USDC.balance} USDC & ${balances.EURC.balance} EURC`} available. Deposit assets to borrow against them.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-[#1a1a1a] border-[#333] text-white">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888]">Borrow Assets</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="border-[#222]">
                        <TableRow className="hover:bg-transparent border-[#222]">
                          <TableHead className="font-mono text-[10px] uppercase text-[#444]">Asset</TableHead>
                          <TableHead className="font-mono text-[10px] uppercase text-[#444]">Variable APY</TableHead>
                          <TableHead className="font-mono text-[10px] uppercase text-[#444] text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {borrowAssets.map((loan) => (
                          <TableRow key={loan.asset} className="border-[#222] hover:bg-[#222] transition-colors group">
                            <TableCell className="font-mono py-6">
                              <div className="text-sm font-bold">{loan.asset}</div>
                              <div className="text-[10px] text-[#666] uppercase">Available: {loan.liquidity}</div>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-red-500">{loan.apy}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-[#333] hover:bg-red-500/10 hover:text-red-500 font-mono text-[10px] uppercase h-8"
                                disabled
                              >
                                Borrow
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageWrapper>
  );
}


function assetIcon(asset: string) {
  if (asset === 'USDC') return '🔵';
  if (asset === 'EURC') return '🟡';
  return '⚪';
}
