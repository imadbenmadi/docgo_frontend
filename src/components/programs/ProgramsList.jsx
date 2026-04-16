import ImageWithFallback from "../Common/ImageWithFallback";
import {
  ArrowRight,
  BookOpen,
  Clock,
  MapPin,
  Star,
  Tag,
  Users,
} from "lucide-react";
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

// - helpers (mirrors ProgramCard) -

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

// - Single list row -

function ProgramListItem({
  program,
  onProgramClick,
  language = "en",
  isEnrolled = false,
}) {
  const { t } = useTranslation();

  const {
    isFavorited,
    loading: favLoading,
    toggleFavorite,
  } = useFavorite(program?.id, "program");

  if (!program) return null;

  const getProgramCountryText = () => {
    const raw = program?.programCountry || program?.country || "";
    if (!raw) return "";

    const rawStr = String(raw);
    const isIso2 = /^[a-z]{2}$/i.test(rawStr);
    const frName = isIso2 ? getCountryName(rawStr.toUpperCase()) : rawStr;

    return language === "ar" ? getCountryDisplayName(frName, "ar") : frName;
  };

  // Multi-language fields - same logic as ProgramCard
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

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString(
      language === "ar" ? "ar-DZ" : "en-US",
      { year: "numeric", month: "short", day: "numeric" },
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

  const gradientClass =
    gradientMap[program.programType?.toLowerCase()] ||
    "from-blue-500 to-purple-600";

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: program.id,
      title,
      short_description: shortDescription,
      Price: program.Price,
      discountPrice: program.discountPrice,
      university: universityText,
      // Backward-compatible key used by existing favorites UI
      location: countryText,
      country: countryText,
      Image: program.Image,
    });
  };

  // Action button - same smart routing as ProgramCard
  const pDiscount =
    program.discountPrice !== undefined && program.discountPrice !== null
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
  const actionHref = isEnrolled
    ? `/Programs/${program.id}/status`
    : effectivePrice === 0 && courseId
      ? `/Courses/${courseId}`
      : `/Programs/${program.id}`;
  const actionLabel = isEnrolled
    ? t("ViewProgram", "View Program") || "View Program"
    : effectivePrice === 0 && courseId
      ? t("Go to Course", "Go to Course") || "Go to Course"
      : t("View Details", "View Details") || "View Details";
  const actionClass = isEnrolled
    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
    : effectivePrice === 0 && courseId
      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <article
      onClick={() => onProgramClick && onProgramClick(program.id)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group relative"
    >
      {/* Enrollment ribbon */}
      {isEnrolled && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold py-1 text-center tracking-wide">
          {t("Enrolled", "Enrolled") || "Enrolled"}
        </div>
      )}

      <div className={`flex flex-col sm:flex-row ${isEnrolled ? "pt-6" : ""}`}>
        {/* - Image - */}
        <div
          className={`relative sm:w-52 sm:flex-shrink-0 h-44 sm:h-auto bg-gradient-to-br ${gradientClass} overflow-hidden`}
        >
          <ImageWithFallback
            type="program"
            src={buildApiUrl(program.Image)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
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
            {program.isFeatured && (
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Star className="w-2.5 h-2.5 fill-amber-900" />
                {t("Featured", "Featured") || "Featured"}
              </span>
            )}
            {program.status && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(program.status)}`}
              >
                {t(program.status) || program.status}
              </span>
            )}
          </div>
        </div>

        {/* - Content - */}
        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
          {/* Left: main info */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* University */}
            {universityText && (
              <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-1 break-words">
                {universityText}
              </p>
            )}

            <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-snug break-words">
              {title}
            </h3>

            {shortDescription && (
              <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-2 break-words">
                {shortDescription}
              </p>
            )}

            {/* Type + category + location + remote tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {program.programType && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full font-medium ${getProgramTypeColor(program.programType)}`}
                >
                  {getProgramTypeIcon(program.programType)}{" "}
                  {program.programType}
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

            {/* Meta: deadline, spots, scholarship */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
              {program.applicationDeadline && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {t("Deadline", "Deadline") || "Deadline"}:{" "}
                    <span className="font-medium text-gray-700">
                      {formatDate(program.applicationDeadline)}
                    </span>
                  </span>
                </div>
              )}
              {program.maxApplications && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {program.currentApplications || 0}/{program.maxApplications}
                  </span>
                </div>
              )}
            </div>

            {/* Tag chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                {tags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="text-xs text-gray-400 px-1 py-0.5">
                    +{tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: price + button */}
          <div className="sm:w-40 flex flex-col items-start sm:items-end justify-between gap-3 flex-shrink-0">
            {/* Price */}
            <div className="flex flex-col items-start sm:items-end gap-0.5">
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
                    <span className="text-xs text-gray-400 line-through">
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

            {/* Action button */}
            <Link
              to={actionHref}
              onClick={(e) => {
                e.stopPropagation();
                window.scrollTo(0, 0);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-white font-semibold rounded-xl text-sm transition-all duration-200 whitespace-nowrap ${actionClass}`}
            >
              {actionLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

ProgramListItem.propTypes = {
  program: PropTypes.object.isRequired,
  onProgramClick: PropTypes.func,
  language: PropTypes.string,
  isEnrolled: PropTypes.bool,
};

// - Container -

const ProgramsList = ({
  programs,
  onProgramClick,
  language = "en",
  enrolledProgramIds,
}) => {
  const { t } = useTranslation();

  if (!programs || programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 p-12 bg-white rounded-2xl shadow-sm">
        <div className="text-6xl mb-4"></div>
        <p className="text-gray-600 text-xl font-medium mb-2">
          {t("NoProgramsFound", "No Programs Found") || "No programs found"}
        </p>
        <p className="text-gray-500 text-center max-w-md">
          {t("TryAdjustingFilters", "Try Adjusting Filters") ||
            "Try adjusting your search filters or browse different categories"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <ProgramListItem
          key={program.id}
          program={program}
          onProgramClick={onProgramClick}
          language={language}
          isEnrolled={enrolledProgramIds?.has(program.id) || false}
        />
      ))}
    </div>
  );
};

export default ProgramsList;

ProgramsList.propTypes = {
  programs: PropTypes.array.isRequired,
  onProgramClick: PropTypes.func,
  language: PropTypes.string,
  enrolledProgramIds: PropTypes.instanceOf(Set),
};
