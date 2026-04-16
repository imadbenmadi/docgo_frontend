import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { clientCoursesAPI } from "../API/Courses";
import { clientProgramsAPI } from "../API/Programs";
import { useAppContext } from "../AppContext";
import { useFavorites } from "../hooks/useFavorite";
import MainLoading from "../MainLoading";
import ImageWithFallback from "../components/Common/ImageWithFallback";

const FavoritesPage = () => {
  const { t } = useTranslation();
  const { favorites, loading, totalCount } = useFavorites();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState("all");

  const filterFavorites = () => {
    switch (activeTab) {
      case "courses":
        return favorites.courses;
      case "programs":
        return favorites.programs;
      default:
        return [...favorites.courses, ...favorites.programs];
    }
  };

  const filteredFavorites = filterFavorites();

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
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-full max-w-lg">
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
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "courses"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("favorites.courses", "Apprentissage")} (
            {favorites.courses.length})
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "programs"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("favorites.programs", "Études à l’étranger")} (
            {favorites.programs.length})
          </button>
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

              // When using context-processed favorites, items may not include `type`
              const resolvedType =
                item.type ||
                (favorites.programs.some(
                  (p) => (p.id || p.ID || p.Id) === itemId,
                )
                  ? "program"
                  : "course");

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

const FavoriteCard = ({ item, type }) => {
  const { t } = useTranslation();
  const isProgram = type === "program";
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle different ID field names
  const itemId = item?.id || item?.ID || item?.Id;

  // Fetch full program/course data
  useEffect(() => {
    const fetchFullData = async () => {
      if (!itemId) return;

      try {
        setLoading(true);

        let data;
        if (isProgram) {
          const response = await clientProgramsAPI.getProgramDetails(itemId);
          // Program returns {success: true, program: {...}}
          data = response.program || response.data || response;
        } else {
          const response = await clientCoursesAPI.getCourseDetails(itemId);
          // Course returns {success: true, data: {course: {...}, userStatus: {...}, ...}}
          data =
            response.data?.course ||
            response.course ||
            response.data ||
            response;
        }

        setFullData(data);
      } catch (error) {
        // Fallback to original item data if fetch fails
        setFullData(item);
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
  }, [itemId, isProgram, type, item]);

  // Use fullData if available, otherwise fallback to item
  const dataToUse = fullData || item;

  // Handle different field name variations
  const title =
    dataToUse?.Title || dataToUse?.title || dataToUse?.name || dataToUse?.Name;
  const shortDescription =
    dataToUse?.shortDescription ||
    dataToUse?.short_description ||
    dataToUse?.description ||
    dataToUse?.Description;
  const category = dataToUse?.Category || dataToUse?.category;
  const level = dataToUse?.Level || dataToUse?.level;
  const price = dataToUse?.Price ?? dataToUse?.price;
  const discountPrice =
    dataToUse?.discountPrice ??
    dataToUse?.discount_price ??
    dataToUse?.DiscountPrice;
  const currency = dataToUse?.Currency || dataToUse?.currency || "DZD";
  const image =
    dataToUse?.Image ||
    dataToUse?.image ||
    dataToUse?.thumbnail ||
    dataToUse?.Thumbnail;

  // Don't render if no valid item or ID
  if (!item || !itemId) {
    return null;
  }

  // Show loading skeleton while fetching
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-200"></div>
        <div className="p-5 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border
         border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-indigo-100">
        {image ? (
          <ImageWithFallback
            type={isProgram ? "program" : "course"}
            src={import.meta.env.VITE_API_URL + image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageWithFallback
            type={isProgram ? "program" : "course"}
            src={null}
            alt={title}
            className="w-full h-full"
          />
        )}

        {/* Favorite Button */}
        {/* <div className="absolute top-3 right-3">
                    <FavoriteButton
                        item={item}
                        type={type}
                        className="bg-white/95 backdrop-blur-sm p-2 rounded-full hover:bg-white shadow-sm"
                        size="w-5 h-5"
                    />
                </div> */}

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
              isProgram
                ? "bg-purple-500/90 text-white"
                : "bg-blue-500/90 text-white"
            }`}
          >
            {isProgram
              ? t("favorites.programs", "Études à l’étranger")
              : t("favorites.courses", "Apprentissage")}
          </span>
        </div>

        {/* Featured Badge */}
        {item.isFeatured && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 text-xs font-semibold bg-yellow-400/90 text-yellow-900 rounded-full backdrop-blur-sm">
              â Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 leading-tight">
            {title}
          </h3>
          {shortDescription && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {shortDescription}
            </p>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm mb-3">
          {category && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              {category}
            </span>
          )}
          {level && (
            <span className="capitalize text-gray-500 font-medium">
              {level}
            </span>
          )}
        </div>

        {/* Rating */}
        {item.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(item.rating.average)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {/* <span className="ml-2 text-sm text-gray-600">
                            {item.rating.average} ({item.rating.totalReviews})
                        </span> */}
          </div>
        )}

        {/* Price */}
        {price !== undefined && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {discountPrice ? (
                <>
                  <span className="text-xl font-bold text-green-600">
                    {currency} {discountPrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {currency} {price}
                  </span>
                </>
              ) : price === 0 ? (
                <span className="text-xl font-bold text-green-600">
                  {t("favorites.free", "Free")}
                </span>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {currency} {price}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={isProgram ? `/programs/${itemId}` : `/Courses/${itemId}`}
          className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          {isProgram
            ? t("favorites.viewProgram", "View Program")
            : t("favorites.viewCourse", "View Course")}
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
