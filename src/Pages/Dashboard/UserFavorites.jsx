import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import ImageWithFallback from "../../components/Common/ImageWithFallback";
import {
  HeartIcon,
  AcademicCapIcon,
  BookOpenIcon,
  EyeIcon,
  TrashIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useAppContext } from "../../AppContext";
import apiClient from "../../services/apiClient";

const UserFavorites = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const [favorites, setFavorites] = useState({ courses: [], programs: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    if (user?.id) {
      fetchFavorites();
    }
  }, [user?.id]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/Users/${user.id}/Profile`);

      if (response.data.success && response.data.data.favorites) {
        setFavorites(response.data.data.favorites);
      }
    } catch (error) {
      setFavorites({ courses: [], programs: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId, type) => {
    const result = await Swal.fire({
      title: "Remove from Favorites?",
      text: t(
        "favorites.confirmRemove",
        "Are you sure you want to remove this from favorites?",
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        // API call to remove favorite
        const endpoint =
          type === "course"
            ? `/Courses/${itemId}/favorite`
            : `/Programs/${itemId}/favorite`;
        await apiClient.delete(endpoint);

        // Update local state
        setFavorites((prev) => ({
          ...prev,
          [type === "course" ? "courses" : "programs"]: prev[
            type === "course" ? "courses" : "programs"
          ].filter((item) => item.id !== itemId),
        }));
      } catch (error) {}
    }
  };

  const tabs = [
    {
      id: "courses",
      name: t("favorites.courses", "Apprentissage"),
      icon: BookOpenIcon,
      count: favorites.courses.length,
    },
    {
      id: "programs",
      name: t("favorites.programs", "Études à l’étranger"),
      icon: AcademicCapIcon,
      count: favorites.programs.length,
    },
  ];

  const FavoriteItem = ({ item, type }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <ImageWithFallback
              type={type === "program" ? "program" : "course"}
              src={
                item.Image
                  ? `${import.meta.env.VITE_API_URL}${item.Image}`
                  : null
              }
              alt={item.Title || item.Name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.Title || item.Name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.Description}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  {item.Rating || "N/A"}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {item.Duration || "N/A"}
                </div>
                {type === "course" && (
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {item.EnrollmentCount || 0}{" "}
                    {t("favorites.students", "students")}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {item.Category}
                </span>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {item.Level}
                </span>
                {item.Price && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {item.Price === 0
                      ? t("favorites.free", "Free")
                      : `$${item.Price}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {t("favorites.addedOn", "Added on")}{" "}
            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={
                type === "course"
                  ? `/courses/${item.id}`
                  : `/programs/${item.id}`
              }
              className="inline-flex items-center px-3 py-1 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-sm"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              {t("favorites.view", "View")}
            </Link>
            <button
              onClick={() => handleRemoveFavorite(item.id, type)}
              className="inline-flex items-center px-3 py-1 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              {t("favorites.remove", "Remove")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto p-6 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <HeartIcon className="h-7 w-7 text-red-600 mr-3" />
              {t("favorites.title", "My Favorites")}
            </h1>
            <p className="mt-1 text-gray-600">
              {t("favorites.subtitle", "Your bookmarked courses and programs")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5 ${
                      activeTab === tab.id
                        ? "text-red-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              {t("favorites.loading", "Loading favorites...")}
            </p>
          </div>
        ) : (
          <>
            {activeTab === "courses" && (
              <div>
                {favorites.courses.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("favorites.noCourses", "No favorite courses")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t(
                        "favorites.noCoursesText",
                        "You haven't added any courses to your favorites yet.",
                      )}
                    </p>
                    <Link
                      to="/courses"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t("favorites.browseCourses", "Browse Courses")}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {favorites.courses.map((course) => (
                      <FavoriteItem
                        key={course.id}
                        item={course}
                        type="course"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "programs" && (
              <div>
                {favorites.programs.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("favorites.noPrograms", "No favorite programs")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t(
                        "favorites.noProgramsText",
                        "You haven't added any programs to your favorites yet.",
                      )}
                    </p>
                    <Link
                      to="/programs"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t("favorites.browsePrograms", "Browse Programs")}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {favorites.programs.map((program) => (
                      <FavoriteItem
                        key={program.id}
                        item={program}
                        type="program"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserFavorites;
