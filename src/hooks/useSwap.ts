import { useState, useCallback, useMemo } from 'react';
import { useAccount, useConnectorClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner, Contract, parseUnits } from 'ethers';
import { toast } from 'sonner';
import { SWAP_CONTRACT_ADDRESS, SWAP_ABI, USDC_ADDRESS, ERC20_ABI } from '../contracts';

/**
 * Hook to convert a viem client to an ethers signer.
 * This is the standard way to bridge wagmi/viem with ethers.js
 */
export function useEthersSigner() {
  const { data: client } = useConnectorClient();
  
  return useMemo(() => {
    if (!client) return undefined;
    
    const { account, chain, transport } = client;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account.address);
    return signer;
  }, [client]);
}

export function useSwap() {
  const signer = useEthersSigner();
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSwap = useCallback(async (amount: string) => {
    if (!signer) {
      toast.error('Wallet not connected', { description: 'Please connect your wallet first.' });
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      toast.error('Invalid Amount', { description: 'Please enter a valid numeric value.' });
      return;
    }

    setIsSwapping(true);
    setIsSuccess(false);

    try {
      const parsedAmount = parseUnits(amount, 6); // USDC typically 6 decimals
      
      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const swapContract = new Contract(SWAP_CONTRACT_ADDRESS, SWAP_ABI, signer);

      // 1. Approval
      toast.info('Step 1/2: Approving USDC', { description: 'Please allow the contract to spend your USDC.' });
      const approveTx = await usdcContract.approve(SWAP_CONTRACT_ADDRESS, parsedAmount);
      toast.info('Approval Pending', { description: 'Waiting for network confirmation...' });
      await approveTx.wait();
      toast.success('Approval Confirmed');

      // 2. Swap
      toast.info('Step 2/2: Confirming Swap', { description: 'Finalizing cross-border settlement.' });
      const swapTx = await swapContract.swapUSDCForEURC(parsedAmount);
      toast.info('Swap Pending', { description: 'Settling on Arc Network...' });
      const receipt = await swapTx.wait();
      
      toast.success('Swap Complete!', { description: 'Tokens have been settled in your wallet.' });
      setIsSuccess(true);
      return receipt.hash;
    } catch (error: any) {
      console.error('Swap error:', error);
      // Handle user rejection or other RPC errors
      const message = error.reason || error.message || 'Transaction failed';
      toast.error('Swap Failed', { description: message });
    } finally {
      setIsSwapping(false);
    }
  }, [signer]);

  return {
    handleSwap,
    isSwapping,
    isSuccess
  };
}
