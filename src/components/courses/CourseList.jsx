import { useState } from "react";
import { useTranslation } from "react-i18next";
import ImageWithFallback from "../Common/ImageWithFallback";
import PropTypes from "prop-types";
import {
  Award,
  BookOpen,
  PlayCircle,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useFavorite } from "../../hooks/useFavorite";
import { buildApiUrl } from "../../utils/apiBaseUrl";

// Individual list-row item - mirrors CourseCard logic in a horizontal layout
function CourseListItem({ course }) {
  const { t } = useTranslation();

  const id = course.id;
  const title = course.Title;
  const description = course.shortDescription;
  const Image = course.Image || course.coverImage;
  const price = Number(course.Price) || 0;
  const discountPrice =
    course.discountPrice !== undefined && course.discountPrice !== null
      ? Number(course.discountPrice)
      : undefined;
  const currency = course.Currency || "DZD";
  const level = course.Level || course.difficulty;
  const averageRating = course.stats?.averageRating || course.Rate;
  const totalReviews = course.stats?.totalcourse_reviews || course.totalRatings;
  const isEnrolled = course.userStatus?.isEnrolled || false;
  const enrollmentStatus = course.userStatus?.enrollmentStatus;
  const progress = course.userStatus?.progress || 0;

  const {
    isFavorited,
    loading: favLoading,
    toggleFavorite,
  } = useFavorite(id, "course");

  const isFree =
    discountPrice !== undefined && discountPrice !== null
      ? discountPrice === 0
      : price === 0 || !price;

  const formatPrice = (p) => {
    if (!p || p === 0) return t("free", "Free") || "Free";
    return `${Number(p).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
  };

  const enrollmentLabel = !isEnrolled
    ? null
    : enrollmentStatus === "pending"
      ? t("ApplicationPending", "Application Pending") || "Pending"
      : enrollmentStatus === "approved"
        ? t("Enrolled", "Enrolled") || "Enrolled"
        : enrollmentStatus === "rejected"
          ? t("ApplicationRejected", "Application Rejected") || "Rejected"
          : null;

  const enrollmentColor =
    enrollmentStatus === "approved"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : enrollmentStatus === "pending"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-red-100 text-red-700 border-red-200";

  const shouldShowProgress =
    isEnrolled && enrollmentStatus === "approved" && progress > 0;

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id,
      title,
      description,
      price,
      discountPrice,
      currency,
      level,
      Image,
    });
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
      {/* Enrolled top ribbon */}
      {isEnrolled && enrollmentStatus === "approved" && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold py-1 text-center tracking-wide">
          {t("Enrolled", "Enrolled") || "Enrolled"}
        </div>
      )}

      <div
        className={`flex flex-col sm:flex-row ${isEnrolled && enrollmentStatus === "approved" ? "pt-6" : ""}`}
      >
        {/*  Image  */}
        <div className="relative sm:w-52 sm:flex-shrink-0 h-44 sm:h-auto bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          <ImageWithFallback
            type="course"
            src={buildApiUrl(Image)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Hover play overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <PlayCircle className="w-10 h-10 text-white opacity-0 group-hover:opacity-90 transition-all duration-300 drop-shadow-lg" />
          </div>
          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all duration-200 ${favLoading ? "opacity-50" : "hover:bg-black/50"}`}
          >
            {isFavorited ? (
              <BsHeartFill className="w-4 h-4 text-red-400" />
            ) : (
              <BsHeart className="w-4 h-4 text-white" />
            )}
          </button>
          {/* Image-area badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {isFree && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                FREE
              </span>
            )}
            {course.isFeatured && (
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Star className="w-2.5 h-2.5 fill-amber-900" />
                Featured
              </span>
            )}
            {/* {course.certificate && (
              <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Award className="w-2.5 h-2.5" />
                {t("certificate", "Certificate") || "Cert"}
              </span>
            )} */}
          </div>
        </div>

        {/*  Content  */}
        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
          {/* Left: main info */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">
              {title}
            </h3>
            {/* {description && (
              <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-2">
                {description}
              </p>
            )} */}

            {/* Rating */}
            {averageRating !== undefined && averageRating !== null && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.floor(averageRating)
                          ? "text-amber-400 fill-amber-400"
                          : star === Math.ceil(averageRating) &&
                              averageRating % 1 !== 0
                            ? "text-amber-400 fill-amber-200"
                            : "text-gray-300 fill-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({totalReviews || 0})
                </span>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
              {level && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  {level}
                </span>
              )}
              {course.Category && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {course.Category}
                </span>
              )}
              {course.certificate && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {t("Certificate", "certificate") || "Certificate"}
                </span>
              )}
              {course.Language && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  {course.Language}
                </span>
              )}
            </div>
          </div>

          {/* Right: price + enrollment + button */}
          <div className="sm:w-40 flex flex-col items-start sm:items-end justify-between gap-3 flex-shrink-0">
            {/* Price */}
            <div className="flex flex-col items-start sm:items-end gap-0.5">
              {isFree ? (
                <span className="text-xl font-bold text-emerald-600">
                  {t("free", "Free") || "Free"}
                </span>
              ) : discountPrice !== undefined && discountPrice !== null ? (
                <>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(discountPrice)}
                  </span>
                  {price > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(price)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(price)}
                </span>
              )}
              {enrollmentLabel && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${enrollmentColor}`}
                >
                  {enrollmentLabel}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {shouldShowProgress && (
              <div className="w-full sm:w-40">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t("Progress", "Progress") || "Progress"}</span>
                  <span className="font-semibold text-blue-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <Link
              to={`/Courses/${id}`}
              onClick={() => window.scrollTo(0, 0)}
              className={`w-full sm:w-auto text-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                isEnrolled && enrollmentStatus === "approved"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isEnrolled && enrollmentStatus === "approved"
                ? t("ContinueCourse", "Continue Course") || "Continue"
                : t("View Details", "View Details") || "View Details"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

CourseListItem.propTypes = {
  course: PropTypes.object.isRequired,
};

export function CourseList({
  courses = [],
  loading = false,
  pagination,
  onPageChange,
  onCourseClick: _onCourseClick,
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
          >
            <div className="flex gap-6">
              <div className="w-52 h-36 bg-gray-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                </div>
              </div>
              <div className="w-36 flex flex-col gap-3 items-end">
                <div className="h-7 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 p-12 bg-white rounded-2xl shadow-sm">
        <div className="text-6xl mb-4"></div>
        <p className="text-gray-600 text-xl font-medium mb-2">
          {t("NoCoursesFound", "No Courses Found") || "No courses found"}
        </p>
        <p className="text-gray-500 text-center max-w-md">
          {t("TryAdjustingFilters", "Try Adjusting Filters") ||
            "Try adjusting your search filters or browse different categories"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative transition-all duration-300">
      <div className="space-y-4">
        {courses.map((course) => (
          <CourseListItem key={course.id} course={course} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() =>
              onPageChange && onPageChange(pagination.currentPage - 1)
            }
            disabled={pagination.currentPage <= 1}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange && onPageChange(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    pagination.currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {page}
                </button>
              );
            },
          )}

          <button
            onClick={() =>
              onPageChange && onPageChange(pagination.currentPage + 1)
            }
            disabled={pagination.currentPage >= pagination.totalPages}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}

CourseList.propTypes = {
  courses: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    totalCourses: PropTypes.number,
  }),
  onPageChange: PropTypes.func,
  onCourseClick: PropTypes.func,
};

export default CourseList;
