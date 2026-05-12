import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Contract, formatUnits, JsonRpcProvider } from 'ethers';
import { USDC_ADDRESS, EURC_ADDRESS, ERC20_ABI } from '../contracts';
import { useEthersSigner } from './useSwap';

// Direct provider for Arc Testnet — used as fallback for read-only balance calls
const ARC_TESTNET_RPC = 'https://rpc.testnet.arc.network/';
const arcProvider = new JsonRpcProvider(ARC_TESTNET_RPC, {
  chainId: 5042002,
  name: 'Arc Testnet',
});

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
    if (!address) return;

    setIsLoading(true);
    try {
      // Use signer if available (wallet connected), otherwise use direct RPC provider
      const provider = signer || arcProvider;

      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, provider);
      const eurcContract = new Contract(EURC_ADDRESS, ERC20_ABI, provider);

      const [usdcBal, eurcBal] = await Promise.all([
        usdcContract.balanceOf(address),
        eurcContract.balanceOf(address),
      ]);

      // Both USDC and EURC use 6 decimals on Arc Testnet
      const usdcFormatted = formatUnits(usdcBal, 6);
      const eurcFormatted = formatUnits(eurcBal, 6);

      setBalances({
        USDC: { 
          symbol: 'USDC', 
          balance: usdcFormatted, 
          address: USDC_ADDRESS,
          decimals: 6,
        },
        EURC: { 
          symbol: 'EURC', 
          balance: eurcFormatted, 
          address: EURC_ADDRESS,
          decimals: 6,
        },
      });
    } catch (error) {
      console.error('Error fetching balances from Arc Testnet:', error);
    } finally {
      setIsLoading(false);
    }
  }, [signer, address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [isConnected, address, fetchBalances]);

  return { balances, isLoading, refetch: fetchBalances };
}
