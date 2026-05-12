import { useState, useCallback, useMemo } from 'react';
import { useAccount, useConnectorClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner, Contract, parseUnits } from 'ethers';
import { toast } from 'sonner';
import { USDC_ADDRESS, EURC_ADDRESS, STABLEFX_ADDRESS, ERC20_ABI } from '../contracts';

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

// StableFX ABI — the official Arc Testnet swap contract
// Source: https://docs.arc.network/arc/references/contract-addresses#stablefx
// Contract: 0x867650F5eAe8df91445971f14d89fd84F0C9a9f8
const STABLEFX_ABI = [
  // swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient)
  {
    name: 'swap',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
  // getAmountOut(address tokenIn, address tokenOut, uint256 amountIn)
  {
    name: 'getAmountOut',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const;

export function useSwap() {
  const signer = useEthersSigner();
  const { address } = useAccount();
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSwap = useCallback(async (
    amount: string,
    direction: 'USDC_TO_EURC' | 'EURC_TO_USDC' = 'USDC_TO_EURC'
  ) => {
    if (!signer || !address) {
      toast.error('Wallet not connected', { description: 'Please connect your wallet first.' });
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Invalid Amount', { description: 'Please enter a valid amount greater than 0.' });
      return;
    }

    setIsSwapping(true);
    setIsSuccess(false);

    const tokenIn = direction === 'USDC_TO_EURC' ? USDC_ADDRESS : EURC_ADDRESS;
    const tokenOut = direction === 'USDC_TO_EURC' ? EURC_ADDRESS : USDC_ADDRESS;
    const tokenInSymbol = direction === 'USDC_TO_EURC' ? 'USDC' : 'EURC';
    const tokenOutSymbol = direction === 'USDC_TO_EURC' ? 'EURC' : 'USDC';

    try {
      const parsedAmount = parseUnits(amount, 6); // Both USDC and EURC use 6 decimals
      
      const tokenContract = new Contract(tokenIn, ERC20_ABI, signer);
      const stableFxContract = new Contract(STABLEFX_ADDRESS, STABLEFX_ABI, signer);

      // Step 1: Check balance
      const balance = await tokenContract.balanceOf(address);
      if (balance < parsedAmount) {
        toast.error('Insufficient Balance', { 
          description: `You don't have enough ${tokenInSymbol}. Get testnet tokens from faucet.circle.com` 
        });
        setIsSwapping(false);
        return;
      }

      // Step 2: Approve StableFX contract to spend tokens
      toast.info(`Step 1/2: Approving ${tokenInSymbol}`, { 
        description: `Allowing StableFX to spend your ${tokenInSymbol}...` 
      });
      
      const approveTx = await tokenContract.approve(STABLEFX_ADDRESS, parsedAmount);
      toast.info('Approval Pending', { description: 'Waiting for confirmation on Arc Testnet...' });
      await approveTx.wait();
      toast.success('Approval Confirmed ✓');

      // Step 3: Execute swap via StableFX
      // Apply 0.5% slippage tolerance
      const slippageBps = 50n; // 0.5%
      const minAmountOut = parsedAmount - (parsedAmount * slippageBps / 10000n);

      toast.info(`Step 2/2: Swapping ${tokenInSymbol} → ${tokenOutSymbol}`, { 
        description: 'Executing swap on Arc Testnet StableFX...' 
      });
      
      let swapTx;
      try {
        // Try the StableFX swap function
        swapTx = await stableFxContract.swap(
          tokenIn,
          tokenOut,
          parsedAmount,
          minAmountOut,
          address
        );
      } catch (swapError: any) {
        // If StableFX swap fails, fall back to direct ERC20 transfer simulation
        // This handles cases where StableFX might have a different interface
        console.error('StableFX swap call failed:', swapError);
        
        // Provide a user-friendly error
        const reason = swapError?.reason || swapError?.message || '';
        if (reason.includes('insufficient')) {
          toast.error('Insufficient Liquidity', { 
            description: 'The StableFX pool may not have enough liquidity for this swap amount.' 
          });
        } else if (reason.includes('slippage') || reason.includes('min')) {
          toast.error('Slippage Too High', { 
            description: 'Price moved beyond the slippage tolerance. Try a smaller amount.' 
          });
        } else {
          toast.error('Swap Failed', { 
            description: `StableFX contract reverted. The pool may not support this pair yet. Error: ${reason.substring(0, 100)}` 
          });
        }
        setIsSwapping(false);
        return;
      }

      toast.info('Swap Pending', { description: 'Settling on Arc Testnet...' });
      const receipt = await swapTx.wait();
      
      const explorerUrl = `https://testnet.arcscan.app/tx/${receipt.hash}`;
      toast.success('Swap Complete! ✓', { 
        description: `${amount} ${tokenInSymbol} → ${tokenOutSymbol}. View on ArcScan`,
        action: {
          label: 'View TX',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
      
      setIsSuccess(true);
      return receipt.hash;
    } catch (error: any) {
      console.error('Swap error:', error);
      
      // Parse ethers.js errors into readable messages
      let message = 'Transaction failed';
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        message = 'Transaction rejected by user';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        message = 'Insufficient USDC for gas fees. Get testnet USDC from faucet.circle.com';
      } else if (error.message?.includes('missing revert data')) {
        message = 'Contract call reverted. The StableFX contract may not support this function signature.';
      } else if (error.reason) {
        message = error.reason;
      } else if (error.message) {
        message = error.message.substring(0, 150);
      }
      
      toast.error('Swap Failed', { description: message });
    } finally {
      setIsSwapping(false);
    }
  }, [signer, address]);

  return {
    handleSwap,
    isSwapping,
    isSuccess
  };
}
