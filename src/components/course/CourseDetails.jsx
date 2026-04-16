import { useLocation, useParams } from "react-router-dom";
import { IoMdRefresh } from "react-icons/io";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCourse } from "../../hooks/useCourse";
import MainLoading from "../../MainLoading";
import Seo from "../SEO/Seo";

// Import component parts
import CourseHero from "./components/CourseHero";
import CourseSmallCard from "./components/CourseSmallCard";
import CourseContent from "./components/CourseContent";
import CourseReviews from "./components/CourseReviews";
import CourseFAQSection from "./components/CourseFAQSection";

export const CourseDetails = () => {
  const { t, i18n } = useTranslation();
  const { courseId } = useParams();
  const location = useLocation();
  const {
    courseData,
    loading,
    enrolling,
    refetching,
    error,
    hasError,
    retry,
    handleEnrollClick,
    isEnrolled,
    isFree,
    coursePrice,
    currency,
    hasData,
    paymentStatus,
  } = useCourse(courseId);

  if (loading) {
    return (
      <>
        <Seo
          title={t("Course", "Course") || "Course"}
          description={
            t("Course details and learning content on healthpathglobal.", "Course details and learning content on healthpathglobal.") ||
            "Course details and learning content on healthpathglobal."
          }
          canonicalPath={location.pathname}
        />
        <MainLoading />
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <Seo
          title={t("Unable to Load Course", "Unable to Load Course") || "Unable to Load Course"}
          description={
            error || "Something went wrong while loading the course details."
          }
          canonicalPath={location.pathname}
          noIndex={true}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-4xl sm:text-5xl mb-4"></div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Unable to Load Course
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {error ||
                "Something went wrong while loading the course details."}
            </p>
            <button
              onClick={retry}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto text-sm sm:text-base"
            >
              <IoMdRefresh className="mr-2 w-4 h-4" />
              Try Again
            </button>
            <Link
              to="/Courses"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!hasData) {
    return (
      <>
        <Seo
          title={t("Course Not Found", "Course Not Found") || "Course Not Found"}
          description={
            "The course you're looking for doesn't exist or has been removed."
          }
          canonicalPath={location.pathname}
          noIndex={true}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
            <div className="text-gray-400 text-4xl sm:text-5xl mb-4"></div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Course Not Found
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              The course you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Link
              to="/Courses"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 inline-block text-sm sm:text-base"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </>
    );
  }

  const {
    course,
    userStatus,
    courseStats,
    courseProgress,
    certificate,
    upcomingMeets,
    userReview,
  } = courseData;

  const courseTitle =
    i18n.language === "ar" && course?.Title_ar
      ? course.Title_ar
      : course?.Title;
  const courseDescription =
    i18n.language === "ar" && course?.Description_ar
      ? course.Description_ar
      : course?.Description;

  const courseSeoDescription =
    (i18n.language === "ar" && course?.shortDescription_ar
      ? course.shortDescription_ar
      : course?.shortDescription) ||
    courseDescription ||
    "";
  const courseSeoImage = course?.Image
    ? `${import.meta.env.VITE_API_URL || ""}${course.Image}`
    : null;
  const seoDescription = courseSeoDescription
    ? courseSeoDescription.length > 160
      ? `${courseSeoDescription.slice(0, 157)}...`
      : courseSeoDescription
    : t("Course details and learning content on healthpathglobal.", "Course details and learning content on healthpathglobal.") ||
      "Course details and learning content on healthpathglobal.";

  const seoLang = (i18n.language || "en").toLowerCase().startsWith("ar")
    ? "ar"
    : "en";
  const seoLocale = seoLang === "ar" ? "ar_DZ" : "en_US";
  const siteUrl =
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const absoluteUrl = siteUrl ? `${siteUrl}${location.pathname}` : undefined;
  const siteName = import.meta.env.VITE_SITE_NAME || "healthpathglobal";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: courseTitle || t("Course", "Course") || "Course",
    description: seoDescription,
    url: absoluteUrl,
    image: courseSeoImage || undefined,
    provider: {
      "@type": "university",
      name: siteName,
      url: siteUrl || undefined,
    },
  };

  const handleVideoClick = (video) => {
    //setShowVideo(true);
  };

  // Helper function to format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Helper function to format total duration
  const formatTotalDuration = (seconds) => {
    if (!seconds) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <>
      <Seo
        title={courseTitle || t("Course", "Course") || "Course"}
        description={seoDescription}
        canonicalPath={location.pathname}
        image={courseSeoImage}
        type="article"
        lang={seoLang}
        locale={seoLocale}
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-gray-50 w-full">
        {/* Refresh Button */}
        {refetching && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg flex items-center text-sm sm:text-base">
              <IoMdRefresh className="animate-spin mr-2 w-4 h-4" />
              <span className="hidden sm:inline">
                {t("course_data.refreshing", "Refreshing...") || "Refreshing..."}
              </span>
              <span className="sm:hidden">...</span>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <CourseHero
          course={course}
          courseStats={courseStats}
          formatTotalDuration={formatTotalDuration}
        />

        {/* Main Content */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
              {/* Course Content */}
              {course.Image && (
                <img
                  src={import.meta.env.VITE_API_URL + course.Image}
                  alt={course.Title}
                  className="w-full h-58 mb-5 object-cover rounded-lg"
                />
              )}
              <CourseContent
                course={course}
                userStatus={userStatus}
                isEnrolled={isEnrolled}
                handleVideoClick={handleVideoClick}
                formatDuration={formatDuration}
                courseStats={courseStats}
                upcomingMeets={upcomingMeets}
                certificate={certificate}
              />

              {/* Reviews Section */}
              <CourseReviews
                courseStats={courseStats}
                course={course}
                userStatus={userStatus}
                userReview={userReview}
              />

              {/* FAQ Section */}
              <CourseFAQSection faqs={course.RelatedFAQs || []} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-4 lg:space-y-6 order-1 lg:order-2">
              {/* Course Card */}
              <div className="lg:sticky lg:top-6">
                <CourseSmallCard
                  course={course}
                  userStatus={userStatus}
                  courseProgress={courseProgress}
                  certificate={certificate}
                  isEnrolled={isEnrolled}
                  isFree={isFree}
                  coursePrice={coursePrice}
                  currency={currency}
                  enrolling={enrolling}
                  handleEnrollClick={handleEnrollClick}
                  paymentStatus={paymentStatus}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
