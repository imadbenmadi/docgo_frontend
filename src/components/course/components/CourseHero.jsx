import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FaClock, FaStar, FaUsers, FaVideo } from "react-icons/fa";
import { useFavorite } from "../../../hooks/useFavorite";
import RichTextDisplay from "../../Common/RichTextEditor/RichTextDisplay";

const CourseHero = ({ course, courseStats, formatTotalDuration }) => {
  const { t } = useTranslation();
  // Handle different ID field names
  const courseId = course?.id || course?.ID || course?.Id;

  // Add favorite functionality
  const {
    isFavorited,
    loading: favoriteLoading,
    toggleFavorite,
  } = useFavorite(courseId, "course");

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Create item object for local storage
    const courseItem = {
      id: courseId,
      title: course.Title || course.title,
      description: course.Description || course.description,
      price: course.Price || course.price,
      discountPrice: course.discountPrice,
      currency: course.Currency || course.currency,
      level: course.Level || course.level,
      Image: course.Image || course.Image,
    };

    toggleFavorite(courseItem);
  };

  return (
    <div className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          className={`p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-md border
                                             border-white/30 hover:bg-white/30 transition-all duration-200 ${
                                               favoriteLoading
                                                 ? "opacity-50 cursor-not-allowed"
                                                 : "hover:scale-110"
                                             }`}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorited ? (
            <BsHeartFill className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          ) : (
            <BsHeart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          )}
        </button>
      </div>
      {/* Creative Medical Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        {/* Medical DNA Helix Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="dna-helix"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M20 10 Q50 30 80 10 Q50 50 20 70 Q50 90 80 70"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="20" cy="10" r="3" fill="rgba(255,255,255,0.1)" />
                <circle cx="80" cy="10" r="3" fill="rgba(255,255,255,0.1)" />
                <circle cx="20" cy="70" r="3" fill="rgba(255,255,255,0.1)" />
                <circle cx="80" cy="70" r="3" fill="rgba(255,255,255,0.1)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dna-helix)" />
          </svg>
        </div>

        {/* Floating Medical Icons */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-5 right-20 text-white/10 text-4xl lg:text-6xl animate-pulse">
            <FaVideo />
          </div>
          <div className="absolute top-40 right-32 text-white/15 text-3xl lg:text-4xl animate-bounce"></div>
          <div className="absolute bottom-32 left-32 text-white/20 text-4xl lg:text-5xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 text-white/20 text-5xl lg:text-6xl animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/5 text-6xl lg:text-8xl"></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className=" z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl relative">
          {/* Favorite Button - Top Right */}

          {/* Course Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {course.Title || course.title}
          </h1>

          {/* Course Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-6 sm:mb-8 leading-relaxed">
            {course.shortDescription || course.subtitle}
          </p>

          {/* Course Description */}
          <div className="text-base sm:text-lg text-white mb-8 sm:mb-10 leading-relaxed max-w-3xl">
            <RichTextDisplay
              content={course.Description || course.description}
              className="text-white"
            />
          </div>

          {/* Course Tags */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            <span className="bg-green-500/20 text-green-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-green-400/30">
              {course.Level || course.level || "Beginner"}
            </span>
            {course.uploadType === "zip" && (
              <span className="bg-purple-500/20 text-purple-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-purple-400/30 flex items-center gap-1">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v8m0 0l3-3m-3 3l-3-3M7 12h10"
                  />
                </svg>
                {t("resources", "Resources")}
              </span>
            )}
            <span className="bg-blue-500/20 text-blue-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-blue-400/30">
              {course.Language || course.language || "English"}
            </span>
            <span className="bg-purple-500/20 text-purple-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-purple-400/30">
              {course.Category || course.category || "Medical Education"}
            </span>
            <span className="bg-orange-500/20 text-orange-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-orange-400/30">
              {course.Field || course.field || "Healthcare"}
            </span>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-lg mb-2 sm:mb-3 lg:mb-4">
                <FaVideo className="text-blue-300 text-sm sm:text-lg lg:text-xl" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                {course.videos?.length || 0}
              </div>
              <div className="text-blue-200 text-xs sm:text-sm">Videos</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-lg mb-2 sm:mb-3 lg:mb-4">
                <FaClock className="text-green-300 text-sm sm:text-lg lg:text-xl" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                {course.duration
                  ? formatTotalDuration(course.duration * 60) // Convert minutes to seconds
                  : "0h 0m"}
              </div>
              <div className="text-blue-200 text-xs sm:text-sm">
                {t("course_data.duration", "Duration") || "Duration"}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-500/20 rounded-lg mb-2 sm:mb-3 lg:mb-4">
                <FaUsers className="text-orange-300 text-sm sm:text-lg lg:text-xl" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                {courseStats?.enrolledCount || 0}
              </div>
              <div className="text-blue-200 text-xs sm:text-sm">
                {t("course_data.students", "Students") || "Students"}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-500/20 rounded-lg mb-2 sm:mb-3 lg:mb-4">
                <FaStar className="text-yellow-300 text-sm sm:text-lg lg:text-xl" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                {courseStats?.averageRating?.toFixed(1) || "0.0"}
              </div>
              <div className="text-blue-200 text-xs sm:text-sm">
                {t("course_data.rating", "Rating") || "Rating"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CourseHero.propTypes = {
  course: PropTypes.object.isRequired,
  courseStats: PropTypes.object,
  formatTotalDuration: PropTypes.func.isRequired,
};

export default CourseHero;
