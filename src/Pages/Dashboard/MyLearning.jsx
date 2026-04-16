import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import MainLoading from "../../MainLoading";
import apiClient from "../../services/apiClient";
import ImageWithFallback from "../../components/Common/ImageWithFallback";

const MyLearning = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/Users/${user.id}/Profile`);
        const courses = response.data?.data?.enrollments?.courses || [];
        setEnrollments(Array.isArray(courses) ? courses : []);
      } catch (error) {
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  if (loading) return <MainLoading />;

  return (
    <div className={`p-4 sm:p-6 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("dashboard.myLearning", "My Learning")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t(
                "dashboard.myLearningSubtitle",
                "Your enrolled courses and progress",
              )}
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {t("dashboard.browseCourses", "Browse Courses")}
          </Link>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("dashboard.noEnrolledCourses", "No Enrolled Courses")}
          </h3>
          <p className="text-gray-600 mb-6">
            {t(
              "dashboard.noEnrolledCoursesDescription",
              "Start learning by enrolling in courses!",
            )}
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("dashboard.browseCourses", "Browse Courses")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {enrollments.map((enrollment) => {
            const course = enrollment.Course;
            const isDeleted = Boolean(course?.isDeleted);
            const title =
              i18n.language === "ar" && course?.Title_ar
                ? course.Title_ar
                : course?.Title;
            return (
              <div
                key={enrollment.id}
                className={`bg-white rounded-lg shadow-sm border transition-shadow ${
                  isDeleted ? "border-red-200" : "hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isDeleted) {
                      const uploadType = String(
                        course?.uploadType || "",
                      ).toLowerCase();
                      navigate(
                        uploadType === "zip"
                          ? `/Courses/${enrollment.CourseId}/explore`
                          : `/Courses/${enrollment.CourseId}/watch`,
                      );
                    }
                  }}
                  disabled={isDeleted}
                  className="w-full text-left"
                >
                  <div className="p-4 flex gap-4">
                    <ImageWithFallback
                      type="course"
                      src={
                        course?.Image
                          ? `${import.meta.env.VITE_API_URL}${course.Image}`
                          : null
                      }
                      alt={title || "Course"}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">
                        {title}
                      </div>
                      {isDeleted && (
                        <div className="mt-1 text-xs font-semibold text-red-600">
                          {t("dashboard.deleted", "Deleted")}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mt-1 truncate">
                        {(i18n.language === "ar" && course?.Category_ar
                          ? course.Category_ar
                          : course?.Category) || ""}
                        {" \u2022 "}
                        {(i18n.language === "ar" && course?.Level_ar
                          ? course.Level_ar
                          : course?.Level) || ""}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isDeleted
                              ? "bg-red-100 text-red-700"
                              : enrollment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isDeleted
                            ? t("dashboard.deleted", "Deleted")
                            : enrollment.status === "completed"
                              ? t("dashboard.completed", "Completed")
                              : t("dashboard.active", "Active")}
                        </span>
                        {course?.uploadType !== "zip" && (
                          <span className="text-xs text-gray-500">
                            {t("dashboard.progress", "Progress")}:{" "}
                            {Math.round(enrollment.progressPercentage || 0)}%
                          </span>
                        )}
                      </div>
                      {isDeleted && (
                        <p className="mt-2 text-xs text-red-600">
                          {t(
                            "dashboard.deletedCourseSupport",
                            "This course has been deleted. Contact support for any considerations regarding your enrollment.",
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLearning;
