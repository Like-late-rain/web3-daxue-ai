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
  const { data: ethBalance, refetch: refetchETHBalance } = useBalance({ address });
  const { useBalance: useYCTBalance } = useYCToken();
  const { data: yctBalance, refetch: refetchYCTBalance } = useYCTBalance(address);

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
      refetchETHBalance(),        // 刷新 ETH 余额
      refetchYCTBalance(),        // 刷新 YCT 余额
      refetchWETHBalance(),       // 刷新 WETH 余额
      refetchAWETHBalance(),      // 刷新 aWETH 余额
      refetchAUSDTBalance(),      // 刷新 aUSDT 余额
      refetchUserAccount()        // 刷新 AAVE 账户数据
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">AAVE 理财</h1>

          {/* 提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle
              className="text-blue-600 flex-shrink-0 mt-1"
              size={20}
            />
            <div>
              <p className="text-sm text-blue-800 font-semibold mb-1">
                AAVE 协议集成
              </p>
              <p className="text-sm text-blue-700">
                您可以将 ETH 或 YCT 存入 AAVE 协议赚取收益。YCT 会自动转换为 ETH
                后存入。存款将自动生成利息。
              </p>
            </div>
          </div>

          {/* 教育提示 - 测试网说明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle
              className="text-yellow-600 flex-shrink-0 mt-1"
              size={20}
            />
            <div>
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                📚 教育提示：关于测试网收益率
              </p>
              <p className="text-sm text-yellow-700 mb-2">
                当前使用 <strong>Sepolia 测试网</strong>，APY 接近 0%
                是正常现象。这是因为测试网几乎没有借款需求，资金利用率接近 0%。
              </p>
              <p className="text-sm text-yellow-700">
                <strong>主网参考收益率：</strong> WETH 约 1-2% APY，USDT 约 3-5%
                APY。 本课程重点是学习 DeFi 协议的工作原理和智能合约交互。
              </p>
            </div>
          </div>

          {/* 余额显示 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 mb-2">可用 ETH</p>
              <p className="text-2xl font-bold text-gray-900">
                {ethBalance ? formatEther(ethBalance.value) : "0.0000"} ETH
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 mb-2">可用 YCT</p>
              <p className="text-2xl font-bold text-primary-600">
                {yctBalance ? formatEther(yctBalance as bigint) : "0.0000"} YCT
              </p>
            </div>
          </div>

          {/* 存款区域 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              存款到 AAVE
            </h2>

            <div className="space-y-6">
              {/* 资产类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择资产
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setDepositType("ETH")}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      depositType === "ETH"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    ETH
                  </button>
                  <button
                    onClick={() => setDepositType("YCT")}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      depositType === "YCT"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    YCT
                    <span className="text-xs block">自动转为 ETH</span>
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

              {/* 存款按钮 */}
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
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sellYCT.isPending
                  ? "卖出 YCT..."
                  : wrapETH.isPending
                  ? "包装 ETH..."
                  : approveWETH.isPending || approveUSDT.isPending
                  ? "授权中..."
                  : supplyWETH.isPending || supplyUSDT.isPending
                  ? "存入中..."
                  : "存入 AAVE"}
              </button>
            </div>
          </div>

          {/* 我的存款 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">我的存款</h2>
              <button
                onClick={refreshAllBalances}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                刷新数据
              </button>
            </div>

            <div className="space-y-6">
              {/* 总存款显示 */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-100">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">总存款</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {aWETHBalance
                        ? formatEther(aWETHBalance as bigint)
                        : "0.0000"}{" "}
                      ETH
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-primary-200">
                    <div>
                      <p className="text-xs text-gray-600">当前 APY</p>
                      <p className="text-lg font-semibold text-green-600">
                        {wethAPY}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">总存款价值</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {userAccountData
                          ? `$${(
                              Number((userAccountData as any)[0]) / 1e8
                            ).toFixed(2)}`
                          : "$0.00"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3">
                    <p className="text-xs text-gray-600 mb-1">预计年收益</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {aWETHBalance && parseFloat(wethAPY) > 0
                        ? `${(
                            (parseFloat(formatEther(aWETHBalance as bigint)) *
                              parseFloat(wethAPY)) /
                            100
                          ).toFixed(6)} ETH`
                        : "0.000000 ETH"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 取款操作 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  取款操作
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

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (aWETHBalance) {
                          setWithdrawAmount(
                            formatEther(aWETHBalance as bigint)
                          );
                        }
                      }}
                      disabled={
                        !aWETHBalance || (aWETHBalance as bigint) === BigInt(0)
                      }
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {withdrawWETH.isPending ? "处理中..." : "确认取款"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    💡 提示：取款后资金将返回到您的钱包地址（需支付 Gas 费用）
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isConnected && (
            <p className="text-center text-red-500 text-sm mt-6">
              请先连接钱包
            </p>
          )}
        </div>
      </Layout>
    </>
  );
}
