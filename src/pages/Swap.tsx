import React, { useState, useEffect } from 'react';
import { 
  ArrowDown, 
  Settings2, 
  Info, 
  RotateCcw, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { PageWrapper } from '@/src/components/PageWrapper';

const tokens = [
  { symbol: 'USDC', name: 'USD Coin', icon: '🔵' },
  { symbol: 'EURC', name: 'Euro Coin', icon: '🟡' },
];

import { useWallet } from '@/src/hooks/useWallet';
import { useSwap } from '@/src/hooks/useSwap';
import { useTokenBalances } from '@/src/hooks/useTokenBalances';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Swap() {
  const { isConnected } = useWallet();
  const { handleSwap, isSwapping, isSuccess: isSwapSuccess } = useSwap();
  const { balances, isLoading: isLoadingBalances } = useTokenBalances();
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('EURC');
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const currentFromBalance = balances[fromToken]?.balance || '0.00';
  const currentToBalance = balances[toToken]?.balance || '0.00';

  // Sync success state for animation
  useEffect(() => {
    if (isSwapSuccess) {
      setIsSuccess(true);
      const timer = setTimeout(() => setIsSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSwapSuccess]);

  const onSwapClick = async () => {
    const direction = fromToken === 'USDC' ? 'USDC_TO_EURC' : 'EURC_TO_USDC';
    await handleSwap(amount, direction as 'USDC_TO_EURC' | 'EURC_TO_USDC');
  };

  const exchangeRate = fromToken === 'USDC' && toToken === 'EURC' ? 0.92 : 1.08;
  const receiveAmount = amount ? (parseFloat(amount) * exchangeRate).toFixed(2) : '0.00';

  return (
    <PageWrapper>
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#141414]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#1a1a1a] border-[#333] shadow-2xl overflow-hidden relative">
            <CardHeader className="border-b border-[#222]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-sans italic">
                  Swap
                </CardTitle>
                <div className="flex gap-2">
                  <ConnectButton showBalance={false} chainStatus="icon" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!isConnected ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <p className="text-[#666] font-mono text-center text-xs uppercase italic">Authentication required to access swap market</p>
                  <ConnectButton />
                </div>
              ) : (
                <>
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-widest">You Pay</label>
                    <span className="text-[10px] font-mono text-[#444]">Balance: {isLoadingBalances ? '...' : currentFromBalance} {fromToken}</span>
                  </div>
                  <div className="relative group">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-16 bg-[#111] border-[#222] text-2xl font-bold font-mono placeholder:text-[#333] focus:ring-1 focus:ring-white/20 transition-all rounded-xl"
                    />
                    <div className="absolute right-3 top-3">
                      <Button variant="outline" className="bg-[#1a1a1a] border-[#333] hover:bg-[#222] text-xs font-bold uppercase rounded-lg">
                        {fromToken} <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full bg-[#1a1a1a] border-[#333] h-10 w-10 hover:bg-white hover:text-black transition-all shadow-xl"
                    onClick={() => {
                      const temp = fromToken;
                      setFromToken(toToken);
                      setToToken(temp);
                    }}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-mono text-[#666] uppercase tracking-widest">You Receive</label>
                    <span className="text-[10px] font-mono text-[#444]">Balance: {isLoadingBalances ? '...' : currentToBalance} {toToken}</span>
                  </div>
                  <div className="relative">
                    <div className="h-16 bg-[#111] border border-[#222] rounded-xl flex items-center px-4 justify-between">
                      <div className="text-2xl font-bold font-mono text-white/50">
                        {receiveAmount}
                      </div>
                      <Button variant="outline" className="bg-[#1a1a1a] border-[#333] hover:bg-[#222] text-xs font-bold uppercase rounded-lg">
                        {toToken} <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#111] rounded-xl border border-[#222] space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#666]">
                    <div className="flex items-center gap-1">
                      Price <Info className="w-3 h-3" />
                    </div>
                    <span className="text-[#888]">1 {fromToken} = {exchangeRate} {toToken}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#666]">
                    <span>Slippage Tolerance</span>
                    <span className="text-[#888]">0.5%</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#666]">
                    <span>Gas Price</span>
                    <span className="text-green-500 font-mono tracking-tighter italic">Arc Ultra-Fast (Fixed USDC)</span>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-white text-black hover:bg-gray-200 text-sm font-bold uppercase tracking-widest rounded-xl relative overflow-hidden"
                  disabled={!amount || isSwapping}
                  onClick={onSwapClick}
                >
                  {isSwapping ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : isSuccess ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Swap Complete
                    </div>
                  ) : (
                    'Confirm Swap'
                  )}
                </Button>
                </>
              )}
            </CardContent>


            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-xl"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Success!</h3>
                      <p className="text-sm text-[#888] font-mono">Settled on Arc in 0.4s</p>
                    </div>
                    <Button variant="link" className="text-xs text-[#666] font-mono hover:text-white p-0 h-auto" onClick={() => window.open('https://testnet.arcscan.app/', '_blank')}>
                      View Transaction on Explorer
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
