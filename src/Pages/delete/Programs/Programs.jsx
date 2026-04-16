import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Calendar,
  MapPin,
  Users,
  Building,
  PlayCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  Clock,
} from "lucide-react";
import { clientProgramsAPI } from "../../../API/Programs";
import { useTranslation } from "react-i18next";
import InlineLoading from "../../../InlineLoading";
import { buildApiUrl } from "../../../utils/apiBaseUrl";
import { getApiErrorMessage } from "../../../utils/apiErrorTranslate";

const resolveProgramMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;

  const value = String(mediaPath).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const normalized = value.replace(/^\/?public\/+?/i, "/");
  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;

  return buildApiUrl(withLeadingSlash);
};

const Programs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [universities, setUniversities] = useState([]);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    university: searchParams.get("university") || "",
    status: searchParams.get("status") || "open",
    featured: searchParams.get("featured") || "",
  });

  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get("page")) || 1,
    totalPages: 1,
    totalPrograms: 0,
    limit: 12,
  });

  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt",
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc",
  );

  // Fetch programs data
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters,
      };

      const response = await clientProgramsAPI.getPrograms(params);
      if (response.success) {
        setPrograms(response.data.programs || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination?.totalPages || 1,
          totalPrograms: response.data.pagination?.totalPrograms || 0,
        }));
      } else {
        throw new Error(response.message || "Failed to fetch programs");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t, t("error", "Error")));
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and universities
  const fetchFiltersData = async () => {
    try {
      const response = await clientProgramsAPI.getProgramCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
        setUniversities(response.data.universities || []);
      }
    } catch (err) {}
  };

  // Update URL params when filters change
  const updateURLParams = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    if (pagination.currentPage > 1) params.set("page", pagination.currentPage);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);

    setSearchParams(params);
  };

  // Effects
  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [pagination.currentPage, sortBy, sortOrder, filters]);

  useEffect(() => {
    updateURLParams();
  }, [filters, pagination.currentPage, sortBy, sortOrder]);

  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProgramClick = (programId) => {
    navigate(`/programs/${programId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("programs.notDefined", "Not defined");
    return new Date(dateString).toLocaleDateString(
      i18n.language === "ar" ? "ar-EG" : "fr-FR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      case "coming_soon":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return t("programs.status.open", "Open");
      case "closed":
        return t("programs.status.closed", "Closed");
      case "coming_soon":
        return t("programs.status.comingSoon", "Coming Soon");
      default:
        return status || t("programs.status.unknown", "Unknown Status");
    }
  };

  if (loading && programs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <InlineLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("programs.title", "Educational Programs")}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                "programs.subtitle",
                "Discover our excellence programs for your academic future",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t(
                  "programs.search.placeholder",
                  "Search programs...",
                )}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {t("programs.filters.allCategories", "All Categories")}
              </option>
              {categories.map((cat, index) => (
                <option key={index} value={cat.category}>
                  {i18n.language === "ar" && cat.category_ar
                    ? cat.category_ar
                    : cat.category}
                </option>
              ))}
            </select>

            {/* University Filter */}
            <select
              value={filters.university}
              onChange={(e) => handleFilterChange("university", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {t("programs.filters.allUniversities", "All Universities")}
              </option>
              {universities.map((uni, index) => (
                <option key={index} value={uni.university}>
                  {i18n.language === "ar" && uni.university_ar
                    ? uni.university_ar
                    : uni.university}
                </option>
              ))}
            </select>

            {/* Featured Filter */}
            <select
              value={filters.featured}
              onChange={(e) => handleFilterChange("featured", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {t("programs.filters.allPrograms", "All Programs")}
              </option>
              <option value="true">
                {t("programs.filters.featuredOnly", "Featured Programs Only")}
              </option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                {t("programs.sort.label", "Sort by")}:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="createdAt">
                  {t("programs.sort.newest", "Newest")}
                </option>
                <option value="Title">
                  {t("programs.sort.title", "Title")}
                </option>
                <option value="applicationDeadline">
                  {t("programs.sort.deadline", "Deadline")}
                </option>
                <option value="Rate">
                  {t("programs.sort.rating", "Rating")}
                </option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {pagination.totalPrograms}{" "}
              {t("programs.results.count", "results found")}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchPrograms}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        )}

        {/* Programs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("programs.empty.title", "No programs found")}
            </h3>
            <p className="text-gray-600">
              {t(
                "programs.empty.description",
                "Try adjusting your search criteria or removing some filters.",
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div
                key={program.id}
                onClick={() => handleProgramClick(program.id)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
              >
                {/* Program Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
                  {program.Image ? (
                    <img
                      src={resolveProgramMediaUrl(program.Image)}
                      alt={
                        i18n.language === "ar" && program.Title_ar
                          ? program.Title_ar
                          : program.Title
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award className="w-16 h-16 text-blue-300" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        program.status,
                      )}`}
                    >
                      {getStatusText(program.status)}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {program.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {t("programs.featuredBadge", "Featured")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Video Indicator */}
                  {program.videoUrl && (
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-purple-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {t("programs.video", "Video")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Program Content */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {i18n.language === "ar" && program.Title_ar
                      ? program.Title_ar
                      : program.Title}
                  </h3>

                  {(program.shortDescription ||
                    program.shortDescription_ar) && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {i18n.language === "ar" && program.shortDescription_ar
                        ? program.shortDescription_ar
                        : program.shortDescription}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {program.Category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {i18n.language === "ar" && program.Category_ar
                          ? program.Category_ar
                          : program.Category}
                      </span>
                    )}
                    {program.university && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {i18n.language === "ar" && program.university_ar
                          ? program.university_ar
                          : program.university}
                      </span>
                    )}
                  </div>

                  {/* Program Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {program.applicationDeadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {t("programs.deadline", "Deadline")}:{" "}
                          {formatDate(program.applicationDeadline)}
                        </span>
                      </div>
                    )}

                    {program.Users_count > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {program.Users_count}{" "}
                          {t("programs.applicants", "applicants")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="mt-4 pt-4 border-t">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <span>{t("programs.viewDetails", "View Details")}</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === pagination.currentPage;

                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.currentPage - 1 &&
                    page <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg border ${
                        isCurrentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === pagination.currentPage - 2 ||
                  page === pagination.currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;
