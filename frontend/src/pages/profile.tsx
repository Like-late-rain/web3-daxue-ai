import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import PurchasedCourseCard from '@/components/PurchasedCourseCard';
import { useAccount, useBalance, useEnsName } from 'wagmi';
import { useYCToken } from '@/hooks/useYCToken';
import { useUniversityCourse } from '@/hooks/useUniversityCourse';
import { formatEther, shortenAddress } from '@/utils/helpers';
import { Wallet, BookOpen, User } from 'lucide-react';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: ethBalance } = useBalance({ address });
  const { useBalance: useYCTBalance } = useYCToken();
  const { data: yctBalance } = useYCTBalance(address);
  const { useStudentCourses } = useUniversityCourse();
  const { data: courseIds } = useStudentCourses(address);

  const [nickname, setNickname] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  const handleSaveNickname = async () => {
    // TODO: 使用 MetaMask 签名保存昵称
    // 这里需要实现签名逻辑
    setIsEditingNickname(false);
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">请先连接钱包</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>个人中心 - Web3 涂山大学</title>
      </Head>

      <Layout>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">个人中心</h1>

        {/* 用户信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {isEditingNickname ? (
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="输入昵称"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900">
                    {nickname || ensName || shortenAddress(address || '')}
                  </h2>
                )}
                <button
                  onClick={
                    isEditingNickname
                      ? handleSaveNickname
                      : () => setIsEditingNickname(true)
                  }
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {isEditingNickname ? '保存' : '编辑'}
                </button>
              </div>
              <p className="text-sm text-gray-500 font-mono">{address}</p>
              {ensName && (
                <p className="text-sm text-primary-600 mt-1">{ensName}</p>
              )}
            </div>
          </div>

          {/* 余额信息 */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet size={16} className="text-gray-500" />
                <p className="text-sm text-gray-500">ETH 余额</p>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {ethBalance ? formatEther(ethBalance.value) : '0.0000'}
              </p>
            </div>

            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet size={16} className="text-primary-500" />
                <p className="text-sm text-primary-600">YCT 余额</p>
              </div>
              <p className="text-xl font-bold text-primary-600">
                {yctBalance ? formatEther(yctBalance as bigint) : '0.0000'}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet size={16} className="text-green-500" />
                <p className="text-sm text-green-600">USDT 余额</p>
              </div>
              <p className="text-xl font-bold text-green-600">0.00</p>
              <p className="text-xs text-gray-500 mt-1">待实现</p>
            </div>
          </div>
        </div>

        {/* 我的课程 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BookOpen className="text-primary-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">我的课程</h2>
          </div>

          {courseIds && courseIds.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseIds.map((id) => {
                const courseId = Number(id);
                return <PurchasedCourseCard key={courseId} courseId={courseId} />;
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p>还没有购买任何课程</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
