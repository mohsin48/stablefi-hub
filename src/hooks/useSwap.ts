import { useState, useCallback, useMemo } from 'react';
import { useAccount, useConnectorClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner, Contract, parseUnits } from 'ethers';
import { toast } from 'sonner';
import { USDC_ADDRESS, EURC_ADDRESS, WUSDC_ADDRESS, ERC20_ABI } from '../contracts';

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

// Uniswap V2 Router ABI
import { SWAP_ABI, ROUTER_ADDRESS } from '../contracts';

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
      const isUsdcToEurc = direction === 'USDC_TO_EURC';
      
      // Native USDC uses 18 decimals, EURC uses 6 decimals
      const decimalsIn = isUsdcToEurc ? 18 : 6;
      const parsedAmount = parseUnits(amount, decimalsIn);
      
      const tokenContract = new Contract(tokenIn, ERC20_ABI, signer);
      const routerContract = new Contract(ROUTER_ADDRESS, SWAP_ABI, signer);

      // Step 1: Check balance
      // If native USDC, get balance from provider, else from ERC20 contract
      const balance = isUsdcToEurc 
        ? await signer.provider.getBalance(address)
        : await tokenContract.balanceOf(address);
        
      if (balance < parsedAmount) {
        toast.error('Insufficient Balance', { 
          description: `You don't have enough ${tokenInSymbol}. Get testnet tokens from faucet.circle.com` 
        });
        setIsSwapping(false);
        return;
      }

      // Step 2: Approve Router contract to spend tokens (only needed for EURC, native USDC is handled via msg.value)
      if (!isUsdcToEurc) {
        toast.info(`Step 1/2: Approving ${tokenInSymbol}`, { 
          description: `Allowing Swap Router to spend your ${tokenInSymbol}...` 
        });
        
        const approveTx = await tokenContract.approve(ROUTER_ADDRESS, parsedAmount);
        toast.info('Approval Pending', { description: 'Waiting for confirmation on Arc Testnet...' });
        await approveTx.wait();
        toast.success('Approval Confirmed ✓');
      }

      // Step 3: Execute swap via Router
      let expectedAmountOut = 0n;
      // Use WUSDC instead of USDC in the path
      const path = isUsdcToEurc ? [WUSDC_ADDRESS, EURC_ADDRESS] : [EURC_ADDRESS, WUSDC_ADDRESS];
      
      try {
        const amountsOut = await routerContract.getAmountsOut(parsedAmount, path);
        expectedAmountOut = amountsOut[1];
      } catch (err: any) {
        console.error('getAmountsOut error:', err);
        if (err?.message?.includes('missing revert data') || err?.message?.includes('INSUFFICIENT_LIQUIDITY')) {
           toast.error('Insufficient Liquidity', { description: 'The liquidity pool for this pair does not exist or lacks liquidity on the testnet router.' });
           setIsSwapping(false);
           return;
        }
      }

      // Apply 0.5% slippage tolerance
      const slippageBps = 50n; // 0.5%
      let minAmountOut = 0n;
      if (expectedAmountOut > 0n) {
          minAmountOut = expectedAmountOut - (expectedAmountOut * slippageBps / 10000n);
      } else {
          // Fallback if getAmountsOut failed
          const decimalsOut = isUsdcToEurc ? 6 : 18;
          const fallbackAmountOut = parseUnits(amount, decimalsOut);
          minAmountOut = fallbackAmountOut - (fallbackAmountOut * slippageBps / 10000n);
      }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

      toast.info(`Step ${isUsdcToEurc ? '1' : '2'}/2: Swapping ${tokenInSymbol} → ${tokenOutSymbol}`, { 
        description: 'Executing swap on Arc Testnet Router...' 
      });
      
      let swapTx;
      try {
        if (isUsdcToEurc) {
          // Native USDC to EURC
          swapTx = await routerContract.swapExactETHForTokens(
            minAmountOut,
            path,
            address,
            deadline,
            { value: parsedAmount }
          );
        } else {
          // EURC to Native USDC
          swapTx = await routerContract.swapExactTokensForETH(
            parsedAmount,
            minAmountOut,
            path,
            address,
            deadline
          );
        }
      } catch (swapError: any) {
        console.error('Swap call failed:', swapError);
        
        const reason = swapError?.reason || swapError?.message || '';
        if (reason.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
          toast.error('Slippage Too High', { 
            description: 'Price moved beyond the slippage tolerance. Try a smaller amount.' 
          });
        } else if (reason.includes('INSUFFICIENT_LIQUIDITY')) {
          toast.error('Insufficient Liquidity', { 
            description: 'The pool does not have enough liquidity for this swap amount.' 
          });
        } else {
          toast.error('Swap Failed', { 
            description: `Router contract reverted. Error: ${reason.substring(0, 100)}` 
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
      
      let message = 'Transaction failed';
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        message = 'Transaction rejected by user';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        message = 'Insufficient USDC for gas fees. Get testnet USDC from faucet.circle.com';
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
