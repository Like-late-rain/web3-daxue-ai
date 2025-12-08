import { useState, useMemo } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import SearchBar from "@/components/SearchBar";
import { useUniversityCourse } from "@/hooks/useUniversityCourse";
import { Course } from "@/types";

export default function Market() {
  const [searchQuery, setSearchQuery] = useState("");
  const { useActiveCourses, useCourseCounter } = useUniversityCourse();
  const { data: courses, isLoading } = useActiveCourses(0, 100);
  const { data: courseCounter } = useCourseCounter();

  console.log("=== Market 页面调试信息 ===");
  console.log("courseCounter:", courseCounter?.toString());
  console.log("courses 数据:", courses);
  console.log("courses 数量:", courses?.length || 0);
  console.log("isLoading:", isLoading);

  // 搜索过滤
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!searchQuery) return courses;

    return courses.filter(
      (course: Course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  return (
    <>
      <Head>
        <title>课程市场 - Web3 涂山大学</title>
      </Head>

      <Layout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">课程市场</h1>
          <p className="text-gray-600 mb-6">发现并学习优质的 Web3 课程</p>
          <SearchBar onSearch={setSearchQuery} />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">暂无课程</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: Course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </Layout>
    </>
  );
}
