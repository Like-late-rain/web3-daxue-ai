import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from "wagmi";
import UniversityCourseABI from "@/contracts/UniversityCourse.json";
import addresses from "@/contracts/addresses.json";
import { Course } from "@/types";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export const useUniversityCourse = () => {
  const contractAddress = addresses.UniversityCourse as `0x${string}`;
  const contractChainId = Number(addresses.chainId);

  // 获取课程详情
  const useCourse = (courseId: number) => {
    return useReadContract({
      address: contractAddress,
      abi: UniversityCourseABI.abi,
      functionName: "getCourse",
      args: [courseId],
      chainId: contractChainId,
      query: {
        enabled: courseId > 0
      }
    }) as { data: Course | undefined; isLoading: boolean; error: Error | null };
  };

  // 获取活跃课程列表
  const useActiveCourses = (offset: number = 0, limit: number = 10) => {
    return useReadContract({
      address: contractAddress,
      abi: UniversityCourseABI.abi,
      functionName: "getActiveCourses",
      args: [offset, limit],
      chainId: contractChainId
    }) as {
      data: Course[] | undefined;
      isLoading: boolean;
      error: Error | null;
    };
  };

  // 创建课程
  const useCreateCourse = () => {
    const { data: hash, writeContract, isPending, error } = useWriteContract();
    console.log("🚀 ~ useCreateCourse ~ isPending:", isPending);
    console.log("🚀 ~ useCreateCourse ~ error:", error);

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt(
      {
        hash
      }
    );

    const createCourse = (
      title: string,
      description: string,
      coverUrl: string,
      priceYCT: bigint
    ) => {
      console.log("创建课程，参数:", { title, description, coverUrl, priceYCT, contractAddress, chainId: contractChainId });
      writeContract({
        address: contractAddress,
        abi: UniversityCourseABI.abi,
        functionName: "createCourse",
        args: [title, description, coverUrl, priceYCT],
        chainId: contractChainId
      });
    };

    return {
      createCourse,
      isPending: isPending || isConfirming,
      isSuccess,
      hash,
      error
    };
  };

  // 购买课程
  const usePurchaseCourse = () => {
    const { data: hash, writeContract, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt(
      {
        hash
      }
    );

    const purchaseCourse = (courseId: number) => {
      try {
        writeContract({
          address: contractAddress,
          abi: UniversityCourseABI.abi,
          functionName: "purchaseCourse",
          args: [courseId],
          chainId: contractChainId
        });
      } catch (error: any) {
        showErrorToast(error.message || "购买失败");
      }
    };

    return {
      purchaseCourse,
      isPending: isPending || isConfirming,
      isSuccess
    };
  };

  // 检查是否已购买
  const useHasPurchased = (courseId: number, userAddress?: string) => {
    return useReadContract({
      address: contractAddress,
      abi: UniversityCourseABI.abi,
      functionName: "hasUserPurchased",
      args: courseId > 0 && userAddress ? [courseId, userAddress] : undefined,
      chainId: contractChainId,
      query: {
        enabled: courseId > 0 && !!userAddress
      }
    });
  };

  // 获取学生的课程
  const useStudentCourses = (studentAddress?: string) => {
    return useReadContract({
      address: contractAddress,
      abi: UniversityCourseABI.abi,
      functionName: "getStudentCourses",
      args: studentAddress ? [studentAddress] : undefined,
      chainId: contractChainId,
      query: {
        enabled: !!studentAddress
      }
    });
  };

  // 获取课程计数器
  const useCourseCounter = () => {
    return useReadContract({
      address: contractAddress,
      abi: UniversityCourseABI.abi,
      functionName: "courseCounter",
      chainId: contractChainId
    });
  };

  return {
    useCourse,
    useActiveCourses,
    useCreateCourse,
    usePurchaseCourse,
    useHasPurchased,
    useStudentCourses,
    useCourseCounter
  };
};
