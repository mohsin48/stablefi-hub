import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { JsonRpcProvider, Contract, formatUnits } from 'ethers';
import { USDC_ADDRESS, EURC_ADDRESS, ERC20_ABI } from '../contracts';

// Official Arc Testnet RPC — https://docs.arc.network/arc/references/connect-to-arc
const ARC_TESTNET_RPC = 'https://rpc.testnet.arc.network';

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
      // Direct provider to Arc Testnet for read-only balance calls
      const provider = new JsonRpcProvider(ARC_TESTNET_RPC, {
        chainId: 5042002,
        name: 'Arc Testnet',
      });

      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, provider);
      const eurcContract = new Contract(EURC_ADDRESS, ERC20_ABI, provider);

      // Call balanceOf on both USDC and EURC contracts
      const [usdcRaw, eurcRaw] = await Promise.all([
        usdcContract.balanceOf(address) as Promise<bigint>,
        eurcContract.balanceOf(address) as Promise<bigint>,
      ]);

      // Both use 6 decimals on Arc Testnet
      const usdcBalance = formatUnits(usdcRaw, 6);
      const eurcBalance = formatUnits(eurcRaw, 6);

      console.log(`[Arc Testnet] Wallet: ${address}`);
      console.log(`[Arc Testnet] USDC (${USDC_ADDRESS}): ${usdcBalance}`);
      console.log(`[Arc Testnet] EURC (${EURC_ADDRESS}): ${eurcBalance}`);

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
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, fetchBalances]);

  return { balances, isLoading, refetch: fetchBalances };
}
