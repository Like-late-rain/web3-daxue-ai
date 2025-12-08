import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'ethers';
import YCTokenABI from '@/contracts/YCToken.json';
import addresses from '@/contracts/addresses.json';

export const useYCToken = () => {
  const contractAddress = addresses.YCToken as `0x${string}`;
  const contractChainId = Number(addresses.chainId);

  // 读取余额
  const useBalance = (address?: string) => {
    return useReadContract({
      address: contractAddress,
      abi: YCTokenABI.abi,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      chainId: contractChainId,
      query: {
        enabled: !!address,
      },
    });
  };

  // 购买代币
  const useBuyTokens = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    console.log('=== useBuyTokens 调试 ===');
    console.log('hash:', hash);
    console.log('isPending:', isPending);
    console.log('isConfirming:', isConfirming);
    console.log('isSuccess:', isSuccess);
    console.log('error:', error);

    const buyTokens = (ethAmount: string) => {
      const value = parseEther(ethAmount) as bigint;
      console.log('调用 buyTokens，ETH 数量:', ethAmount, 'Wei:', value.toString());
      writeContract({
        address: contractAddress,
        abi: YCTokenABI.abi,
        functionName: 'buyTokens',
        value: value,
        chainId: contractChainId,
      });
    };

    return {
      buyTokens,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 出售代币
  const useSellTokens = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const sellTokens = (tokenAmount: bigint) => {
      writeContract({
        address: contractAddress,
        abi: YCTokenABI.abi,
        functionName: 'sellTokens',
        args: [tokenAmount],
        chainId: contractChainId,
      });
    };

    return {
      sellTokens,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
    };
  };

  // 授权代币
  const useApprove = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const approve = (spender: string, amount: bigint) => {
      writeContract({
        address: contractAddress,
        abi: YCTokenABI.abi,
        functionName: 'approve',
        args: [spender, amount],
        chainId: contractChainId,
      });
    };

    return {
      approve,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
    };
  };

  return {
    useBalance,
    useBuyTokens,
    useSellTokens,
    useApprove,
  };
};
