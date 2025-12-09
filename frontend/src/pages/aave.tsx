import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import NumberInput from "@/components/NumberInput";
import { useAccount, useBalance } from "wagmi";
import { useYCToken } from "@/hooks/useYCToken";
import { useAAVE } from "@/hooks/useAAVE";
import { formatEther } from "@/utils/helpers";
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  dismissToast
} from "@/utils/toast";
import { TrendingUp, AlertCircle } from "lucide-react";
import { parseEther, parseUnits, formatUnits } from "ethers";

export default function AAVE() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance, refetch: refetchETHBalance } = useBalance({
    address
  });
  const { useBalance: useYCTBalance } = useYCToken();
  const { data: yctBalance, refetch: refetchYCTBalance } =
    useYCTBalance(address);

  const [depositType, setDepositType] = useState<"ETH" | "YCT">("ETH");
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // AAVE hooks
  const {
    useWETHReserveData,
    useUSDTReserveData,
    useUserAccountData,
    useATokenBalance,
    useWETHBalance,
    useWrapETH,
    useUnwrapWETH,
    useApproveWETH,
    useApproveUSDT,
    useSupplyWETH,
    useSupplyUSDT,
    useWithdrawWETH,
    useSellYCT,
    calculateAPY,
    YCT_TO_ETH_RATE
  } = useAAVE();

  // 获取储备数据
  const { data: wethReserveData, refetch: refetchWETHReserve } =
    useWETHReserveData();
  const { data: usdtReserveData, refetch: refetchUSDTReserve } =
    useUSDTReserveData();
  const { data: userAccountData, refetch: refetchUserAccount } =
    useUserAccountData(address);

  // 直接使用硬编码的 aToken 地址（Sepolia AAVE V3）
  const aWETHAddress = "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830";
  const aUSDTAddress = "0xAF0F6e8b0Dc5c913bbF4d14c22B4E78Dd14310B6";

  // 获取用户的 aToken 余额
  const { data: aWETHBalance, refetch: refetchAWETHBalance } = useATokenBalance(
    aWETHAddress,
    address
  );
  const { data: aUSDTBalance, refetch: refetchAUSDTBalance } = useATokenBalance(
    aUSDTAddress,
    address
  );

  // 获取 WETH 余额
  const { data: wethBalance, refetch: refetchWETHBalance } =
    useWETHBalance(address);

  // 授权和存款 hooks
  const wrapETH = useWrapETH();
  const unwrapWETH = useUnwrapWETH();
  const approveWETH = useApproveWETH();
  const approveUSDT = useApproveUSDT();
  const supplyWETH = useSupplyWETH();
  const supplyUSDT = useSupplyUSDT();
  const withdrawWETH = useWithdrawWETH();
  const sellYCT = useSellYCT();

  // 计算 APY
  const wethAPY =
    wethReserveData && (wethReserveData as any)[2]
      ? calculateAPY((wethReserveData as any)[2])
      : "0.00";
  const usdtAPY =
    usdtReserveData && (usdtReserveData as any)[2]
      ? calculateAPY((usdtReserveData as any)[2])
      : "0.00";

  // 存款逻辑
  const handleDeposit = async () => {
    if (!address || !amount || parseFloat(amount) <= 0) {
      showErrorToast("请输入有效的存款金额");
      return;
    }

    try {
      if (depositType === "YCT") {
        // YCT 存款流程：YCT -> 卖成 ETH -> 包装成 WETH -> 存入 AAVE
        const yctAmountInWei = parseEther(amount);

        // 检查 YCT 余额
        if (!yctBalance || (yctBalance as bigint) < yctAmountInWei) {
          showErrorToast("YCT 余额不足");
          return;
        }

        // 开始卖出 YCT
        showLoadingToast(`卖出 ${amount} YCT 换取 ETH...`);
        sellYCT.sell(yctAmountInWei);
        return; // 等待卖出完成后自动继续
      } else if (depositType === "ETH") {
        const amountInWei = parseEther(amount);
        const currentWETHBalance = (wethBalance as bigint) || BigInt(0);

        // 检查是否需要先包装 ETH
        if (currentWETHBalance < amountInWei) {
          const needToWrap = amountInWei - currentWETHBalance;
          showLoadingToast(`包装 ${formatEther(needToWrap)} ETH 为 WETH...`);
          wrapETH.wrap(needToWrap);
          return; // 等待包装完成后自动继续
        }

        // WETH 余额充足，直接授权和存款
        showLoadingToast("授权 WETH...");
        approveWETH.approve(amountInWei);
      }
    } catch (error: any) {
      showErrorToast(error.message || "操作失败");
    }
  };

  // 取款逻辑（统一取出 WETH）
  const handleWithdraw = async () => {
    if (!address || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      showErrorToast("请输入有效的取款金额");
      return;
    }

    showLoadingToast("处理取款...");

    try {
      const amountInWei = parseEther(withdrawAmount);
      withdrawWETH.withdraw(amountInWei, address);
    } catch (error: any) {
      dismissToast();
      showErrorToast(error.message || "取款失败");
    }
  };

  // 监听卖出 YCT 完成
  useEffect(() => {
    if (sellYCT.isSuccess && address && amount && depositType === "YCT") {
      dismissToast(); // 关闭所有 loading toast
      showSuccessToast("YCT 卖出成功！");
      // 计算获得的 ETH 数量
      const yctAmount = parseFloat(amount);
      const ethAmount = yctAmount / YCT_TO_ETH_RATE;
      const ethAmountInWei = parseEther(ethAmount.toString());

      // 包装 ETH 为 WETH
      setTimeout(() => {
        showLoadingToast("包装 ETH 为 WETH...");
        wrapETH.wrap(ethAmountInWei);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellYCT.isSuccess]);

  // 监听包装 ETH 完成
  useEffect(() => {
    if (wrapETH.isSuccess && address && amount) {
      dismissToast(); // 关闭所有 loading toast
      showSuccessToast("ETH 包装成功！");
      // 继续授权流程
      let amountInWei: bigint;
      if (depositType === "YCT") {
        // 如果是从 YCT 转换来的，计算对应的 ETH 数量
        const yctAmount = parseFloat(amount);
        const ethAmount = yctAmount / YCT_TO_ETH_RATE;
        amountInWei = parseEther(ethAmount.toString());
      } else {
        amountInWei = parseEther(amount);
      }
      setTimeout(() => {
        showLoadingToast("授权 WETH...");
        approveWETH.approve(amountInWei);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapETH.isSuccess]);

  // 监听授权完成
  useEffect(() => {
    if (approveWETH.isSuccess && address && amount) {
      dismissToast(); // 关闭所有 loading toast
      showSuccessToast("授权成功！");
      // 继续存款流程
      let amountInWei: bigint;
      if (depositType === "YCT") {
        // 如果是从 YCT 转换来的，计算对应的 ETH 数量
        const yctAmount = parseFloat(amount);
        const ethAmount = yctAmount / YCT_TO_ETH_RATE;
        amountInWei = parseEther(ethAmount.toString());
      } else {
        amountInWei = parseEther(amount);
      }
      setTimeout(() => {
        showLoadingToast("存入 AAVE...");
        supplyWETH.supply(amountInWei, address);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveWETH.isSuccess]);

  useEffect(() => {
    if (approveUSDT.isSuccess && address && amount) {
      dismissToast(); // 关闭所有 loading toast
      showSuccessToast("授权成功！");
      // 继续存款流程
      const amountInUnits = parseUnits(amount, 6);
      setTimeout(() => {
        showLoadingToast("存入 AAVE...");
        supplyUSDT.supply(amountInUnits, address);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveUSDT.isSuccess]);

  // 刷新所有余额数据
  const refreshAllBalances = async () => {
    await Promise.all([
      refetchETHBalance(), // 刷新 ETH 余额
      refetchYCTBalance(), // 刷新 YCT 余额
      refetchWETHBalance(), // 刷新 WETH 余额
      refetchAWETHBalance(), // 刷新 aWETH 余额
      refetchAUSDTBalance(), // 刷新 aUSDT 余额
      refetchUserAccount() // 刷新 AAVE 账户数据
    ]);
  };

  // 监听存款完成
  useEffect(() => {
    if (supplyWETH.isSuccess || supplyUSDT.isSuccess) {
      dismissToast(); // 关闭所有 loading toast
      showSuccessToast("存款成功！");
      setAmount("");
      // 等待一小段时间让区块链确认，然后刷新数据
      setTimeout(() => {
        refreshAllBalances();
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplyWETH.isSuccess, supplyUSDT.isSuccess]);

  // 监听取款完成，自动解包 WETH 为 ETH
  useEffect(() => {
    if (withdrawWETH.isSuccess && address && withdrawAmount) {
      dismissToast();
      showSuccessToast("取款成功！正在将 WETH 解包为 ETH...");

      // 解包 WETH 为 ETH
      const amountInWei = parseEther(withdrawAmount);
      setTimeout(() => {
        showLoadingToast("解包 WETH 为 ETH...");
        unwrapWETH.unwrap(amountInWei);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawWETH.isSuccess]);

  // 监听 WETH 解包完成
  useEffect(() => {
    if (unwrapWETH.isSuccess) {
      dismissToast();
      showSuccessToast("解包成功！ETH 已到账");
      setWithdrawAmount("");
      // 等待一小段时间让区块链确认，然后刷新数据
      setTimeout(() => {
        refreshAllBalances();
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unwrapWETH.isSuccess]);

  return (
    <>
      <Head>
        <title>AAVE 理财 - Web3 涂山大学</title>
      </Head>

      <Layout>
        {/* 背景装饰 */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 mb-8 animate-gradient">
            AAVE 理财协议
          </h1>

          {/* 提示 - 玻璃态效果 */}
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-5 flex items-start space-x-3">
              <AlertCircle
                className="text-cyan-400 flex-shrink-0 mt-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                size={20}
              />
              <div>
                <p className="text-sm text-cyan-300 font-semibold mb-1">
                  AAVE 协议集成
                </p>
                <p className="text-sm text-gray-300">
                  您可以将 ETH 或 YCT 存入 AAVE 协议赚取收益。YCT 会自动转换为
                  ETH 后存入。存款将自动生成利息。
                </p>
              </div>
            </div>
          </div>

          {/* 教育提示 - 玻璃态效果 */}
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-5 flex items-start space-x-3">
              <AlertCircle
                className="text-yellow-400 flex-shrink-0 mt-1 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                size={20}
              />
              <div>
                <p className="text-sm text-yellow-300 font-semibold mb-2">
                  📚 教育提示：关于测试网收益率
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  当前使用{" "}
                  <strong className="text-yellow-400">Sepolia 测试网</strong>
                  ，APY 接近 0%
                  是正常现象。这是因为测试网几乎没有借款需求，资金利用率接近
                  0%。
                </p>
                <p className="text-sm text-gray-300">
                  <strong className="text-yellow-400">主网参考收益率：</strong>{" "}
                  WETH 约 1-2% APY，USDT 约 3-5% APY。 本课程重点是学习 DeFi
                  协议的工作原理和智能合约交互。
                </p>
              </div>
            </div>
          </div>

          {/* 余额显示 - 科技卡片 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* ETH 余额卡片 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:border-blue-400/50 transition duration-300">
                <p className="text-sm text-cyan-400 mb-2 font-medium">
                  可用 ETH
                </p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {ethBalance ? formatEther(ethBalance.value) : "0.0000"}
                </p>
                <p className="text-xs text-gray-400 mt-1">ETH</p>
              </div>
            </div>

            {/* YCT 余额卡片 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:border-purple-400/50 transition duration-300">
                <p className="text-sm text-purple-400 mb-2 font-medium">
                  可用 YCT
                </p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {yctBalance ? formatEther(yctBalance as bigint) : "0.0000"}
                </p>
                <p className="text-xs text-gray-400 mt-1">YCT</p>
              </div>
            </div>
          </div>

          {/* 存款区域 - 未来感面板 */}
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6">
                存款到 AAVE
              </h2>

              <div className="space-y-6">
                {/* 资产类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-3">
                    选择资产
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setDepositType("ETH")}
                      className={`relative flex-1 py-4 rounded-xl font-semibold transition-all duration-300 ${
                        depositType === "ETH"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
                      }`}
                    >
                      {depositType === "ETH" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-50 -z-10"></div>
                      )}
                      ETH
                    </button>
                    <button
                      onClick={() => setDepositType("YCT")}
                      className={`relative flex-1 py-4 rounded-xl font-semibold transition-all duration-300 ${
                        depositType === "YCT"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700"
                      }`}
                    >
                      {depositType === "YCT" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-50 -z-10"></div>
                      )}
                      <div>YCT</div>
                      <span className="text-xs block opacity-75">
                        自动转为 ETH
                      </span>
                    </button>
                  </div>
                </div>

                {/* 金额输入 */}
                <NumberInput
                  label="存款金额"
                  value={amount}
                  onChange={setAmount}
                  placeholder={`输入 ${depositType} 数量`}
                  step="0.01"
                  min="0"
                  size="md"
                />

                {/* YCT 兑换提示 */}
                {depositType === "YCT" && amount && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">兑换预览：</span>
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {amount} YCT ≈{" "}
                      {(parseFloat(amount) / YCT_TO_ETH_RATE).toFixed(4)} ETH
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      兑换比例：1 ETH = {YCT_TO_ETH_RATE} YCT
                    </p>
                  </div>
                )}

                {/* APY 显示 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="text-green-600" size={20} />
                      <span className="text-sm text-green-700 font-semibold">
                        当前 APY (WETH)
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {wethAPY}%
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    {depositType === "YCT" && "YCT 将转换为 ETH 后存入，"}
                    实际收益率会根据 AAVE 协议实时变化
                  </p>
                </div>

                {/* 存款按钮 - 科技感 */}
                <button
                  onClick={handleDeposit}
                  disabled={
                    !isConnected ||
                    sellYCT.isPending ||
                    wrapETH.isPending ||
                    supplyWETH.isPending ||
                    supplyUSDT.isPending ||
                    approveWETH.isPending ||
                    approveUSDT.isPending
                  }
                  className="relative w-full group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300 group-disabled:opacity-30"></div>
                  <div className="relative px-6 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-105">
                    {sellYCT.isPending
                      ? "🔄 卖出 YCT..."
                      : wrapETH.isPending
                      ? "🔄 包装 ETH..."
                      : approveWETH.isPending || approveUSDT.isPending
                      ? "🔄 授权中..."
                      : supplyWETH.isPending || supplyUSDT.isPending
                      ? "🔄 存入中..."
                      : "⚡ 存入 AAVE"}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 我的存款 - 未来感面板 */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  我的存款
                </h2>
                <button
                  onClick={refreshAllBalances}
                  className="relative group/btn"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg blur opacity-40 group-hover/btn:opacity-60 transition"></div>
                  <div className="relative px-4 py-2 text-sm bg-gray-800 text-violet-400 rounded-lg hover:text-violet-300 transition border border-violet-500/30">
                    🔄 刷新数据
                  </div>
                </button>
              </div>

              <div className="space-y-6">
                {/* 总存款显示 - 霓虹卡片 */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 border border-emerald-500/40">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-emerald-400 mb-2 font-medium">
                          总存款
                        </p>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
                          {aWETHBalance
                            ? formatEther(aWETHBalance as bigint)
                            : "0.0000"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">ETH</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-500/20">
                        <div className="bg-gray-900/50 rounded-xl p-3 border border-emerald-500/20">
                          <p className="text-xs text-emerald-400 mb-1">
                            当前 APY
                          </p>
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                            {wethAPY}%
                          </p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl p-3 border border-cyan-500/20">
                          <p className="text-xs text-cyan-400 mb-1">
                            总存款价值
                          </p>
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                            {userAccountData
                              ? `$${(
                                  Number((userAccountData as any)[0]) / 1e8
                                ).toFixed(2)}`
                              : "$0.00"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 bg-gray-900/50 rounded-xl p-3 border border-purple-500/20">
                        <p className="text-xs text-purple-400 mb-1">
                          预计年收益
                        </p>
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          {aWETHBalance && parseFloat(wethAPY) > 0
                            ? `${(
                                (parseFloat(
                                  formatEther(aWETHBalance as bigint)
                                ) *
                                  parseFloat(wethAPY)) /
                                100
                              ).toFixed(6)} ETH`
                            : "0.000000 ETH"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 取款操作 */}
                <div className="bg-gray-900/50 rounded-xl p-5 border border-red-500/20">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">
                    💸 取款操作
                  </h3>
                  <div className="space-y-3">
                    <NumberInput
                      label="取款金额 (ETH)"
                      value={withdrawAmount}
                      onChange={setWithdrawAmount}
                      placeholder="输入取款金额"
                      step="0.01"
                      min="0"
                      max={
                        aWETHBalance ? formatEther(aWETHBalance as bigint) : "0"
                      }
                      size="sm"
                    />

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          if (aWETHBalance) {
                            setWithdrawAmount(
                              formatEther(aWETHBalance as bigint)
                            );
                          }
                        }}
                        disabled={
                          !aWETHBalance ||
                          (aWETHBalance as bigint) === BigInt(0)
                        }
                        className="px-5 py-3 text-sm bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        全部取出
                      </button>

                      <button
                        onClick={handleWithdraw}
                        disabled={
                          !isConnected ||
                          withdrawWETH.isPending ||
                          !withdrawAmount ||
                          !aWETHBalance ||
                          (aWETHBalance as bigint) === BigInt(0)
                        }
                        className="relative flex-1 group/withdraw disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-60 group-hover/withdraw:opacity-100 transition group-disabled/withdraw:opacity-30"></div>
                        <div className="relative px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-bold shadow-lg hover:shadow-red-500/50 transition-all duration-300 group-hover/withdraw:scale-105">
                          {withdrawWETH.isPending
                            ? "🔄 处理中..."
                            : "💰 确认取款"}
                        </div>
                      </button>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/20 mt-3">
                      <p className="text-xs text-cyan-400 flex items-start">
                        <span className="mr-2">💡</span>
                        <span>
                          提示：取款后资金将返回到您的钱包地址（需支付 Gas
                          费用）
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isConnected && (
            <div className="relative mt-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-50"></div>
              <div className="relative bg-gray-900/90 backdrop-blur-xl border border-red-500/50 rounded-xl p-4 text-center">
                <p className="text-red-400 text-sm font-semibold">
                  ⚠️ 请先连接钱包
                </p>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
