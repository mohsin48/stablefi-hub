import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useSwitchChain, 
  useBalance,
  useSignMessage
} from 'wagmi';
import { arcTestnet } from '../lib/arc-config';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export function useWallet() {
  const { address, isConnected, chain, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const { data: balanceData } = useBalance({
    address,
  });

  const checkNetwork = useCallback(() => {
    if (isConnected && chain?.id !== arcTestnet.id) {
      toast.warning('Network Mismatch', {
        description: 'Please switch to Arc Testnet to use StableFi Hub.',
        action: {
          label: 'Switch',
          onClick: () => switchChain({ chainId: arcTestnet.id }),
        },
      });
    }
  }, [isConnected, chain, switchChain]);

  useEffect(() => {
    checkNetwork();
  }, [checkNetwork]);

  return {
    address,
    isConnected,
    isConnecting,
    chainId: chain?.id,
    balance: balanceData?.formatted,
    symbol: balanceData?.symbol,
    disconnect: () => disconnect(),
    switchChain: (id?: number) => switchChain({ chainId: id || arcTestnet.id }),
  };
}
