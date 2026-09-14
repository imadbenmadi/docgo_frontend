import PropTypes from "prop-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAppContext } from "../AppContext";
import { useFavorites } from "../hooks/useFavorite";
import MainLoading from "../MainLoading";
import ImageWithFallback from "../components/Common/ImageWithFallback";
import Price from "../components/Common/Price";
import { buildApiUrl } from "../utils/apiBaseUrl";

const FavoritesPage = () => {
  const { t } = useTranslation();
  const { favorites, loading, totalCount } = useFavorites();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState("all");

  // The four, and what to call each on the tab. Driving the tabs from a list
  // rather than writing one button per product is what stopped CV services
  // and internships being left out again.
  const TABS = [
    ["course", t("favorites.courses", "Apprentissage")],
    ["program", t("favorites.programs", "Études à l'étranger")],
    ["cv", t("favorites.cv", "Services CV")],
    ["internship", t("favorites.internships", "Stages")],
  ];

  const filteredFavorites =
    activeTab === "all"
      ? TABS.flatMap(([type]) => favorites[type] || [])
      : favorites[activeTab] || [];

  if (loading) {
    return <MainLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t("favorites.title", "My Favorites")}
          </h1>
          <p className="text-gray-600 text-lg">
            {user
              ? t("favorites.savedCourses", "Your saved courses and programs")
              : t(
                  "favorites.savedCoursesLocal",
                  "Your locally saved courses and programs",
                )}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("favorites.all", "All")} ({totalCount})
          </button>
          {TABS.map(([type, label]) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === type
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label} ({favorites[type]?.length || 0})
            </button>
          ))}
        </div>

        {/* Content */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-full h-full"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {t("favorites.noFavorites", "No favorites yet")}
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {t(
                "favorites.startExploring",
                "Start exploring courses and programs to add them to your favorites!",
              )}
            </p>
            <Link
              to="/Courses"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t("favorites.browseCourses", "Browse Courses")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((item) => {
              // Handle different ID field names
              const itemId = item.id || item.ID || item.Id;

              // Every favourite now carries its own type, so there is no
              // longer anything to guess at.
              const resolvedType = item.type || "course";

              return (
                <FavoriteCard
                  key={`${resolvedType}-${itemId}`}
                  item={item}
                  type={resolvedType}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * One saved item.
 *
 * It used to re-fetch each course or programme in full just to draw a card,
 * which is one request per tile and only ever knew those two products. The
 * list endpoint now returns the same handful of fields for all four, so the
 * card draws what it was handed and a CV service looks like everything else.
 */
const FavoriteCard = ({ item, type }) => {
  const { t } = useTranslation();

  const itemId = item?.id ?? item?.ID ?? item?.Id;
  if (!item || !itemId) return null;

  const LABEL = {
    course: t("favorites.badgeCourse", "Cours"),
    program: t("favorites.badgeProgram", "Programme"),
    cv: t("favorites.badgeCv", "Service CV"),
    internship: t("favorites.badgeInternship", "Stage"),
  };

  const BADGE = {
    course: "bg-blue-100 text-blue-800",
    program: "bg-purple-100 text-purple-800",
    cv: "bg-cyan-100 text-cyan-800",
    internship: "bg-emerald-100 text-emerald-800",
  };

  const PATH = {
    course: `/Courses/${itemId}`,
    program: `/programs/${itemId}`,
    cv: `/other-services/cv/${itemId}`,
    internship: `/other-services/internships/${itemId}`,
  };

  const title = item.title || item.Title || item.name;
  const description = String(item.description || "").replace(/<[^>]*>/g, "");
  const image = item.image || item.Image;
  const href = item.path || PATH[type] || PATH.course;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-indigo-100">
        <ImageWithFallback
          type={type === "program" ? "program" : "course"}
          src={image ? buildApiUrl(image) : null}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
              BADGE[type] || BADGE.course
            }`}
          >
            {LABEL[type] || LABEL.course}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
          {title}
        </h3>
        {description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>
        )}

        {(item.category || item.level) && (
          <div className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500">
            {item.category && (
              <span className="rounded-full bg-gray-100 px-2 py-1">
                {item.category}
              </span>
            )}
            {item.level && (
              <span className="rounded-full bg-gray-100 px-2 py-1">
                {item.level}
              </span>
            )}
          </div>
        )}

        {/* Free reads "Gratuit", not "DZD 0.00" - which is what a free course
            said here, and is not a price anyone should have to parse. */}
        <div className="mb-4">
          <Price
            amount={item.price}
            currency={item.currency}
            amountClassName="text-xl font-bold text-gray-900"
          />
        </div>

        <Link
          to={href}
          className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center font-medium text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-md"
        >
          {t("favorites.view", "Voir")}
        </Link>
      </div>
    </div>
  );
};


FavoriteCard.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.oneOf(["course", "program"]).isRequired,
};

export default FavoritesPage;
