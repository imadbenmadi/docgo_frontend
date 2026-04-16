import { BookOpen, Clock, MapPin, Star, Tag } from "lucide-react";
import ImageWithFallback from "../Common/ImageWithFallback";
import PropTypes from "prop-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useFavorite } from "../../hooks/useFavorite";
import { buildApiUrl } from "../../utils/apiBaseUrl";
import {
  getCountryDisplayName,
  getCountryName,
} from "../../utils/countryCodeMap";

export function ProgramCard({
  program,
  onClick,
  language = "en",
  isEnrolled = false,
}) {
  const { t } = useTranslation();

  const getProgramCountryText = () => {
    const raw = program?.programCountry || program?.country || "";
    if (!raw) return "";

    const rawStr = String(raw);
    const isIso2 = /^[a-z]{2}$/i.test(rawStr);
    const frName = isIso2 ? getCountryName(rawStr.toUpperCase()) : rawStr;

    return language === "ar" ? getCountryDisplayName(frName, "ar") : frName;
  };

  const {
    isFavorited,
    loading: favoriteLoading,
    toggleFavorite,
  } = useFavorite(program?.id, "program");

  if (!program) return null;

  const defaultThumbnail = "/placeholder-program.jpg";

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const countryText = getProgramCountryText();
    const programItem = {
      id: program.id,
      title,
      short_description: shortDescription,
      Price: program.Price,
      discountPrice: program.discountPrice,
      university: universityText,
      // Backward-compatible key used by existing favorites UI
      location: countryText,
      country: countryText,
      Image: program.Image || defaultThumbnail,
    };
    toggleFavorite(programItem);
  };

  // Multi-language content handling
  const title =
    language === "ar" && program.title_ar ? program.title_ar : program.title;
  const shortDescription =
    language === "ar" && program.short_description_ar
      ? program.short_description_ar
      : program.short_description;
  const universityText =
    language === "ar" && program.university_ar
      ? program.university_ar
      : program.university;
  const specialtyText =
    program.programSpecialty ||
    (language === "ar" && program.category_ar
      ? program.category_ar
      : program.category);
  const countryText = getProgramCountryText();

  const tags = (() => {
    if (!program.tags) return [];
    if (Array.isArray(program.tags)) return program.tags;
    if (typeof program.tags === "string") {
      try {
        const parsed = JSON.parse(program.tags);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* not JSON */
      }
      return program.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  })();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      language === "ar" ? "ar-DZ" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  };

  const formatPrice = (p) => {
    if (!p || p === 0) return t("free", "Free") || "Free";
    return `${Number(p).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const isFree =
    program.discountPrice !== undefined && program.discountPrice !== null
      ? program.discountPrice === 0
      : !program.Price || program.Price === 0;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "closed":
        return "bg-red-100 text-red-700 border-red-200";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getProgramTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "scholarship":
        return "bg-purple-100 text-purple-700";
      case "exchange":
        return "bg-blue-100 text-blue-700";
      case "grant":
        return "bg-emerald-100 text-emerald-700";
      case "training":
        return "bg-orange-100 text-orange-700";
      case "internship":
        return "bg-teal-100 text-teal-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getProgramTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "scholarship":
        return "";
      case "exchange":
        return "";
      case "grant":
        return "";
      case "training":
        return "";
      case "internship":
        return "";
      default:
        return "";
    }
  };

  const gradientMap = {
    scholarship: "from-purple-500 to-indigo-600",
    exchange: "from-blue-500 to-cyan-600",
    grant: "from-emerald-500 to-teal-600",
    training: "from-orange-500 to-amber-600",
    internship: "from-teal-500 to-green-600",
  };
  const gradientClass =
    gradientMap[program.programType?.toLowerCase()] ||
    "from-blue-500 to-purple-600";

  return (
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative group flex flex-col h-full">
      {/* Enrollment ribbon */}
      {isEnrolled && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold py-1 text-center tracking-wide">
          {t("Enrolled", "Enrolled") || "Enrolled"}
        </div>
      )}

      {/* Top badges */}
      <div
        className={`absolute ${isEnrolled ? "top-7" : "top-3"} left-3 right-3 z-20 flex items-start justify-between`}
      >
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
        <div className="flex gap-1.5 flex-wrap justify-end">
          {isFree && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              FREE
            </span>
          )}
          {program.isFeatured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-amber-900" />
              {t("Featured", "Featured") || "Featured"}
            </span>
          )}
          {program.status && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(program.status)}`}
            >
              {t(program.status) || program.status}
            </span>
          )}
        </div>
      </div>

      {/* Program Image */}
      <div
        className={`${isEnrolled ? "mt-6" : ""} h-44 bg-gradient-to-br ${gradientClass} flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      >
        <ImageWithFallback
          type="program"
          src={buildApiUrl(program.Image)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Program Info */}
      <div className="p-5 flex flex-col flex-1 min-w-0">
        {/* University */}
        {universityText && (
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-1 break-words">
            {universityText}
          </p>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-snug break-words">
          {title}
        </h3>

        {/* Description */}
        {shortDescription && (
          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3 break-words">
            {shortDescription}
          </p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {program.programType && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-medium ${getProgramTypeColor(program.programType)}`}
            >
              {getProgramTypeIcon(program.programType)} {program.programType}
            </span>
          )}
          {specialtyText && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {specialtyText}
            </span>
          )}
          {countryText && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              {countryText}
            </span>
          )}
          {program.isRemote && (
            <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">
              {t("Remote", "Remote") || "Remote"}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="space-y-1.5 mb-3">
          {program.applicationDeadline && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{t("Deadline", "Deadline") || "Deadline"}:</span>
              <span className="font-medium text-gray-700">
                {formatDate(program.applicationDeadline)}
              </span>
            </div>
          )}
        </div>

        {/* Tags chips */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400 px-1 py-0.5">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {isFree ? (
            <span className="text-xl font-bold text-emerald-600">
              {t("free", "Free") || "Free"}
            </span>
          ) : program.discountPrice !== undefined &&
            program.discountPrice !== null ? (
            <>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(program.discountPrice)}
              </span>
              {program.Price > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(program.Price)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(program.Price)}
            </span>
          )}
        </div>

        {/* Action Button */}
        {(() => {
          if (isEnrolled) {
            return (
              <Link
                to={`/Programs/${program.id}/status`}
                onClick={() => {
                  window.scrollTo(0, 0);
                  if (onClick) onClick(program.id);
                }}
                className="w-full text-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-semibold text-sm transition-all duration-200 shadow-sm"
              >
                {t("ViewProgram", "View Program") || "View Program"}
              </Link>
            );
          }

          const pDiscount =
            program.discountPrice !== undefined &&
            program.discountPrice !== null
              ? Number(program.discountPrice)
              : 0;
          const pPrice = Number(program.Price || program.price || 0);
          const effectivePrice = pDiscount > 0 ? pDiscount : pPrice;
          const courseId =
            program.courseId ||
            program.CourseId ||
            program.linkedCourse?.id ||
            program.Course?.id ||
            null;

          if (effectivePrice === 0 && courseId) {
            return (
              <Link
                to={`/Courses/${courseId}`}
                onClick={() => {
                  window.scrollTo(0, 0);
                  if (onClick) onClick(program.id);
                }}
                className="w-full text-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-semibold text-sm transition-all duration-200 shadow-sm"
              >
                {t("Go to Course", "Go to Course") || "Go to Course"}
              </Link>
            );
          }
          return (
            <Link
              to={`/Programs/${program.id}`}
              onClick={() => {
                window.scrollTo(0, 0);
                if (onClick) onClick(program.id);
              }}
              className="w-full text-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-all duration-200"
            >
              {t("View Details", "View Details") || "View Details"}
            </Link>
          );
        })()}
      </div>
    </article>
  );
}

ProgramCard.propTypes = {
  program: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    title_ar: PropTypes.string,
    short_description: PropTypes.string,
    short_description_ar: PropTypes.string,
    university: PropTypes.string,
    university_ar: PropTypes.string,
    programSpecialty: PropTypes.string,
    // Backward-compat (old model fields)
    category: PropTypes.string,
    category_ar: PropTypes.string,
    programCountry: PropTypes.string,
    country: PropTypes.string,
    Price: PropTypes.number,
    discountPrice: PropTypes.number,
    programType: PropTypes.string,
    status: PropTypes.string,
    isFeatured: PropTypes.bool,
    isRemote: PropTypes.bool,
    Image: PropTypes.string,
    applicationDeadline: PropTypes.string,
    tags: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  }).isRequired,
  onClick: PropTypes.func,
  language: PropTypes.string,
  isEnrolled: PropTypes.bool,
};

export default ProgramCard;
