import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCourse } from "../hooks/useCourse";
import ZipCourseBrowser from "../components/courses/ZipCourseBrowser";

export default function CourseExploreZip() {
  const { t, i18n } = useTranslation();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { courseData, loading, hasData, canAccessContent } =
    useCourse(courseId);

  const course = courseData?.course;
  const isZipCourse = String(course?.uploadType || "").toLowerCase() === "zip";

  const title = useMemo(() => {
    if (!course) return "";
    if (i18n.language === "ar" && course.Title_ar) return course.Title_ar;
    return course.Title || "";
  }, [course, i18n.language]);

  useEffect(() => {
    if (!hasData) return;

    // Must be a ZIP course
    if (!isZipCourse) {
      navigate(`/Courses/${courseId}/watch`, { replace: true });
      return;
    }

    // Must have access to content (approved/enrolled)
    if (!canAccessContent) {
      navigate(`/Courses/${courseId}`, { replace: true });
    }
  }, [hasData, isZipCourse, canAccessContent, courseId, navigate]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-gray-600">{t("loading", "Loading...")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t("exploreCourse", "Explore the course")}
        </h1>
        {title && <div className="text-sm text-gray-600 mt-1">{title}</div>}
      </div>

      <ZipCourseBrowser courseId={courseId} />
    </div>
  );
}
