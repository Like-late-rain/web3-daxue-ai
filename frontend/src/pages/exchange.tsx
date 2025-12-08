import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useYCToken } from '@/hooks/useYCToken';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from '@/utils/helpers';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { parseEther } from 'ethers';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

export default function Exchange() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { useBalance: useYCTBalance, useBuyTokens, useSellTokens } = useYCToken();
  const yctBalanceResult = useYCTBalance(address);
  const { data: yctBalance, refetch: refetchYCTBalance, isError, error: balanceError } = yctBalanceResult;
  const { buyTokens, isPending: isBuying, isSuccess: buySuccess, error: buyError, hash: buyHash } = useBuyTokens();
  const { sellTokens, isPending: isSelling, isSuccess: sellSuccess } = useSellTokens();

  console.log('=== Exchange 页面调试信息 ===');
  console.log('用户地址:', address);
  console.log('YCT 余额查询结果:', yctBalanceResult);
  console.log('YCT 余额 data:', yctBalance);
  console.log('YCT 余额 isError:', isError);
  console.log('YCT 余额 error:', balanceError);
  console.log('购买状态 - isPending:', isBuying, 'isSuccess:', buySuccess);
  console.log('交易 hash:', buyHash);
  console.log('购买错误:', buyError);

  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [ethAmount, setEthAmount] = useState('');
  const [yctAmount, setYCTAmount] = useState('');

  const EXCHANGE_RATE = 10000; // 1 ETH = 10000 YCT

  const handleETHChange = (value: string) => {
    setEthAmount(value);
    if (value) {
      const yct = parseFloat(value) * EXCHANGE_RATE;
      setYCTAmount(yct.toString());
    } else {
      setYCTAmount('');
    }
  };

  const handleYCTChange = (value: string) => {
    setYCTAmount(value);
    if (value) {
      const eth = parseFloat(value) / EXCHANGE_RATE;
      setEthAmount(eth.toString());
    } else {
      setEthAmount('');
    }
  };

  const handleBuy = () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      showErrorToast('请输入有效的 ETH 数量');
      return;
    }

    buyTokens(ethAmount);
  };

  const handleSell = () => {
    if (!yctAmount || parseFloat(yctAmount) <= 0) {
      showErrorToast('请输入有效的 YCT 数量');
      return;
    }

    const amount = parseEther(yctAmount) as bigint;
    sellTokens(amount);
  };

  // 监听购买成功
  useEffect(() => {
    if (buySuccess && buyHash) {
      console.log('🎉 购买成功，准备刷新余额');
      console.log('📝 交易 hash:', buyHash);
      console.log('👤 买家地址:', address);

      // 延迟刷新，确保区块链状态已更新
      setTimeout(() => {
        refetchYCTBalance().then((result) => {
          console.log('💰 余额刷新结果:', result);
          console.log('💰 刷新后的余额 data:', result.data);
        });
      }, 1000);

      showSuccessToast('购买成功！YCT 已到账');
      setEthAmount('');
      setYCTAmount('');
    }
  }, [buySuccess, buyHash, address, refetchYCTBalance]);

  // 监听出售成功
  useEffect(() => {
    if (sellSuccess) {
      showSuccessToast('出售成功！ETH 已到账');
      setEthAmount('');
      setYCTAmount('');
      // 刷新 YCT 余额
      refetchYCTBalance();
    }
  }, [sellSuccess, refetchYCTBalance]);

  return (
    <>
      <Head>
        <title>兑换中心 - Web3 涂山大学</title>
      </Head>

      <Layout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">兑换中心</h1>

          {/* 余额显示 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 mb-2">ETH 余额</p>
              <p className="text-2xl font-bold text-gray-900">
                {ethBalance ? formatEther(ethBalance.value) : '0.0000'} ETH
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 mb-2">YCT 余额</p>
              <p className="text-2xl font-bold text-primary-600">
                {yctBalance ? formatEther(yctBalance as bigint) : '0.0000'} YCT
              </p>
            </div>
          </div>

          {/* 兑换模式切换 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setMode('buy')}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  mode === 'buy'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                购买 YCT
              </button>
              <button
                onClick={() => setMode('sell')}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  mode === 'sell'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                出售 YCT
              </button>
            </div>

            <div className="space-y-4">
              {/* ETH 输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'buy' ? '支付 ETH' : '获得 ETH'}
                </label>
                <input
                  type="number"
                  value={ethAmount}
                  onChange={(e) => handleETHChange(e.target.value)}
                  step="0.0001"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.0000"
                  disabled={mode === 'sell'}
                />
              </div>

              {/* 箭头 */}
              <div className="flex justify-center">
                {mode === 'buy' ? (
                  <ArrowDown className="text-gray-400" size={24} />
                ) : (
                  <ArrowUp className="text-gray-400" size={24} />
                )}
              </div>

              {/* YCT 输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'buy' ? '获得 YCT' : '支付 YCT'}
                </label>
                <input
                  type="number"
                  value={yctAmount}
                  onChange={(e) => handleYCTChange(e.target.value)}
                  step="1"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.0000"
                  disabled={mode === 'buy'}
                />
              </div>

              {/* 汇率提示 */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-700">
                  兑换比例：1 ETH = {EXCHANGE_RATE} YCT
                </p>
              </div>

              {/* 兑换按钮 */}
              <button
                onClick={mode === 'buy' ? handleBuy : handleSell}
                disabled={!isConnected || isBuying || isSelling}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuying || isSelling
                  ? '处理中...'
                  : mode === 'buy'
                  ? '购买 YCT'
                  : '出售 YCT'}
              </button>

              {!isConnected && (
                <p className="text-center text-red-500 text-sm">
                  请先连接钱包
                </p>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
