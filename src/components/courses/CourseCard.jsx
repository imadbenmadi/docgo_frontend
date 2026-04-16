import { t } from "i18next";
import { useState } from "react";
import { BsHeartFill, BsHeart } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useFavorite } from "../../hooks/useFavorite";
import { Award, Star, BookOpen, PlayCircle } from "lucide-react";
import PropTypes from "prop-types";
import ImageWithFallback from "../Common/ImageWithFallback";
import { buildApiUrl } from "../../utils/apiBaseUrl";
export function CourseCard({
  course,
  id,
  Image,
  title,
  description,
  price,
  discountPrice,
  currency = "DZD",
  level,
  averageRating,
  totalReviews,
  isEnrolled = false,
  enrollmentStatus,
  progress = 0,
  hasImage = true,
}) {
  const defaultThumbnail =
    "https://backend.healthpathglobal.com/Courses_Pictures/default-course-thumbnail.jpeg";

  const {
    isFavorited,
    loading: favoriteLoading,
    toggleFavorite,
  } = useFavorite(id, "course");

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const courseItem = {
      id,
      title,
      description,
      price,
      discountPrice,
      currency,
      level,
      Image: Image || defaultThumbnail,
      hasImage,
    };
    toggleFavorite(courseItem);
  };

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
    isEnrolled &&
    enrollmentStatus === "approved" &&
    progress > 0 &&
    course.uploadType !== "zip";

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group flex flex-col h-full">
      {/* Enrollment ribbon */}
      {isEnrolled && enrollmentStatus === "approved" && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold py-1 text-center tracking-wide">
          {t("Enrolled", "Enrolled") || "Enrolled"}
        </div>
      )}

      {/* Top badges row */}
      <div
        className={`absolute z-20 flex items-start gap-2 ${isEnrolled && enrollmentStatus === "approved" ? "top-7" : "top-3"} left-3 right-3 justify-between`}
      >
        {/* Heart */}
        <button
          onClick={handleToggleFavorite}
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all duration-200 ${favoriteLoading ? "opacity-50" : "hover:bg-black/50"}`}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorited ? (
            <BsHeartFill className="w-4 h-4 text-red-400" />
          ) : (
            <BsHeart className="w-4 h-4 text-white" />
          )}
        </button>
        <div className="flex gap-1.5">
          {isFree && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              FREE
            </span>
          )}
          {course.uploadType === "zip" && (
            <span className="bg-purple-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <svg
                className="w-3 h-3"
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
              {t("zipCourse", "ZIP Course") || "ZIP Course"}
            </span>
          )}
          {course.isFeatured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-amber-900" />
              Featured
            </span>
          )}
          {/* {course.certificate && (
            <span className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Award className="w-3 h-3" />
              {t("certificate", "Certificate") || "Certificate"}
            </span>
          )} */}
        </div>
      </div>

      {/* Course Image */}
      <div
        className={`${isEnrolled && enrollmentStatus === "approved" ? "mt-6" : ""} h-44 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <ImageWithFallback
          type="course"
          src={buildApiUrl(Image)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-90 transition-all duration-300 drop-shadow-lg" />
        </div>
      </div>

      {/* Course Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Description */}
        {/* {description && (
          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
        )} */}

        {/* Rating */}
        {averageRating !== undefined && averageRating !== null && (
          <div className="flex items-center gap-1.5 mb-3">
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
            <span className="text-xs text-gray-400">({totalReviews || 0})</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {level && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              {level}
            </span>
          )}
          {course.uploadType === "zip" && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              {t("zipCourse", "ZIP Course") || "ZIP Course"}
            </span>
          )}
          {course.Category && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {course.Category}
            </span>
          )}
          {course.certificate && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
              {t("Certificate", "certificate") || "Cert"}
            </span>
          )}
          {course.Language && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              {course.Language}
            </span>
          )}
        </div>

        {/* Spacer to push price/button down */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
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
                <span className="text-sm text-gray-400 line-through">
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
              className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full border ${enrollmentColor}`}
            >
              {enrollmentLabel}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {shouldShowProgress && (
          <div className="mb-3">
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

        {/* Action Button */}
        <Link
          to={`/Courses/${id}`}
          onClick={() => window.scrollTo(0, 0)}
          className={`w-full text-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isEnrolled && enrollmentStatus === "approved"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isEnrolled && enrollmentStatus === "approved"
            ? course.uploadType === "zip"
              ? t("openZipContent", "Open ZIP Content") || "Open ZIP Content"
              : t("ContinueCourse", "Continue Course") || "Continue Course"
            : course.uploadType === "zip"
              ? t("viewZipCourse", "View ZIP Course") || "View ZIP Course"
              : t("View Details", "View Details") || "View Details"}
        </Link>
      </div>
    </article>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    isFeatured: PropTypes.bool,
    Category: PropTypes.string,
    Specialty: PropTypes.string,
    certificate: PropTypes.bool,
    Language: PropTypes.string,
  }).isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  Image: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  price: PropTypes.number,
  discountPrice: PropTypes.number,
  currency: PropTypes.string,
  level: PropTypes.string,
  averageRating: PropTypes.number,
  totalReviews: PropTypes.number,
  isEnrolled: PropTypes.bool,
  enrollmentStatus: PropTypes.string,
  progress: PropTypes.number,
  hasImage: PropTypes.bool,
};
