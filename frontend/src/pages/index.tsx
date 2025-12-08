import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { BookOpen, Coins, TrendingUp, Award } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Web3 涂山大学 - 去中心化在线课程平台</title>
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            欢迎来到 <span className="text-primary-600">Web3 涂山大学</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            基于区块链的去中心化在线课程平台，使用 YCT 代币购买课程，支持 AAVE 理财
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/market"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              浏览课程
            </Link>
            <Link
              href="/create-course"
              className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition font-semibold"
            >
              创建课程
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-primary-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">优质课程</h3>
            <p className="text-gray-600 text-sm">
              发现并学习优质的 Web3 课程
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="text-secondary-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">YCT 代币</h3>
            <p className="text-gray-600 text-sm">
              使用 YCT 代币购买课程和服务
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">AAVE 理财</h3>
            <p className="text-gray-600 text-sm">
              将 ETH 和 YCT 存入 AAVE 赚取收益
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-yellow-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">去中心化</h3>
            <p className="text-gray-600 text-sm">
              完全去中心化的课程管理和交易
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-8 mt-16 text-white">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-primary-100">活跃用户</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100">优质课程</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-primary-100">YCT 交易量</div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
