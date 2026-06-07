import { 
  useSendTransaction, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { ERC20_ABI, EURC_ADDRESS } from '../contracts';

export function usePayment() {
  const [activeTxHash, setActiveTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
    sendTransaction, 
    data: sendTxHash, 
    error: sendError,
    isPending: isSendPending
  } = useSendTransaction();

  const { 
    writeContract, 
    data: writeTxHash, 
    error: writeError,
    isPending: isWritePending
  } = useWriteContract();

  // Track the most recent transaction hash
  useEffect(() => {
    if (sendTxHash) setActiveTxHash(sendTxHash);
  }, [sendTxHash]);

  useEffect(() => {
    if (writeTxHash) setActiveTxHash(writeTxHash);
  }, [writeTxHash]);

  const { 
    isLoading: isTxPending, 
    isSuccess: isTxSuccess, 
    error: txError 
  } = useWaitForTransactionReceipt({
    hash: activeTxHash,
  });

  useEffect(() => {
    if (sendError || writeError || txError) {
      toast.error('Payment Failed', { 
        description: sendError?.message || writeError?.message || txError?.message 
      });
      setIsProcessing(false);
    }
  }, [sendError, writeError, txError]);

  useEffect(() => {
    if (isTxSuccess) {
      toast.success('Payment Sent Successfully', { 
        description: 'Your transfer has been settled on Arc Testnet.' 
      });
      setIsProcessing(false);
    }
  }, [isTxSuccess]);

  const handlePayment = async (recipient: string, amount: string, currency: string) => {
    if (!recipient || !amount) return;

    try {
      setIsProcessing(true);
      if (currency === 'USDC') {
        // USDC is the native token on Arc Testnet
        sendTransaction({
          to: recipient as `0x${string}`,
          value: parseEther(amount),
        });
      } else if (currency === 'EURC') {
        // EURC is an ERC20 token with 6 decimals
        writeContract({
          address: EURC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, parseUnits(amount, 6)],
        });
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return {
    handlePayment,
    isPending: isProcessing || isSendPending || isWritePending || isTxPending,
    isSuccess: isTxSuccess
  };
}
