import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/Layout';
import { useUniversityCourse } from '@/hooks/useUniversityCourse';
import { useYCToken } from '@/hooks/useYCToken';
import { useAccount } from 'wagmi';
import { formatEther, shortenAddress } from '@/utils/helpers';
import { BookOpen, Users, Calendar } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import addresses from '@/contracts/addresses.json';

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const courseId = id ? parseInt(id as string) : 0;

  const { address, isConnected } = useAccount();
  const { useCourse, usePurchaseCourse, useHasPurchased } = useUniversityCourse();
  const { useApprove } = useYCToken();

  const { data: course, isLoading } = useCourse(courseId);
  const { data: hasPurchased } = useHasPurchased(courseId, address);
  const { purchaseCourse, isPending: isPurchasing } = usePurchaseCourse();
  const { approve, isPending: isApproving } = useApprove();

  const handlePurchase = async () => {
    if (!isConnected) {
      showErrorToast('请先连接钱包');
      return;
    }

    if (!course) return;

    try {
      // 先授权 YCT
      await approve(addresses.UniversityCourse, course.priceYCT);
      showSuccessToast('授权成功，正在购买课程...');

      // 然后购买课程
      await purchaseCourse(courseId);
    } catch (error: any) {
      showErrorToast(error.message || '购买失败');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">课程不存在</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{course.title} - Web3 涂山大学</title>
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* 课程封面 */}
          <div className="relative h-96 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg overflow-hidden mb-8">
            {course.coverUrl ? (
              <Image
                src={course.coverUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={128} className="text-primary-300" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {/* 课程标题 */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>

            {/* 课程元信息 */}
            <div className="flex items-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <Users size={20} />
                <span>{course.totalStudents.toString()} 学生</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={20} />
                <span>
                  {new Date(Number(course.createdAt) * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* 教师信息 */}
            <div className="mb-6">
              <p className="text-sm text-gray-500">教师</p>
              <p className="text-gray-900 font-mono">
                {shortenAddress(course.instructor)}
              </p>
            </div>

            {/* 课程描述 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">课程描述</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {course.description}
              </p>
            </div>

            {/* 价格和购买 */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">课程价格</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatEther(course.priceYCT)} YCT
                  </p>
                </div>

                <div>
                  {hasPurchased ? (
                    <button
                      disabled
                      className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold cursor-not-allowed"
                    >
                      已购买
                    </button>
                  ) : course.instructor.toLowerCase() === address?.toLowerCase() ? (
                    <button
                      disabled
                      className="px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed"
                    >
                      自己的课程
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={!isConnected || isPurchasing || isApproving}
                      className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPurchasing || isApproving ? '处理中...' : '购买课程'}
                    </button>
                  )}
                </div>
              </div>

              {!isConnected && (
                <p className="text-center text-red-500 text-sm mt-4">
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
