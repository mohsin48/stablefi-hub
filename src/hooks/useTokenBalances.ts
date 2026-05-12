import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { JsonRpcProvider, Contract, formatUnits } from 'ethers';
import { USDC_ADDRESS, EURC_ADDRESS, ERC20_ABI } from '../contracts';

// Arc Testnet direct RPC provider for reading on-chain data
const ARC_TESTNET_RPC = 'https://rpc.testnet.arc.network/';

export interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
  decimals: number;
}

export function useTokenBalances() {
  const { address, isConnected } = useAccount();
  const [balances, setBalances] = useState<Record<string, TokenBalance>>({
    USDC: { symbol: 'USDC', balance: '0.00', address: USDC_ADDRESS, decimals: 6 },
    EURC: { symbol: 'EURC', balance: '0.00', address: EURC_ADDRESS, decimals: 6 },
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Create a fresh provider each time to avoid stale connections
      const provider = new JsonRpcProvider(ARC_TESTNET_RPC, {
        chainId: 5042002,
        name: 'Arc Testnet',
      });

      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, provider);
      const eurcContract = new Contract(EURC_ADDRESS, ERC20_ABI, provider);

      // Fetch both balances in parallel using balanceOf(address)
      const [usdcRaw, eurcRaw] = await Promise.all([
        usdcContract.balanceOf(address) as Promise<bigint>,
        eurcContract.balanceOf(address) as Promise<bigint>,
      ]);

      // Format with 6 decimals (both USDC and EURC use 6 decimals on Arc Testnet)
      const usdcBalance = formatUnits(usdcRaw, 6);
      const eurcBalance = formatUnits(eurcRaw, 6);

      console.log(`[Arc Testnet] USDC balance for ${address}: ${usdcBalance}`);
      console.log(`[Arc Testnet] EURC balance for ${address}: ${eurcBalance}`);

      setBalances({
        USDC: {
          symbol: 'USDC',
          balance: usdcBalance,
          address: USDC_ADDRESS,
          decimals: 6,
        },
        EURC: {
          symbol: 'EURC',
          balance: eurcBalance,
          address: EURC_ADDRESS,
          decimals: 6,
        },
      });
    } catch (error) {
      console.error('[Arc Testnet] Error fetching token balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      // Fetch immediately on connect
      fetchBalances();
      // Then poll every 10 seconds
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, fetchBalances]);

  return { balances, isLoading, refetch: fetchBalances };
}
