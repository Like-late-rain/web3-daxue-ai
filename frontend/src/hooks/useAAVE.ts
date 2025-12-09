import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits, formatUnits } from 'ethers';
import AAVEPoolABI from '@/contracts/AAVEPool.json';
import ATokenABI from '@/contracts/AToken.json';
import YCTokenABI from '@/contracts/YCToken.json';
import WETHABI from '@/contracts/WETH.json';
import addresses from '@/contracts/addresses.json';

export const useAAVE = () => {
  const poolAddress = addresses.AAVEPool as `0x${string}`;
  const wethAddress = addresses.WETH as `0x${string}`;
  const usdtAddress = addresses.USDT as `0x${string}`;
  const yctAddress = addresses.YCToken as `0x${string}`;
  const contractChainId = Number(addresses.chainId);

  // YCT 兑换率：1 ETH = 10000 YCT
  const YCT_TO_ETH_RATE = 10000;

  // 获取 WETH 的储备数据（包含 APY）
  const useWETHReserveData = () => {
    return useReadContract({
      address: poolAddress,
      abi: AAVEPoolABI.abi,
      functionName: 'getReserveData',
      args: [wethAddress],
      chainId: contractChainId,
    });
  };

  // 获取 USDT 的储备数据（包含 APY）
  const useUSDTReserveData = () => {
    return useReadContract({
      address: poolAddress,
      abi: AAVEPoolABI.abi,
      functionName: 'getReserveData',
      args: [usdtAddress],
      chainId: contractChainId,
    });
  };

  // 获取用户账户数据
  const useUserAccountData = (userAddress?: string) => {
    return useReadContract({
      address: poolAddress,
      abi: AAVEPoolABI.abi,
      functionName: 'getUserAccountData',
      args: userAddress ? [userAddress] : undefined,
      chainId: contractChainId,
      query: {
        enabled: !!userAddress,
      },
    });
  };

  // 获取用户的 aToken 余额（aWETH）
  const useATokenBalance = (aTokenAddress: string, userAddress?: string) => {
    return useReadContract({
      address: aTokenAddress as `0x${string}`,
      abi: ATokenABI.abi,
      functionName: 'balanceOf',
      args: userAddress ? [userAddress] : undefined,
      chainId: contractChainId,
      query: {
        enabled: !!userAddress && !!aTokenAddress,
      },
    });
  };

  // 包装 ETH 为 WETH
  const useWrapETH = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const wrap = (amount: bigint) => {
      writeContract({
        address: wethAddress,
        abi: WETHABI.abi,
        functionName: 'deposit',
        value: amount,
        chainId: contractChainId,
      });
    };

    return {
      wrap,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 解包 WETH 为 ETH
  const useUnwrapWETH = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const unwrap = (amount: bigint) => {
      writeContract({
        address: wethAddress,
        abi: WETHABI.abi,
        functionName: 'withdraw',
        args: [amount],
        chainId: contractChainId,
      });
    };

    return {
      unwrap,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 获取 WETH 余额
  const useWETHBalance = (userAddress?: string) => {
    return useReadContract({
      address: wethAddress,
      abi: WETHABI.abi,
      functionName: 'balanceOf',
      args: userAddress ? [userAddress] : undefined,
      chainId: contractChainId,
      query: {
        enabled: !!userAddress,
      },
    });
  };

  // 授权 WETH 给 AAVE Pool
  const useApproveWETH = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const approve = (amount: bigint) => {
      writeContract({
        address: wethAddress,
        abi: WETHABI.abi,
        functionName: 'approve',
        args: [poolAddress, amount],
        chainId: contractChainId,
      });
    };

    return {
      approve,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 授权 USDT 给 AAVE Pool
  const useApproveUSDT = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const approve = (amount: bigint) => {
      writeContract({
        address: usdtAddress,
        abi: YCTokenABI.abi, // ERC20 标准接口
        functionName: 'approve',
        args: [poolAddress, amount],
        chainId: contractChainId,
      });
    };

    return {
      approve,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 存入 WETH 到 AAVE
  const useSupplyWETH = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const supply = (amount: bigint, userAddress: string) => {
      writeContract({
        address: poolAddress,
        abi: AAVEPoolABI.abi,
        functionName: 'supply',
        args: [wethAddress, amount, userAddress, 0],
        chainId: contractChainId,
      });
    };

    return {
      supply,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 存入 USDT 到 AAVE
  const useSupplyUSDT = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const supply = (amount: bigint, userAddress: string) => {
      writeContract({
        address: poolAddress,
        abi: AAVEPoolABI.abi,
        functionName: 'supply',
        args: [usdtAddress, amount, userAddress, 0],
        chainId: contractChainId,
      });
    };

    return {
      supply,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 从 AAVE 提取 WETH
  const useWithdrawWETH = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const withdraw = (amount: bigint, userAddress: string) => {
      writeContract({
        address: poolAddress,
        abi: AAVEPoolABI.abi,
        functionName: 'withdraw',
        args: [wethAddress, amount, userAddress],
        chainId: contractChainId,
      });
    };

    return {
      withdraw,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 从 AAVE 提取 USDT
  const useWithdrawUSDT = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const withdraw = (amount: bigint, userAddress: string) => {
      writeContract({
        address: poolAddress,
        abi: AAVEPoolABI.abi,
        functionName: 'withdraw',
        args: [usdtAddress, amount, userAddress],
        chainId: contractChainId,
      });
    };

    return {
      withdraw,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 授权 YCT
  const useApproveYCT = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const approve = (amount: bigint) => {
      writeContract({
        address: yctAddress,
        abi: YCTokenABI.abi,
        functionName: 'approve',
        args: [yctAddress, amount], // 授权给 YCToken 合约自己（用于 sellTokens）
        chainId: contractChainId,
      });
    };

    return {
      approve,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 卖出 YCT 换 ETH
  const useSellYCT = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const sell = (amount: bigint) => {
      writeContract({
        address: yctAddress,
        abi: YCTokenABI.abi,
        functionName: 'sellTokens',
        args: [amount],
        chainId: contractChainId,
      });
    };

    return {
      sell,
      isPending: isPending || isConfirming,
      isSuccess,
      error,
      hash,
    };
  };

  // 计算 APY（从 liquidityRate 转换）
  const calculateAPY = (liquidityRate?: bigint): string => {
    if (!liquidityRate || liquidityRate === BigInt(0)) {
      return '0.00';
    }

    try {
      // AAVE 的 liquidityRate 是按 RAY (1e27) 单位的年化利率
      const RAY = BigInt(10 ** 27);

      // 将 liquidityRate 转换为百分比
      const rateInPercent = Number(liquidityRate) / Number(RAY) * 100;

      // 检查是否为有效数字
      if (isNaN(rateInPercent) || !isFinite(rateInPercent)) {
        return '0.00';
      }

      return rateInPercent.toFixed(2);
    } catch (error) {
      console.error('计算 APY 出错:', error);
      return '0.00';
    }
  };

  return {
    // 读取函数
    useWETHReserveData,
    useUSDTReserveData,
    useUserAccountData,
    useATokenBalance,
    useWETHBalance,

    // WETH 包装/解包函数
    useWrapETH,
    useUnwrapWETH,

    // 授权函数
    useApproveWETH,
    useApproveUSDT,
    useApproveYCT,

    // 存款函数
    useSupplyWETH,
    useSupplyUSDT,

    // 取款函数
    useWithdrawWETH,
    useWithdrawUSDT,

    // YCT 相关函数
    useSellYCT,

    // 工具函数
    calculateAPY,

    // 常量
    YCT_TO_ETH_RATE,

    // 地址常量
    addresses: {
      pool: poolAddress,
      weth: wethAddress,
      usdt: usdtAddress,
      yct: yctAddress,
    },
  };
};
