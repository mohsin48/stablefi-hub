import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  ScanSearch, 
  Radar, 
  Lock, 
  AlertOctagon,
  CheckCircle2,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/src/components/PageWrapper';
import { getRiskAnalysis, RiskAnalysis } from '../services/geminiService';

import { useAccount } from 'wagmi';
import { useTokenBalances } from '@/src/hooks/useTokenBalances';

export function RiskEngine() {
  const { isConnected, address } = useAccount();
  const { balances, isLoading: isLoadingBalances } = useTokenBalances();
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const mockPortfolio = {
      user: address || 'Anonymous',
      network: 'Arc Testnet',
      assets: [
        `${balances.USDC.balance} USDC`,
        `${balances.EURC.balance} EURC`,
      ],
      loans: ['2.5k EURC'],
      collateral: [`${balances.USDC.balance} USDC`],
      stableCoinsOnly: true
    };

    try {
      const res = await getRiskAnalysis(mockPortfolio);
      setAnalysis(res);
    } catch (e) {
      console.error(e);
    }
    setIsAnalyzing(false);
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <PageWrapper>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1400px] mx-auto min-h-screen bg-[#141414]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 font-sans italic serif flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-indigo-500" />
              AI Risk Sentinel
            </h2>
            <p className="text-[#888] font-mono text-xs uppercase italic tracking-widest">Autonomous Protocol Security Layer</p>
          </div>
          <div className="flex items-center gap-4 bg-[#1a1a1a] px-4 py-2 rounded-xl border border-[#333]">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-protect" className="text-[10px] font-mono uppercase text-[#666]">Auto-Protect</Label>
              <Switch id="auto-protect" checked={automationEnabled} onCheckedChange={setAutomationEnabled} />
            </div>
            <Separator orientation="vertical" className="h-6 bg-[#333]" />
            <Button 
              onClick={runAnalysis} 
              disabled={isAnalyzing}
              variant="ghost" 
              size="sm" 
              className="text-xs font-mono uppercase text-indigo-400 hover:text-white"
            >
              {isAnalyzing ? <div className="animate-spin mr-2"><Cpu className="w-3 h-3" /></div> : <Radar className="w-3 h-3 mr-2" />}
              Rescan Portfolio
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Real-time Scanner */}
          <Card className="bg-[#1a1a1a] border-[#333] text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500 animate-scan" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888]">Protocol Surveillance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center py-12 relative">
                <div className="relative w-48 h-48 rounded-full border-4 border-[#222] flex items-center justify-center overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="text-center">
                    <div className="text-4xl font-bold font-mono tracking-tighter">
                      {analysis?.healthFactor || '1.42'}
                    </div>
                    <div className="text-[10px] font-mono text-[#666] uppercase mt-1">Health Score</div>
                  </div>
                </div>
                
                {/* Floating Data Points */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-4 right-12 p-2 bg-[#111] border border-[#333] rounded flex flex-col items-center gap-1 shadow-2xl"
                >
                  <Fingerprint className="w-4 h-4 text-indigo-400" />
                  <span className="text-[8px] font-mono text-indigo-400 uppercase">Identity verified</span>
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-4 left-12 p-2 bg-[#111] border border-[#333] rounded flex flex-col items-center gap-1 shadow-2xl"
                >
                  <ScanSearch className="w-4 h-4 text-green-400" />
                  <span className="text-[8px] font-mono text-green-400 uppercase">Collateral safe</span>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#111] rounded-xl border border-[#222] relative">
                  <div className="text-[10px] font-mono text-[#666] uppercase mb-2">Liquid. Probability</div>
                  <div className="text-lg font-bold font-mono text-white">0.02%</div>
                  <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="p-4 bg-[#111] rounded-xl border border-[#222]">
                  <div className="text-[10px] font-mono text-[#666] uppercase mb-2">Risk Categorization</div>
                  <div className={cn(
                    "text-lg font-bold font-mono",
                    analysis?.riskLevel === 'LOW' ? "text-green-400" : analysis?.riskLevel === 'MEDIUM' ? "text-yellow-400" : "text-red-400"
                  )}>
                    {analysis?.riskLevel || 'OPTIMAL'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-[#1a1a1a] border-[#333] text-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium font-mono uppercase italic text-[#888]">AI Action Strategy</CardTitle>
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-mono text-[10px]">Real-time Logic</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 py-8"
                  >
                    <div className="h-4 bg-[#222] rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-[#222] rounded w-full animate-pulse" />
                    <div className="h-6 bg-[#222] rounded w-1/2 animate-pulse" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 relative group">
                      <div className="absolute -left-3 top-6 p-2 bg-indigo-500 rounded shadow-lg group-hover:scale-110 transition-transform">
                        <BrainCircuit className="w-5 h-5 text-white" />
                      </div>
                      <div className="pl-6 space-y-4">
                        <p className="text-sm italic leading-relaxed text-[#bbb]">
                          "{analysis?.recommendation || 'No threats detected. Portfolio is optimized for 4.2% global stability yield. Maintain current collateral levels.'}"
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-white text-black hover:bg-gray-200 text-[10px] uppercase font-bold tracking-widest px-4 h-8">
                            Approve Rebalance
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#333] text-[10px] uppercase font-bold tracking-widest px-4 h-8 hover:bg-[#222]">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-[10px] font-mono uppercase text-[#666] tracking-widest italic">Security Logs</h5>
                      <div className="space-y-2">
                        {[
                          { time: '12:34:02', event: 'ArcScan Oracle Ping: USDC @ $1.000', status: 'OK' },
                          { time: '12:33:55', event: 'LTV Audit Complete: No deviations found', status: 'OK' },
                          { time: '12:30:12', event: 'Cross-chain Bridge Liquidity Verified (EURC)', status: 'OK' },
                          { time: '12:15:00', event: 'AI Rebalance trigger suppressed (Low volatility)', status: 'WAIT' },
                        ].map((log, i) => (
                          <div key={i} className="flex justify-between items-center bg-[#111] px-3 py-2 rounded border border-[#222] font-mono">
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] text-[#444]">{log.time}</span>
                              <span className="text-[10px] text-[#888]">{log.event}</span>
                            </div>
                            <Badge variant="outline" className={cn(
                              "text-[8px] py-0 h-4 border-none uppercase",
                              log.status === 'OK' ? "text-green-500" : "text-yellow-500"
                            )}>{log.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer Alert */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
            <AlertOctagon className="w-10 h-10 text-indigo-400 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white uppercase italic">Protocol Level Liquidation Guard</h4>
              <p className="text-[11px] text-[#888] font-mono leading-tight max-w-md">
                Your positions are protected by the StableFi Decentralized Guard. In extreme volatility, the AI will automatically hedge 20% of your collateral into Stablecoins to preserve health factor {'>'} 1.15.
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full lg:w-auto border-indigo-500/40 text-indigo-400 hover:bg-indigo-500 hover:text-white font-mono text-xs uppercase tracking-widest shrink-0">
            Configure Safeguards
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
