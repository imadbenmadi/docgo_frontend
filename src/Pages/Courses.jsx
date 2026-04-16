import {
  Award,
  BookOpen,
  Filter,
  Grid,
  List,
  PlayCircle,
  Search,
  Star,
} from "lucide-react";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCourses } from "../API/Courses";
import { EnrollmentAPI } from "../API/Enrollment";
import { useAppContext } from "../AppContext";
import { CourseGrid } from "../components/courses/CourseGrid";
import { CourseList } from "../components/courses/CourseList";
import FilterSidebar from "../components/courses/FilterSidebar";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import ImageWithFallback from "../components/Common/ImageWithFallback";
import { buildApiUrl } from "../utils/apiBaseUrl";
import { getApiErrorMessage } from "../utils/apiErrorTranslate";

// Stats Overview Component
function StatsOverview({ totalCourses, featuredCourses, totalCategories }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8 justify-center max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">
              {t("Total Courses", "Total Courses") || "Total Courses"}
            </p>
            <p className="text-3xl font-bold">{totalCourses || 0}</p>
          </div>
          <BookOpen className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm font-medium">
              {t("Featured", "Featured") || "Featured"}
            </p>
            <p className="text-3xl font-bold">{featuredCourses || 0}</p>
          </div>
          <Star className="w-12 h-12 text-yellow-200" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">
              {t("Categories", "Categories") || "Categories"}
            </p>
            <p className="text-3xl font-bold">{totalCategories || 0}</p>
          </div>
          <Award className="w-12 h-12 text-purple-200" />
        </div>
      </div>
    </div>
  );
}

StatsOverview.propTypes = {
  totalCourses: PropTypes.number,
  featuredCourses: PropTypes.number,
  totalCategories: PropTypes.number,
};

