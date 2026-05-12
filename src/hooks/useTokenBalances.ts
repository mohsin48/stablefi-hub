import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { Contract, formatUnits } from 'ethers';
import { USDC_ADDRESS, EURC_ADDRESS, ERC20_ABI } from '../contracts';
import { useEthersSigner } from './useSwap';

export interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
  decimals: number;
}

export function useTokenBalances() {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const [balances, setBalances] = useState<Record<string, TokenBalance>>({
    USDC: { symbol: 'USDC', balance: '0.00', address: USDC_ADDRESS, decimals: 6 },
    EURC: { symbol: 'EURC', balance: '0.00', address: EURC_ADDRESS, decimals: 6 },
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!signer || !address) return;

    setIsLoading(true);
    try {
      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const eurcContract = new Contract(EURC_ADDRESS, ERC20_ABI, signer);

      const [usdcBal, eurcBal, usdcDec, eurcDec] = await Promise.all([
        usdcContract.balanceOf(address),
        eurcContract.balanceOf(address),
        usdcContract.decimals().catch(() => 6),
        eurcContract.decimals().catch(() => 6),
      ]);

      setBalances({
        USDC: { 
          symbol: 'USDC', 
          balance: formatUnits(usdcBal, usdcDec), 
          address: USDC_ADDRESS,
          decimals: Number(usdcDec)
        },
        EURC: { 
          symbol: 'EURC', 
          balance: formatUnits(eurcBal, eurcDec), 
          address: EURC_ADDRESS,
          decimals: Number(eurcDec)
        },
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [signer, address]);

  useEffect(() => {
    if (isConnected) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchBalances]);

  return { balances, isLoading, refetch: fetchBalances };
}
