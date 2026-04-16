import {
  ChevronDown,
  Filter,
  Grid,
  GraduationCap,
  List,
  Search,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { clientProgramsAPI } from "../API/Programs";
import { useAppContext } from "../AppContext";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import FilterSidebar from "../components/programs/FilterSidebar";
import Pagination from "../components/programs/Pagination";
import ProgramCard from "../components/programs/ProgramCard";
import ProgramsList from "../components/programs/ProgramsList";
import StatsOverview from "../components/programs/StatsOverview";
import apiClient from "../services/apiClient";
import ImageWithFallback from "../components/Common/ImageWithFallback";
import { buildApiUrl } from "../utils/apiBaseUrl";

export function Programs() {
  const { t, i18n } = useTranslation("", { keyPrefix: "programs" });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuth } = useAppContext();

  // State management
  const [programs, setPrograms] = useState([]);
  const [exactPrograms, setExactPrograms] = useState([]);
  const [otherPrograms, setOtherPrograms] = useState([]);
  const [enrolledProgramIds, setEnrolledProgramIds] = useState(new Set());
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [enrolledProgramsLoading, setEnrolledProgramsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchLoading, setSearchLoading] = useState(false);
  const [showingFeatured, setShowingFeatured] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    featured: 0,
    universities: 0,
  });
  // Search input (applied only when user clicks Search / presses Enter)
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  // Filter and search state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    featured: searchParams.get("featured") || "",
    programType: searchParams.get("programType") || "",
    priceRange: searchParams.get("priceRange") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    tags: searchParams.get("tags") || "",
    country: searchParams.get("country") || "",
    specialty: searchParams.get("specialty") || "",
    type: searchParams.get("type") || "",
    university: searchParams.get("university") || "",
  });

  // Sync filters from URL parameters whenever they change
  useEffect(() => {
    const newFilters = {
      search: searchParams.get("search") || "",
      featured: searchParams.get("featured") || "",
      programType: searchParams.get("programType") || "",
      priceRange: searchParams.get("priceRange") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      tags: searchParams.get("tags") || "",
      country: searchParams.get("country") || "",
      specialty: searchParams.get("specialty") || "",
      type: searchParams.get("type") || "",
      university: searchParams.get("university") || "",
    };

    setFilters(newFilters);

    // Also sync search query
    const urlSearch = searchParams.get("search") || "";
    setSearchQuery(urlSearch);

    // Sync pagination
    const page = parseInt(searchParams.get("page")) || 1;
    setPagination((prev) => ({ ...prev, currentPage: page }));

    // Sync sorting
    const urlSortBy = searchParams.get("sortBy") || "createdAt";
    const urlSortOrder = searchParams.get("sortOrder") || "desc";
    setSortBy(urlSortBy);
    setSortOrder(urlSortOrder);
  }, [searchParams]);
  // Use ref to avoid dependency issues
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get("page")) || 1,
    totalPages: 1,
    totalPrograms: 0,
    limit: 12,
  });

  // Sorting state
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt",
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc",
  );

  // Extract filter options from program data
  const extractFiltersFromPrograms = useCallback((programsData) => {
    if (!Array.isArray(programsData) || programsData.length === 0) return;

    // Update stats based on program data
    const uniqueUniversities = [
      ...new Set(
        programsData.map((p) => p.university || p.University).filter(Boolean),
      ),
    ];

    setStats((prev) => ({
      ...prev,
      universities: uniqueUniversities.length,
    }));
  }, []);
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  // Fetch all programs with filters and search
  const fetchPrograms = useCallback(
    async (page = 1, forceRefresh = false, isFilterChange = false) => {
      try {
        // Only show main loading on initial load, not on filter changes to preserve scroll
        if (!isFilterChange && (page === 1 || forceRefresh)) {
          setLoading(true);
        }

        // Show search loading for pagination or subtle loading for filter changes
        if (page > 1 && !forceRefresh) {
          setSearchLoading(true);
        } else if (isFilterChange) {
          // For filter changes, don't set any loading state to preserve scroll
          setSearchLoading(false);
          setLoading(false);
        }

        const hasSearch = filters.search?.trim();
        const hasFilters =
          filters.programType ||
          filters.featured ||
          filters.priceRange ||
          filters.minPrice ||
          filters.maxPrice ||
          filters.tags ||
          filters.country ||
          filters.specialty ||
          filters.type ||
          filters.university;

        const hasExactLocationFilters =
          !!filters.country || !!filters.specialty || !!filters.type;

        const effectiveProgramType = filters.type || filters.programType || "";

        const normalizeTagsInput = (value) => {
          if (!value) return [];
          return String(value)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        };

        const applyClientFilters = (list) => {
          if (!Array.isArray(list)) return [];
          const requiredTags = normalizeTagsInput(filters.tags);
          const minPrice =
            filters.minPrice !== "" && filters.minPrice !== null
              ? Number(filters.minPrice)
              : null;
          const maxPrice =
            filters.maxPrice !== "" && filters.maxPrice !== null
              ? Number(filters.maxPrice)
              : null;
          const priceType = String(filters.priceRange || "").toLowerCase();

          return list.filter((p) => {
            if (requiredTags.length > 0) {
              const programTags = Array.isArray(p.tags)
                ? p.tags
                : typeof p.tags === "string"
                  ? p.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  : [];
              const programTagSet = new Set(
                programTags.map((t) => String(t).toLowerCase()),
              );
              const hasAllTags = requiredTags.every((tag) =>
                programTagSet.has(String(tag).toLowerCase()),
              );
              if (!hasAllTags) return false;
            }

            // Price type filter (free/paid)
            if (priceType === "free" || priceType === "paid") {
              const rawPrice =
                p.Price !== undefined
                  ? Number(p.Price)
                  : p.price !== undefined
                    ? Number(p.price)
                    : null;
              const priceValue =
                rawPrice === null || Number.isNaN(rawPrice) ? 0 : rawPrice;
              if (priceType === "free" && priceValue !== 0) return false;
              if (priceType === "paid" && priceValue <= 0) return false;
            }

            if (minPrice !== null && !Number.isNaN(minPrice)) {
              const price =
                p.Price !== undefined
                  ? Number(p.Price)
                  : p.price !== undefined
                    ? Number(p.price)
                    : null;
              if (price !== null && !Number.isNaN(price) && price < minPrice)
                return false;
            }

            if (maxPrice !== null && !Number.isNaN(maxPrice)) {
              const price =
                p.Price !== undefined
                  ? Number(p.Price)
                  : p.price !== undefined
                    ? Number(p.price)
                    : null;
              if (price !== null && !Number.isNaN(price) && price > maxPrice)
                return false;
            }

            return true;
          });
        };

        const buildBaseParams = ({
          page,
          limit,
          includeLocationFilters,
          includeProgramType,
        }) => {
          const params = {
            search: filters.search?.trim() || "",
            featured: filters.featured || "",
            university: filters.university || "",
            priceRange: filters.priceRange || "",
            minPrice: filters.minPrice || "",
            maxPrice: filters.maxPrice || "",
            ...(includeProgramType
              ? { programType: effectiveProgramType || "" }
              : {}),
            sortBy,
            sortOrder,
            page,
            limit,
            includeUnpublished: "true",
            status: "all",
          };

          if (includeLocationFilters) {
            if (filters.country) params.programCountry = filters.country;
            if (filters.specialty) params.programSpecialty = filters.specialty;
          }

          // Remove empty parameters
          Object.keys(params).forEach((key) => {
            if (params[key] === "" || params[key] === undefined) {
              delete params[key];
            }
          });

          return params;
        };

        let response;

        if (hasExactLocationFilters) {
          const limitAll = 1000;
          const [exactResponse, broadResponse] = await Promise.all([
            clientProgramsAPI.getPrograms(
              buildBaseParams({
                page: 1,
                limit: limitAll,
                includeLocationFilters: true,
                includeProgramType: true,
              }),
            ),
            clientProgramsAPI.getPrograms(
              buildBaseParams({
                page: 1,
                limit: limitAll,
                includeLocationFilters: false,
                includeProgramType: false,
              }),
            ),
          ]);

          const exactProgramsData =
            exactResponse?.programs ||
            exactResponse?.data?.programs ||
            exactResponse?.data?.data?.programs ||
            [];
          const broadProgramsData =
            broadResponse?.programs ||
            broadResponse?.data?.programs ||
            broadResponse?.data?.data?.programs ||
            [];

          const exactFiltered = applyClientFilters(exactProgramsData);
          const broadFiltered = applyClientFilters(broadProgramsData);

          const exactIds = new Set(exactFiltered.map((p) => p.id));
          const others = broadFiltered.filter((p) => !exactIds.has(p.id));

          setExactPrograms(exactFiltered);
          setOtherPrograms(others);
          setPrograms([]);
          setShowingFeatured(false);

          setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            totalPages: 1,
            totalPrograms: exactFiltered.length + others.length,
          }));

          // Use broad response stats if available
          if (broadResponse?.stats) {
            setStats((prevStats) => ({
              total: broadResponse.stats.total || 0,
              published: broadResponse.stats.published || 0,
              featured: broadResponse.stats.featured || 0,
              universities:
                broadResponse.stats.universities || prevStats.universities || 0,
            }));
          }

          setError(null);
          return;
        }

        // Default (non split-mode): use the main Programs endpoint (search endpoint is inconsistent)
        response = await clientProgramsAPI.getPrograms(
          buildBaseParams({
            page,
            limit: pagination.limit,
            includeLocationFilters: true,
            includeProgramType: true,
          }),
        );

        // Parse programs from response
        const programsData =
          response?.data?.programs ||
          response?.data?.data?.programs ||
          response?.programs ||
          (Array.isArray(response?.data) ? response.data : []) ||
          (Array.isArray(response) ? response : []);

        const filteredPrograms = applyClientFilters(programsData);

        // If first page and no search/filters, get featured programs too
        if (page === 1 && !hasSearch && !hasFilters) {
          try {
            const featuredResponse =
              await clientProgramsAPI.getFeaturedPrograms(6);

            const featuredPrograms =
              featuredResponse?.data?.programs ||
              featuredResponse?.programs ||
              [];

            // Combine featured first, then non-featured (avoid duplicates)
            const featuredIds = new Set(featuredPrograms.map((p) => p.id));
            const nonFeaturedPrograms = filteredPrograms.filter(
              (p) => !featuredIds.has(p.id),
            );
            const combinedPrograms = [
              ...featuredPrograms,
              ...nonFeaturedPrograms,
            ];

            setPrograms(combinedPrograms);
            setExactPrograms([]);
            setOtherPrograms([]);
            setShowingFeatured(true);
            extractFiltersFromPrograms(combinedPrograms);
          } catch {
            // Fallback to regular programs if featured fetch fails
            setPrograms(filteredPrograms);
            setExactPrograms([]);
            setOtherPrograms([]);
            setShowingFeatured(false);
            extractFiltersFromPrograms(filteredPrograms);
          }
        } else {
          // When filters are active, only update displayed programs
          setPrograms(filteredPrograms);
          setExactPrograms([]);
          setOtherPrograms([]);
          setShowingFeatured(false);
        }

        setPagination((prev) => ({
          ...prev,
          totalPages: response.totalPages || 1,
          totalPrograms: response.totalPrograms || programsData.length,
          currentPage: page,
        }));

        // Update stats if provided in response
        if (response.stats) {
          setStats((prevStats) => ({
            total: response.stats.total || 0,
            published: response.stats.published || 0,
            featured: response.stats.featured || 0,
            universities:
              response.stats.universities || prevStats.universities || 0,
          }));
        }

        setError(null);
      } catch {
        setError("Failed to load programs. Please try again.");
        toast.error(t("Failed to load programs", "Failed to load programs"));
        setPrograms([]);
        setExactPrograms([]);
        setOtherPrograms([]);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [
      filters,
      pagination.limit,
      sortBy,
      sortOrder,
      t,
      extractFiltersFromPrograms,
    ],
  );

  // Fetch categories and universities (no longer needed but kept for reference)
  // const fetchFiltersData = async () => {
  //   // This is now handled by the backend, no need to fetch separately
  // };

  // Update URL params when filters change
  const updateURLParams = useCallback(
    (isPagination = false) => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      if (pagination.currentPage > 1)
        params.set("page", pagination.currentPage);
      if (sortBy !== "createdAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);

      // Use replace: true for filter changes to prevent scroll restoration
      // Use normal navigation for pagination (user expects to scroll to top)
      setSearchParams(params, { replace: !isPagination });
    },
    [filters, pagination.currentPage, sortBy, sortOrder, setSearchParams],
  );

  // Fetch user's enrolled programs on mount
  useEffect(() => {
    const fetchEnrolledPrograms = async () => {
      if (!isAuth) return;
      setEnrolledProgramsLoading(true);
      try {
        const response = await apiClient.get("/Users/programs/my-applications");
        const apps = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data?.applications || [];
        const validApps = apps.filter(
          (app) =>
            app.status !== "rejected" && app.Program && !app.Program.isDeleted,
        );
        const enrolledIds = new Set(
          validApps
            .map((app) => app.ProgramId || app.Program?.id)
            .filter(Boolean),
        );
        setEnrolledProgramIds(enrolledIds);
        // Also store full program objects for the enrolled section
        const programs = validApps
          .map((app) => app.Program || null)
          .filter((p) => p && p.id);
        setEnrolledPrograms(programs);
      } catch {
        // ignore (non-blocking)
      } finally {
        setEnrolledProgramsLoading(false);
      }
    };

    fetchEnrolledPrograms();
  }, [isAuth]);

  // Effects - Filter data fetch no longer needed (handled by backend)
  // useEffect(() => {
  //   fetchFiltersData();
  // }, []);

  // Fetch programs whenever filters or pagination changes
  useEffect(() => {
    fetchPrograms(pagination.currentPage, false, true);
  }, [
    filters.search,
    filters.featured,
    filters.programType,
    filters.priceRange,
    filters.minPrice,
    filters.maxPrice,
    filters.tags,
    filters.country,
    filters.specialty,
    filters.type,
    filters.university,
    pagination.currentPage,
    sortBy,
    sortOrder,
    fetchPrograms,
  ]);

  useEffect(() => {
    // This is for filter changes - use replace: true to preserve scroll
    // Only update URL when filters change from user interaction, not from URL sync
    if (filtersRef.current !== filters) {
      updateURLParams(false);
    }
  }, [filters, updateURLParams]);

  // Event handlers
  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilters = {
        ...filtersRef.current,
        [key]: value,
      };

      setFilters(newFilters);
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));

      // Update URL params immediately
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      if (sortBy !== "createdAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
      setSearchParams(params, { replace: true });
    },
    [sortBy, sortOrder, setSearchParams],
  );

  const applySearch = useCallback(() => {
    const trimmed = (searchQuery || "").trim();
    handleFilterChange("search", trimmed);
  }, [searchQuery, handleFilterChange]);

  // Handle applying all filters at once from FilterSidebar
  const handleApplyAllFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

    // Close filters on mobile after applying
    setShowFilters(false);

    // Update URL params with all new filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", "1"); // Reset to first page
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    setSearchParams(params, { replace: true });
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));

    // Update URL params for pagination (allows scroll restoration)
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (newPage > 1) params.set("page", newPage);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    setSearchParams(params, { replace: false }); // Normal navigation for pagination

    // Fetch programs for the new page
    fetchPrograms(newPage);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProgramClick = (programId) => {
    navigate(`/Programs/${programId}`);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setShowSortMenu(false);
  };

  const resetFilters = () => {
    const cleared = {
      search: "",
      featured: "",
      programType: "",
      priceRange: "",
      minPrice: "",
      maxPrice: "",
      tags: "",
      country: "",
      specialty: "",
      type: "",
      university: "",
    };
    setFilters(cleared);
    setSearchQuery("");
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

    // Load all programs when filters are reset (featured first, then others)
    fetchPrograms(1, true);
  };

  const handleRetry = () => {
    // Retry with current state
    fetchPrograms(pagination.currentPage, true);
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
      value: "title_asc",
      label: t("Title A-Z", "Title A-Z") || "Title A-Z",
      sortBy: "title",
      sortOrder: "asc",
    },
    {
      value: "title_desc",
      label: t("Title Z-A", "Title Z-A") || "Title Z-A",
      sortBy: "title",
      sortOrder: "desc",
    },
    {
      value: "scholarship_desc",
      label:
        t("Highest Scholarship", "Highest Scholarship") ||
        "Highest Scholarship",
      sortBy: "scholarship",
      sortOrder: "desc",
    },
    {
      value: "scholarship_asc",
      label:
        t("Lowest Scholarship", "Lowest Scholarship") || "Lowest Scholarship",
      sortBy: "scholarship",
      sortOrder: "asc",
    },
  ];

  const isSplitMode =
    !!filters.country || !!filters.specialty || !!filters.type;
  const totalDisplayedCount = isSplitMode
    ? exactPrograms.length + otherPrograms.length
    : programs.length;

  if (loading && totalDisplayedCount === 0) {
    return (
      <div className="min-h-screen flex items-col justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 ">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              {t("TrouverUnProgramme", "Find a Program") || "Find a Program"}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              {t(
                "TrouverUnProgrammeDes",
                "Choose country, specialty and search",
              ) ||
                "Discover amazing scholarship opportunities from universities worldwide"}
            </p>
          </div>
          {/* Stats Overview */}
          <StatsOverview
            totalPrograms={stats.total}
            openPrograms={stats.published}
            featuredPrograms={stats.featured}
            totalUniversities={stats.universities}
          />

          {/* Search Bar */}
          <div className="max-w-2xl mt-3 mx-auto relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 sm:w-6 h-5 sm:h-6" />
            <input
              type="text"
              placeholder={
                t("Search programs...", "Search programs...") ||
                "Search programs..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applySearch();
                }
              }}
              className="w-full pl-10 sm:pl-12 pr-24 sm:pr-28 py-3 sm:py-4 text-base sm:text-lg border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />

            <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
              <button
                type="button"
                onClick={applySearch}
                disabled={searchLoading}
                className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
              >
                {searchLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {t("Search", "Search") || "Search"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* - Enrolled Programs Section - */}
      {isAuth && (enrolledProgramsLoading || enrolledPrograms.length > 0) && (
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 border-b border-indigo-800">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {t("My Programs", "Mes études à l’étranger") ||
                    "Mes études à l’étranger"}
                </h2>
                <p className="text-purple-200 text-xs sm:text-sm">
                  {enrolledPrograms.length}{" "}
                  {t("enrolled program", "Enrolled program") ||
                    "enrolled program"}
                  {enrolledPrograms.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {enrolledProgramsLoading ? (
              <div className="flex gap-3 sm:gap-4 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-72 sm:w-80 bg-white/20 rounded-lg sm:rounded-2xl h-24 sm:h-28 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
                {enrolledPrograms.map((program) => {
                  const programTitle =
                    i18n.language === "ar" && program.title_ar
                      ? program.title_ar
                      : program.title;
                  const orgText =
                    i18n.language === "ar" && program.university_ar
                      ? program.university_ar
                      : program.university;
                  return (
                    <div
                      key={program.id}
                      onClick={() => handleProgramClick(program.id)}
                      className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    >
                      {/* Image strip */}
                      <div className="h-20 sm:h-24 bg-gradient-to-br from-purple-400 to-indigo-500 relative overflow-hidden">
                        <ImageWithFallback
                          type="program"
                          src={buildApiUrl(program.Image)}
                          alt={programTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {/* Info */}
                      <div className="p-2 sm:p-3">
                        {orgText && (
                          <p className="text-purple-600 text-xs font-semibold uppercase tracking-wide mb-0.5">
                            {orgText}
                          </p>
                        )}
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                          {programTitle}
                        </h4>
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                            {" "}
                            {t("Enrolled", "Enrolled") || "Enrolled"}
                          </span>
                          {program.status && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {program.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Filter Sidebar */}
          <div
            className={`${showFilters ? "block" : "hidden lg:block"} lg:w-80`}
          >
            <FilterSidebar
              filters={filters}
              onApplyFilters={handleApplyAllFilters}
              onReset={resetFilters}
            />
          </div>

          {/* Programs Content */}
          <div className="flex-1">
            {/* Show selected location if any */}
            {/* Controls Bar */}
            <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm p-3 sm:p-6 mb-4 sm:mb-6">
              {/* All Programs Header with Featured Note */}
              {!showingFeatured && pagination.currentPage === 1 && (
                <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Star className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 fill-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-blue-800">
                        {t("All Programs", "All Programs") || "All Programs"}
                      </h3>
                      <p className="text-xs sm:text-sm text-blue-700">
                        {t(
                          "Featured programs shown first, followed by all others",
                        ) ||
                          "Featured programs shown first, followed by all others"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* Results Info */}
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    {searchLoading && (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="animate-spin rounded-full h-3 sm:h-4 w-3 sm:w-4 border-b-2 border-blue-500"></div>
                        <span className="text-xs sm:text-sm text-blue-600 hidden sm:inline">
                          {t("Updating...", "Updating...") || "Updating..."}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {filters.search ||
                    filters.programType ||
                    filters.featured ||
                    filters.country ||
                    filters.specialty ||
                    filters.type ||
                    filters.university ? (
                      <>
                        {isSplitMode ? (
                          <>
                            {exactPrograms.length}{" "}
                            {t("program", "Program") || "program"}
                            {exactPrograms.length !== 1 ? "s" : ""} exact
                            {otherPrograms.length > 0 && (
                              <> • {otherPrograms.length} other</>
                            )}
                          </>
                        ) : (
                          <>
                            {programs.length}{" "}
                            {t("program", "Program") || "program"}
                            {programs.length !== 1 ? "s" : ""}
                          </>
                        )}{" "}
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
                        {t("Showing", "Showing") || "Showing"} {programs.length}{" "}
                        {t("of", "of") || "of"} {pagination.totalPrograms}{" "}
                        programs
                      </>
                    )}
                  </p>
                </div>

                {/* View and Sort Controls */}
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden px-2 sm:px-3 py-2 border border-gray-200 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 hover:bg-gray-50 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
                  >
                    <Filter className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="hidden sm:inline">
                      {t("Filters", "Filters") || "Filters"}
                    </span>
                    <span className="sm:hidden">F</span>
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-200 rounded-lg sm:rounded-xl p-1 flex-shrink-0">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 sm:p-2 rounded transition-colors ${
                        viewMode === "grid"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 sm:p-2 rounded transition-colors ${
                        viewMode === "list"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative flex-shrink-0 ml-auto">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="px-2 sm:px-4 py-2 border border-gray-200 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 hover:bg-gray-50 text-xs sm:text-base whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">
                        {t("Sort by", "Sort by") || "Sort by"}
                      </span>
                      <span className="sm:hidden">Sort</span>
                      <ChevronDown className="w-3 sm:w-4 h-3 sm:h-4" />
                    </button>

                    {showSortMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-lg z-50">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handleSortChange(option.sortBy, option.sortOrder)
                            }
                            className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 first:rounded-t-lg sm:first:rounded-t-xl last:rounded-b-lg sm:last:rounded-b-xl text-xs sm:text-base ${
                              sortBy === option.sortBy &&
                              sortOrder === option.sortOrder
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Programs Grid/List */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center">
                <p className="text-red-600 text-lg">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                >
                  {t("Try Again", "Try Again") || "Try Again"}
                </button>
              </div>
            ) : totalDisplayedCount === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6 sm:p-12 text-center">
                <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400" />
                </div>

                {/* Dynamic message based on search and filters */}
                {filters.search ||
                filters.programType ||
                filters.featured ||
                filters.priceRange ||
                filters.minPrice ||
                filters.maxPrice ||
                filters.tags ||
                filters.country ||
                filters.specialty ||
                filters.type ? (
                  <div>
                    <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      {t(
                        "No programs match your criteria",
                        "No programs match your criteria",
                      ) || "No programs match your criteria"}
                    </h3>
                    <div className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      {filters.search && (
                        <p className="mb-2">
                          {t("No results found for", "No results found for") ||
                            "No results found for"}
                          :{" "}
                          <span className="font-semibold text-gray-800">
                            &ldquo;{filters.search}
                            &rdquo;
                          </span>
                        </p>
                      )}

                      <p className="text-gray-600">
                        {t(
                          "Try adjusting your search criteria or filters",
                          "Try adjusting your search criteria or filters",
                        ) || "Try adjusting your search criteria or filters"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      {t("No programs available", "No programs available") ||
                        "No programs available"}
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      {t(
                        "There are currently no programs available. Please check back later.",
                      ) ||
                        "There are currently no programs available. Please check back later."}
                    </p>
                  </div>
                )}

                <button
                  onClick={resetFilters}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  {t("Reset Filters", "Reset Filters") || "Reset Filters"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Filter loading indicator - subtle overlay */}
                {searchLoading && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white bg-opacity-50 rounded-2xl z-10 flex items-center justify-center">
                      <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-gray-600">
                          {t("Updating results...", "Updating results...") ||
                            "Updating results..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isSplitMode ? (
                  <div className="space-y-8">
                    {/* Exact matches section */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {t("Exact Matches", "Exact Matches") ||
                            "Exact Matches"}
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {exactPrograms.length}
                        </span>
                      </div>

                      {exactPrograms.length === 0 ? (
                        <div className="text-sm text-gray-600">
                          {t(
                            "No exact matches for selected filters",
                            "No exact matches for selected filters",
                          )}
                        </div>
                      ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                          {exactPrograms.map((program) => (
                            <ProgramCard
                              key={program.id}
                              program={program}
                              onClick={() => handleProgramClick(program.id)}
                              language={i18n.language}
                              isEnrolled={enrolledProgramIds.has(program.id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <ProgramsList
                          programs={exactPrograms}
                          onProgramClick={handleProgramClick}
                          language={i18n.language}
                          enrolledProgramIds={enrolledProgramIds}
                        />
                      )}
                    </div>

                    {/* Other results section */}
                    {otherPrograms.length > 0 && (
                      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            {t("Other Results", "Other Results") ||
                              "Other Results"}
                          </h3>
                          <span className="text-xs sm:text-sm text-gray-600">
                            {otherPrograms.length}
                          </span>
                        </div>

                        {viewMode === "grid" ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                            {otherPrograms.map((program) => (
                              <ProgramCard
                                key={program.id}
                                program={program}
                                onClick={() => handleProgramClick(program.id)}
                                language={i18n.language}
                                isEnrolled={enrolledProgramIds.has(program.id)}
                              />
                            ))}
                          </div>
                        ) : (
                          <ProgramsList
                            programs={otherPrograms}
                            onProgramClick={handleProgramClick}
                            language={i18n.language}
                            enrolledProgramIds={enrolledProgramIds}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {programs.map((program) => (
                      <ProgramCard
                        key={program.id}
                        program={program}
                        onClick={() => handleProgramClick(program.id)}
                        language={i18n.language}
                        isEnrolled={enrolledProgramIds.has(program.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <ProgramsList
                    programs={programs}
                    onProgramClick={handleProgramClick}
                    language={i18n.language}
                    enrolledProgramIds={enrolledProgramIds}
                  />
                )}

                {/* Pagination */}
                {!isSplitMode && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Programs;