export default function Courses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuth } = useAppContext();

  // Enrolled courses state
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);

  // State management
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchLoading, setSearchLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    categories: 0,
  });

  // Search input (applied only when user clicks Search / presses Enter)
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  // Filter and search state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    specialty: searchParams.get("specialty") || "",
    status: searchParams.get("status") || "published",
    featured: searchParams.get("featured") || "",
    difficulty: searchParams.get("difficulty") || "",
    certificate: searchParams.get("certificate") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    language: searchParams.get("language") || "",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get("page")) || 1,
    totalPages: 1,
    totalCourses: 0,
    limit: 12,
  });

  // Sorting state
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt",
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc",
  );

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Fetch all courses with filters and search
  const fetchCourses = useCallback(
    async (page = 1, forceRefresh = false, isFilterChange = false) => {
      try {
        if (isFilterChange) {
          setSearchLoading(true);
        } else if (!forceRefresh) {
          setLoading(true);
        }

        const params = {
          page,
          limit: pagination.limit,
          ...filters,
          sortBy,
          sortOrder,
        };

        // Clean up undefined/empty values
        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === undefined) {
            delete params[key];
          }
        });

        const response = await getCourses(params);

        if (response.success) {
          const coursesData = response.data.courses || [];
          setCourses(coursesData);

          // Extract filter data and stats from courses
          extractFiltersData(coursesData);

          setPagination((prev) => ({
            ...prev,
            currentPage: response.data.pagination?.currentPage || page,
            totalPages: response.data.pagination?.totalPages || 1,
            totalCourses: response.data.pagination?.totalCourses || 0,
          }));

          // Update stats - count featured courses from current data
          const featuredCount = coursesData.filter(
            (course) => course.isFeatured,
          ).length;
          setStats((prevStats) => ({
            ...prevStats,
            total: response.data.pagination?.totalCourses || 0,
            featured: featuredCount,
          }));

          setError(null);
        } else {
          throw new Error(
            response.message ||
              t("Failed to fetch courses", "Failed to fetch courses"),
          );
        }
      } catch (err) {
        setError(
          getApiErrorMessage(
            err,
            t,
            t(
              "An error occurred while fetching courses",
              "An error occurred while fetching courses",
            ),
          ),
        );
        setCourses([]);
        setPagination((prev) => ({
          ...prev,
          totalCourses: 0,
          totalPages: 1,
        }));
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [filters, pagination.limit, sortBy, sortOrder, t],
  );

  // Extract categories and specialties from courses data
  const extractFiltersData = (coursesData) => {
    if (!coursesData || !Array.isArray(coursesData)) return;

    // Extract unique categories
    const uniqueCategories = [
      ...new Set(
        coursesData
          .map((course) => course.Category)
          .filter((category) => category && category.trim()),
      ),
    ];

    // Extract unique specialties
    const uniqueSpecialties = [
      ...new Set(
        coursesData
          .map((course) => course.Specialty)
          .filter((specialty) => specialty && specialty.trim()),
      ),
    ];

    setCategories(uniqueCategories);
    setSpecialties(uniqueSpecialties);

    // Update stats with categories count
    setStats((prevStats) => ({
      ...prevStats,
      categories: uniqueCategories.length,
    }));
  };

  // Update URL params when filters change
  const updateURLParams = useCallback(
    (isPagination = false) => {
      const params = new URLSearchParams();

      // Add search and filter params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "") {
          params.set(key, value);
        }
      });

      // Add pagination
      if (pagination.currentPage > 1 && !isPagination) {
        params.set("page", pagination.currentPage);
      }

      // Add sorting
      if (sortBy !== "createdAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);

      // Update URL without causing scroll restoration
      setSearchParams(params, { replace: true });
    },
    [filters, pagination.currentPage, sortBy, sortOrder, setSearchParams],
  );

  // Effects
  // Fetch enrolled courses for authenticated users
  useEffect(() => {
    if (!isAuth) return;
    const fetchEnrolled = async () => {
      setEnrolledLoading(true);
      try {
        const result = await EnrollmentAPI.getCourseEnrollments();
        if (result.success) {
          const enrollments = Array.isArray(result.data) ? result.data : [];
          const mapped = enrollments
            .filter(
              (e) =>
                e.Course &&
                !e.Course.isDeleted &&
                (e.status === "active" || e.status === "completed"),
            )
            .map((e) => ({
              ...(e.Course || {}),
              progress: parseFloat(e.progressPercentage) || 0,
              enrollmentStatus: e.status,
              isEnrolled: true,
            }))
            .filter((c) => c.id);
          setEnrolledCourses(mapped);
        }
      } catch (e) {
      } finally {
        setEnrolledLoading(false);
      }
    };
    fetchEnrolled();
  }, [isAuth]);

  // Fetch courses whenever APPLIED filters/pagination/sort changes.
  // FilterSidebar edits are local until user clicks Search/Apply.
  useEffect(() => {
    fetchCourses(pagination.currentPage, false, true);
  }, [
    filters.search,
    filters.category,
    filters.specialty,
    filters.status,
    filters.featured,
    filters.difficulty,
    filters.certificate,
    filters.minPrice,
    filters.maxPrice,
    filters.language,
    pagination.currentPage,
    sortBy,
    sortOrder,
    fetchCourses,
  ]);

  const applySearch = useCallback(() => {
    const nextSearch = (searchQuery || "").trim();
    setFilters((prev) => ({
      ...prev,
      search: nextSearch,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [searchQuery]);

  useEffect(() => {
    updateURLParams();
  }, [updateURLParams]);

  // Apply multiple filters at once (used by FilterSidebar Apply/Search button)
  const handleApplyAllFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setSearchQuery(newFilters?.search || "");
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      setShowFilters(false);

      const params = new URLSearchParams();
      Object.entries(newFilters || {}).forEach(([k, v]) => {
        if (v && v !== "") params.set(k, v);
      });
      if (sortBy !== "createdAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams, sortBy, sortOrder],
  );

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const resetFilters = () => {
    const resetFilters = {
      search: "",
      category: "",
      specialty: "",
      status: "published",
      featured: "",
      difficulty: "",
      certificate: "",
      minPrice: "",
      maxPrice: "",
      language: "",
    };

    setFilters(resetFilters);
    setSearchQuery("");
    setSearchLoading(false);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const handleRetry = () => {
    setError(null);
    fetchCourses(pagination.currentPage, true, false);
  };

  const sortOptions = [
    {
      value: "createdAt_desc",
      label: t("Newest First", "Newest First") || "Newest First",
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    {
      value: "createdAt_asc",
      label: t("Oldest First", "Oldest First") || "Oldest First",
      sortBy: "createdAt",
      sortOrder: "asc",
    },
    {
      value: "Title_asc",
      label: t("Title A-Z", "Title A-Z") || "Title A-Z",
      sortBy: "Title",
      sortOrder: "asc",
    },
    {
      value: "Title_desc",
      label: t("Title Z-A", "Title Z-A") || "Title Z-A",
      sortBy: "Title",
      sortOrder: "desc",
    },
    {
      value: "Price_desc",
      label: t("Highest Price", "Highest Price") || "Highest Price",
      sortBy: "Price",
      sortOrder: "desc",
    },
    {
      value: "Price_asc",
      label: t("Lowest Price", "Lowest Price") || "Lowest Price",
      sortBy: "Price",
      sortOrder: "asc",
    },
  ];

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4"></div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              {t("Error Loading Courses", "Error Loading Courses") ||
                "Error Loading Courses"}
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              {t("Try Again", "Try Again") || "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("TousLesCours", "All Courses") || "All Courses"}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                "ExploreCoursesDescription",
                "Explore our online courses designed to enhance your skills and knowledge.",
              ) ||
                "Explore our comprehensive collection of courses to enhance your skills and knowledge"}
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview
            totalCourses={stats.total}
            featuredCourses={stats.featured}
            totalCategories={stats.categories}
          />

          {/* Search Bar */}
          <div className="max-w-2xl mt-3 mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder={
                t("Search courses...", "Search courses...") ||
                "Search courses..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applySearch();
                }
              }}
              className="w-full pl-12 pr-24 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />

            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                type="button"
                onClick={applySearch}
                disabled={searchLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
              >
                {searchLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{t("Search", "Search") || "Search"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* - Enrolled Courses Section - */}
      {isAuth && (enrolledLoading || enrolledCourses.length > 0) && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-teal-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {t("Continue Learning", "Continue Learning") ||
                    "Continue Learning"}
                </h2>
                <p className="text-teal-100 text-sm">
                  {enrolledCourses.length}{" "}
                  {t("enrolled course", "enrolled course") || "enrolled course"}
                  {enrolledCourses.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {enrolledLoading ? (
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-72 bg-white/20 rounded-2xl h-32 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-transparent">
                {enrolledCourses.map((course) => {
                  const uploadType = String(
                    course?.uploadType || "",
                  ).toLowerCase();
                  const accessPath =
                    uploadType === "zip"
                      ? `/Courses/${course.id}/explore`
                      : `/Courses/${course.id}/watch`;

                  return (
                    <Link
                      key={course.id}
                      to={accessPath}
                      onClick={() => window.scrollTo(0, 0)}
                      className="flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Thumbnail */}
                      <div className="h-28 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                        <ImageWithFallback
                          type="course"
                          src={buildApiUrl(course.Image)}
                          alt={course.Title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <PlayCircle className="w-10 h-10 text-white opacity-0 group-hover:opacity-90 transition-all duration-300" />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-2">
                          {course.Title}
                        </h4>
                        {/* Progress bar */}
                        {uploadType !== "zip" && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>
                                {t("Progress", "Progress") || "Progress"}
                              </span>
                              <span className="font-semibold text-emerald-600">
                                {Math.round(course.progress || 0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${course.progress || 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <FilterSidebar
              filters={filters}
              onApplyFilters={handleApplyAllFilters}
              categories={categories || []}
              specialties={specialties || []}
              onReset={resetFilters}
            />
          </div>

          {/* Courses Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Results Info */}
                <div className="flex items-center gap-4">
                  <p className="text-gray-600">
                    {filters.search ||
                    filters.category ||
                    filters.specialty ||
                    filters.difficulty ||
                    filters.featured ||
                    filters.certificate ? (
                      <>
                        {courses.length} {t("course", "course") || "course"}
                        {courses.length !== 1 ? "s" : ""}{" "}
                        {t("found", "found") || "found"}
                        {filters.search && (
                          <span className="ml-1">
                            {t("for", "for") || "for"}{" "}
                            <span className="font-medium text-gray-800">
                              &ldquo;
                              {filters.search}
                              &rdquo;
                            </span>
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {t("Showing", "Showing") || "Showing"} {courses.length}{" "}
                        {t("of", "of") || "of"} {pagination?.totalCourses || 0}{" "}
                        {t("courses", "Apprentissage") || "apprentissage"}
                      </>
                    )}
                  </p>
                </div>

                {/* View and Sort Controls */}
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden px-4 py-2 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-gray-50"
                  >
                    <Filter className="w-5 h-5" />
                    {t("Filters", "Filters") || "Filters"}
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-200 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Display */}
            {viewMode === "grid" ? (
              <CourseGrid
                courses={courses}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onCourseClick={handleCourseClick}
              />
            ) : (
              <CourseList
                courses={courses}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onCourseClick={handleCourseClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
