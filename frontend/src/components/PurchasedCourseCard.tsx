import { useUniversityCourse } from '@/hooks/useUniversityCourse';
import CourseCard from './CourseCard';

interface PurchasedCourseCardProps {
  courseId: number;
}

export default function PurchasedCourseCard({ courseId }: PurchasedCourseCardProps) {
  const { useCourse } = useUniversityCourse();
  const { data: course, isLoading } = useCourse(courseId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return <CourseCard course={course} />;
}
