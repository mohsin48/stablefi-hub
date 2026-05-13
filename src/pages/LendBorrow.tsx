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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

  // Local state to track simulated positions
  const [suppliedBalances, setSuppliedBalances] = useState<Record<string, number>>({ USDC: 0, EURC: 0 });
  const [borrowedBalances, setBorrowedBalances] = useState<Record<string, number>>({ USDC: 0, EURC: 0 });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'Deposit' | 'Borrow' | null>(null);
  const [modalAsset, setModalAsset] = useState<string>('USDC');
  const [amountInput, setAmountInput] = useState('');

  const openModal = (action: 'Deposit' | 'Borrow', asset: string) => {
    setModalAction(action);
    setModalAsset(asset);
    setAmountInput('');
    setIsModalOpen(true);
  };

  const handleAction = async () => {
    if (!amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0) return;
    
    setIsModalOpen(false);
    await executeAction(`${modalAction} ${modalAsset}`);
    
    const val = Number(amountInput);
    if (modalAction === 'Deposit') {
      setSuppliedBalances(prev => ({ ...prev, [modalAsset]: prev[modalAsset] + val }));
    } else if (modalAction === 'Borrow') {
      setBorrowedBalances(prev => ({ ...prev, [modalAsset]: prev[modalAsset] + val }));
    }
    setAmountInput('');
  };

  const handleQuickDeposit = async () => {
    await executeAction('Auto-Deposit USDC');
    setSuppliedBalances(prev => ({ ...prev, USDC: prev.USDC + 100 }));
  };

  const lendAssets = [
    { symbol: 'USDC', balance: balances.USDC.balance, apy: '4.52%', tvl: '$124M' },
    { symbol: 'EURC', balance: balances.EURC.balance, apy: '3.80%', tvl: '$42M' },
  ];

  const borrowAssets = [
    { asset: 'USDC', apy: '5.2%', liquidity: '$420k' },
    { asset: 'EURC', apy: '4.8%', liquidity: '$120k' },
  ];

  // Derived metrics
  const totalSupplied = suppliedBalances.USDC + suppliedBalances.EURC;
  const borrowLimit = totalSupplied * 0.8; // 80% LTV
  const totalBorrowed = borrowedBalances.USDC + borrowedBalances.EURC;
  const canBorrow = totalSupplied > 0;

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
                  <div className="text-lg font-bold font-mono text-indigo-400">${totalSupplied.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#666] uppercase">Borrow Limit</div>
                  <div className="text-lg font-bold font-mono text-white">${borrowLimit.toFixed(2)}</div>
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
                            <TableCell className="font-bold py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#333] flex items-center justify-center font-mono text-[10px]">{asset.symbol[0]}</div>
                                <div className="font-mono">
                                  {asset.symbol}
                                  {suppliedBalances[asset.symbol] > 0 && (
                                    <div className="text-[10px] text-green-400 mt-1">Supplied: {suppliedBalances[asset.symbol]}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-[#888]">{isLoading ? '...' : asset.balance}</TableCell>
                            <TableCell className="font-mono text-xs text-green-400">{asset.apy}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-[#333] hover:bg-white hover:text-black font-mono text-[10px] uppercase h-8"
                                onClick={() => openModal('Deposit', asset.symbol)}
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
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest h-10" onClick={handleQuickDeposit}>
                      Quick Deposit $100 USDC
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
                      <div className="text-3xl font-bold font-mono tracking-tighter">
                        {totalBorrowed === 0 ? '∞' : (borrowLimit / totalBorrowed).toFixed(2)}
                      </div>
                      <p className="text-[10px] font-mono text-[#666] uppercase">Current Health Factor</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg flex gap-3 italic">
                      <Lock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      <p className="text-[10px] text-indigo-400 font-mono leading-tight uppercase">
                        {canBorrow 
                          ? `You have a total borrow limit of $${borrowLimit.toFixed(2)} based on your supplied collateral.`
                          : `No active debt. You have ${isLoading ? '...' : `${balances.USDC.balance} USDC & ${balances.EURC.balance} EURC`} available in your wallet. Deposit assets to borrow against them.`}
                      </p>
                    </div>
                    
                    {totalBorrowed > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-[#888]">Borrow Power Used</span>
                          <span className={totalBorrowed > borrowLimit * 0.8 ? 'text-red-400' : 'text-green-400'}>
                            {((totalBorrowed / borrowLimit) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={(totalBorrowed / borrowLimit) * 100} className="h-1 bg-[#333]" />
                      </div>
                    )}
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
                            <TableCell className="font-mono py-4">
                              <div className="text-sm font-bold">{loan.asset}</div>
                              <div className="text-[10px] text-[#666] uppercase">Available: {loan.liquidity}</div>
                              {borrowedBalances[loan.asset] > 0 && (
                                <div className="text-[10px] text-red-400 mt-1">Borrowed: {borrowedBalances[loan.asset]}</div>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-red-500">{loan.apy}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-[#333] hover:bg-red-500/10 hover:text-red-500 font-mono text-[10px] uppercase h-8"
                                disabled={!canBorrow || (totalBorrowed >= borrowLimit)}
                                onClick={() => openModal('Borrow', loan.asset)}
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

        {/* Interaction Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase tracking-widest">{modalAction} {modalAsset}</DialogTitle>
              <DialogDescription className="text-[#888]">
                {modalAction === 'Deposit' 
                  ? `Enter the amount of ${modalAsset} you want to supply as collateral.`
                  : `Enter the amount of ${modalAsset} you want to borrow against your collateral.`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="number"
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="bg-[#222] border-[#333] font-mono text-lg"
              />
              {modalAction === 'Borrow' && (
                <p className="text-[10px] text-[#666] font-mono mt-2 text-right">Max borrow limit: ${(borrowLimit - totalBorrowed).toFixed(2)}</p>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-[#333] hover:bg-[#333]"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className={modalAction === 'Deposit' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-red-600 hover:bg-red-500'}
                onClick={handleAction}
                disabled={!amountInput || isTxPending}
              >
                Confirm {modalAction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PageWrapper>
  );
}

function assetIcon(asset: string) {
  if (asset === 'USDC') return '🔵';
  if (asset === 'EURC') return '🟡';
  return '⚪';
}
