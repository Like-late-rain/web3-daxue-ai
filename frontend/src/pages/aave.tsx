import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useAccount, useBalance } from 'wagmi';
import { useYCToken } from '@/hooks/useYCToken';
import { formatEther } from '@/utils/helpers';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function AAVE() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { useBalance: useYCTBalance } = useYCToken();
  const { data: yctBalance } = useYCTBalance(address);

  const [depositType, setDepositType] = useState<'ETH' | 'YCT'>('ETH');
  const [amount, setAmount] = useState('');

  // TODO: 实现 AAVE 集成逻辑
  const handleDeposit = async () => {
    // 实现存款逻辑
  };

  const handleWithdraw = async () => {
    // 实现取款逻辑
  };

  return (
    <>
      <Head>
        <title>AAVE 理财 - Web3 涂山大学</title>
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">AAVE 理财</h1>

          {/* 警告提示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-sm text-yellow-800 font-semibold mb-1">
                功能开发中
              </p>
              <p className="text-sm text-yellow-700">
                AAVE 集成功能正在开发中。您可以将 ETH 和 YCT（转换为 USDT）存入 AAVE 协议赚取收益。
              </p>
            </div>
          </div>

          {/* 余额显示 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 mb-2">可用 ETH</p>
              <p className="text-2xl font-bold text-gray-900">
                {ethBalance ? formatEther(ethBalance.value) : '0.0000'} ETH
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-500 mb-2">可用 YCT</p>
              <p className="text-2xl font-bold text-primary-600">
                {yctBalance ? formatEther(yctBalance as bigint) : '0.0000'} YCT
              </p>
            </div>
          </div>

          {/* 存款区域 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">存款到 AAVE</h2>

            <div className="space-y-6">
              {/* 资产类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择资产
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setDepositType('ETH')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      depositType === 'ETH'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ETH
                  </button>
                  <button
                    onClick={() => setDepositType('YCT')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      depositType === 'YCT'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    YCT（转 USDT）
                  </button>
                </div>
              </div>

              {/* 金额输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  存款金额
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`输入 ${depositType} 数量`}
                />
              </div>

              {/* APY 显示 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span className="text-sm text-green-700 font-semibold">
                      当前 APY
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    ~2.5%
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  实际收益率会根据 AAVE 协议实时变化
                </p>
              </div>

              {/* 存款按钮 */}
              <button
                onClick={handleDeposit}
                disabled={!isConnected}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                存入 AAVE
              </button>
            </div>
          </div>

          {/* 我的存款 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">我的存款</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm text-gray-500">ETH 存款</p>
                  <p className="text-lg font-semibold text-gray-900">0.0000 ETH</p>
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold disabled:opacity-50"
                >
                  取款
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm text-gray-500">USDT 存款（来自 YCT）</p>
                  <p className="text-lg font-semibold text-gray-900">0.00 USDT</p>
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={!isConnected}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold disabled:opacity-50"
                >
                  取款
                </button>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-primary-700">
                  <span className="font-semibold">总收益：</span> 0.00
                </p>
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
