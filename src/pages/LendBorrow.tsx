import React, { useState, useEffect } from 'react';
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
  ArrowDownRight,
  Loader2,
  Wallet
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
import { motion, AnimatePresence } from 'motion/react';
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

  // Local state to track simulated positions, initialized from localStorage
  const [suppliedBalances, setSuppliedBalances] = useState<Record<string, number>>({ USDC: 0, EURC: 0 });
  const [borrowedBalances, setBorrowedBalances] = useState<Record<string, number>>({ USDC: 0, EURC: 0 });
  
  useEffect(() => {
    const storedSupply = localStorage.getItem('mockSuppliedBalances');
    const storedBorrow = localStorage.getItem('mockBorrowedBalances');
    if (storedSupply) setSuppliedBalances(JSON.parse(storedSupply));
    if (storedBorrow) setBorrowedBalances(JSON.parse(storedBorrow));
  }, []);

  const saveState = (newSupply: Record<string, number>, newBorrow: Record<string, number>) => {
    setSuppliedBalances(newSupply);
    setBorrowedBalances(newBorrow);
    localStorage.setItem('mockSuppliedBalances', JSON.stringify(newSupply));
    localStorage.setItem('mockBorrowedBalances', JSON.stringify(newBorrow));
  };

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
    
    await executeAction(`${modalAction} ${modalAsset}`);
    
    const val = Number(amountInput);
    let newSupply = { ...suppliedBalances };
    let newBorrow = { ...borrowedBalances };

    if (modalAction === 'Deposit') {
      newSupply[modalAsset] += val;
    } else if (modalAction === 'Borrow') {
      newBorrow[modalAsset] += val;
    }
    
    saveState(newSupply, newBorrow);
    setAmountInput('');
    setIsModalOpen(false); // Close modal only after completion
  };

  const handleQuickDeposit = async () => {
    await executeAction('Auto-Deposit USDC');
    let newSupply = { ...suppliedBalances };
    newSupply.USDC += 100;
    saveState(newSupply, borrowedBalances);
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
      <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto min-h-screen">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
          <div className="flex flex-col gap-3">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-white"
            >
              Liquidity Market
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium tracking-wide">Protocol Health: Optimal</span>
              </div>
            </motion.div>
          </div>
          <ConnectButton />
        </header>

        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.div 
              key="locked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1E1E1E] to-[#121212] border border-[#2A2A2A] p-12 text-center shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center border border-[#3A3A3A] shadow-inner mb-2">
                    <Wallet className="w-8 h-8 text-[#888]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Market Locked</h3>
                    <p className="text-[#888] text-sm max-w-md mx-auto">
                      Connect your wallet to access the decentralized money market, view live rates, and manage your liquidity positions.
                    </p>
                  </div>
                  <div className="pt-4">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="market"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-[#888] mb-1">Total Supplied</div>
                    <div className="text-3xl font-bold text-white">${totalSupplied.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-[#888] mb-1">Borrow Limit</div>
                    <div className="text-3xl font-bold text-indigo-400">${borrowLimit.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-sm font-medium text-[#888] mb-1">Total Borrowed</div>
                    <div className="text-3xl font-bold text-rose-400">${totalBorrowed.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-emerald-500/10 to-transparent" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-[#888] mb-1">Health Factor</div>
                        <div className="text-3xl font-bold text-emerald-400">
                          {totalBorrowed === 0 ? '∞' : (borrowLimit / totalBorrowed).toFixed(2)}
                        </div>
                      </div>
                      <Activity className="w-5 h-5 text-emerald-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="lend" className="w-full" onValueChange={setActiveTab}>
                <div className="flex justify-start mb-6">
                  <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A] p-1 rounded-xl">
                    <TabsTrigger 
                      value="lend" 
                      className="rounded-lg data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2 transition-all duration-300"
                    >
                      Lending Markets
                    </TabsTrigger>
                    <TabsTrigger 
                      value="borrow" 
                      className="rounded-lg data-[state=active]:bg-[#2A2A2A] data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2 transition-all duration-300"
                    >
                      Borrowing Markets
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="lend" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-[#1A1A1A] border-[#2A2A2A] shadow-xl overflow-hidden">
                      <CardHeader className="bg-[#1E1E1E] border-b border-[#2A2A2A] px-6 py-4">
                        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          Assets to Supply
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <Table className="min-w-[600px]">
                          <TableHeader>
                            <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                              <TableHead className="text-[#888] font-medium px-6 py-4">Asset</TableHead>
                              <TableHead className="text-[#888] font-medium px-6">Wallet Balance</TableHead>
                              <TableHead className="text-[#888] font-medium px-6">Supply APY</TableHead>
                              <TableHead className="text-right px-6"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lendAssets.map((asset, i) => (
                              <motion.tr 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={asset.symbol} 
                                className="border-[#2A2A2A] hover:bg-[#222222] transition-colors group"
                              >
                                <TableCell className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center font-bold text-sm shadow-inner border border-[#333]">
                                      {asset.symbol[0]}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-white">{asset.symbol}</div>
                                      {suppliedBalances[asset.symbol] > 0 && (
                                        <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                                          Supplied: {suppliedBalances[asset.symbol].toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 text-[#BBB] font-medium">
                                  {isLoading ? '...' : asset.balance}
                                </TableCell>
                                <TableCell className="px-6">
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold">
                                    {asset.apy}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right px-6">
                                  <Button 
                                    className="bg-white text-black hover:bg-gray-200 font-semibold px-6 shadow-sm transition-transform active:scale-95"
                                    onClick={() => openModal('Deposit', asset.symbol)}
                                  >
                                    Supply
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-900/40 to-[#1A1A1A] border-indigo-500/30 text-white overflow-hidden relative shadow-xl">
                      <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4">
                        <Zap className="w-48 h-48 text-indigo-400" />
                      </div>
                      <CardHeader className="relative z-10">
                        <Badge className="w-fit bg-indigo-500 hover:bg-indigo-600 text-white border-none mb-4 tracking-wide shadow-md">
                          Yield Optimizer
                        </Badge>
                        <CardTitle className="text-xl font-bold leading-tight">Maximize your returns on Arc Testnet</CardTitle>
                        <CardDescription className="text-indigo-200/70 mt-2 text-sm leading-relaxed">
                          USDC is currently yielding {lendAssets[0].apy} APY. Deposit with one click to start earning yield and loyalty points.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10 pt-4">
                        <Button 
                          className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-6 shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 active:scale-[0.98]" 
                          onClick={handleQuickDeposit}
                          disabled={isTxPending}
                        >
                          {isTxPending ? <Loader2 className="w-5 h-5 animate-spin" /> : '1-Click Deposit $100 USDC'}
                        </Button>
                        <p className="text-xs text-indigo-300/50 text-center mt-4 flex items-center justify-center gap-1">
                          <Info className="w-3 h-3" /> Standard Arc gas fees apply
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="borrow" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-[#1A1A1A] border-[#2A2A2A] shadow-xl overflow-hidden">
                      <CardHeader className="bg-[#1E1E1E] border-b border-[#2A2A2A] px-6 py-4">
                        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                          <ArrowDownRight className="w-4 h-4 text-rose-500" />
                          Assets to Borrow
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <Table className="min-w-[600px]">
                          <TableHeader>
                            <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                              <TableHead className="text-[#888] font-medium px-6 py-4">Asset</TableHead>
                              <TableHead className="text-[#888] font-medium px-6">Available Liquidity</TableHead>
                              <TableHead className="text-[#888] font-medium px-6">Borrow APY</TableHead>
                              <TableHead className="text-right px-6"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {borrowAssets.map((loan, i) => (
                              <motion.tr 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={loan.asset} 
                                className="border-[#2A2A2A] hover:bg-[#222222] transition-colors group"
                              >
                                <TableCell className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center font-bold text-sm shadow-inner border border-[#333]">
                                      {loan.asset[0]}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-white">{loan.asset}</div>
                                      {borrowedBalances[loan.asset] > 0 && (
                                        <div className="text-xs text-rose-400 mt-0.5">
                                          Borrowed: {borrowedBalances[loan.asset].toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="px-6 text-[#BBB] font-medium">
                                  {loan.liquidity}
                                </TableCell>
                                <TableCell className="px-6">
                                  <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-semibold">
                                    {loan.apy}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right px-6">
                                  <Button 
                                    variant="outline"
                                    className="border-[#333] hover:bg-rose-500 hover:text-white hover:border-rose-500 font-semibold px-6 transition-all active:scale-95"
                                    disabled={!canBorrow || (totalBorrowed >= borrowLimit)}
                                    onClick={() => openModal('Borrow', loan.asset)}
                                  >
                                    Borrow
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-xl overflow-hidden relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-400 opacity-50" />
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-[#888]" />
                          Position Risk
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 bg-[#222] border border-[#333] rounded-xl flex gap-3">
                          <Info className="w-5 h-5 text-[#888] flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#BBB] leading-relaxed">
                            {canBorrow 
                              ? `You can borrow up to $${borrowLimit.toFixed(2)} against your supplied collateral.`
                              : `No collateral supplied. You have ${isLoading ? '...' : `${balances.USDC.balance} USDC`} available. Supply assets to unlock borrowing.`}
                          </p>
                        </div>
                        
                        {totalBorrowed > 0 && (
                          <div className="space-y-3 p-4 bg-[#1E1E1E] rounded-xl border border-[#2A2A2A]">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-[#888]">Borrow Capacity Used</span>
                              <span className={totalBorrowed > borrowLimit * 0.8 ? 'text-rose-400' : 'text-emerald-400'}>
                                {((totalBorrowed / borrowLimit) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress 
                              value={(totalBorrowed / borrowLimit) * 100} 
                              className={cn("h-2", totalBorrowed > borrowLimit * 0.8 ? "bg-rose-500/20" : "bg-emerald-500/20")} 
                            />
                            <div className="flex justify-between text-xs text-[#666]">
                              <span>$0</span>
                              <span>${borrowLimit.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interaction Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!isTxPending) setIsModalOpen(open);
        }}>
          <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white shadow-2xl sm:max-w-md">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {modalAction === 'Deposit' ? <ArrowUpRight className="w-6 h-6 text-emerald-400" /> : <ArrowDownRight className="w-6 h-6 text-rose-400" />}
                {modalAction} {modalAsset}
              </DialogTitle>
              <DialogDescription className="text-[#888] text-base">
                {modalAction === 'Deposit' 
                  ? `Supply ${modalAsset} to earn yield and use it as collateral for borrowing.`
                  : `Borrow ${modalAsset} against your existing collateral. Maintain a healthy borrow limit.`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="bg-[#222] border-[#333] text-2xl h-16 pl-4 pr-20 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all"
                  disabled={isTxPending}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-[#888]">
                  {modalAsset}
                </div>
              </div>
              
              {modalAction === 'Borrow' && (
                <div className="flex justify-between items-center text-sm px-1">
                  <span className="text-[#888]">Max Available</span>
                  <span className="font-semibold text-white">${(borrowLimit - totalBorrowed).toFixed(2)}</span>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="ghost" 
                className="hover:bg-[#2A2A2A] hover:text-white text-[#888]"
                onClick={() => setIsModalOpen(false)}
                disabled={isTxPending}
              >
                Cancel
              </Button>
              <Button 
                className={cn(
                  "font-semibold min-w-[120px]",
                  modalAction === 'Deposit' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                )}
                onClick={handleAction}
                disabled={!amountInput || isTxPending || Number(amountInput) <= 0 || (modalAction === 'Borrow' && Number(amountInput) > (borrowLimit - totalBorrowed))}
              >
                {isTxPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isTxPending ? 'Processing...' : `Confirm ${modalAction}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PageWrapper>
  );
}
