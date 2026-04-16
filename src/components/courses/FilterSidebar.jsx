import { useTranslation } from "react-i18next";
import {
  RotateCcw,
  BookOpen,
  Star,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export function FilterSidebar({
  filters,
  onApplyFilters,
  categories,
  specialties, // This will now come from the server
  onReset,
}) {
  const { t } = useTranslation();

  // Local draft state (doesn't trigger parent updates until user clicks Search)
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleLocalFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }
  };

  const handleReset = () => {
    const reset = {
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
    setLocalFilters(reset);
    onReset();
  };

  // Create specialties options from dynamic data
  const specialtyOptions = [
    {
      value: "",
      label: t("All Specialties", "All Specialties") || "All Specialties",
    },
    ...specialties.map((specialty) => ({
      value: specialty,
      label: specialty,
    })),
  ];

  const difficulties = [
    { value: "", label: t("All Levels", "All Levels") || "All Levels" },
    { value: "beginner", label: t("Beginner", "Beginner") || "Beginner" },
    {
      value: "intermediate",
      label: t("Intermediate", "Intermediate") || "Intermediate",
    },
    { value: "advanced", label: t("Advanced", "Advanced") || "Advanced" },
    { value: "expert", label: t("Expert", "Expert") || "Expert" },
  ];

  // Status options for courses
  const statusOptions = [
    { value: "", label: t("All Status", "All Status") || "All Status" },
    { value: "published", label: t("Published", "Published") || "Published" },
    { value: "draft", label: t("Draft", "Draft") || "Draft" },
    { value: "archived", label: t("Archived", "Archived") || "Archived" },
  ];

  const certificateOptions = [
    { value: "", label: t("All Courses", "All Courses") || "All Courses" },
    {
      value: "true",
      label: t("With Certificate", "With Certificate") || "With Certificate",
    },
    {
      value: "false",
      label: t("No Certificate", "No Certificate") || "No Certificate",
    },
  ];

  const isFreeFilter =
    localFilters.maxPrice === "0" && localFilters.minPrice === "0";

  const handleFreeToggle = (value) => {
    if (value === "free") {
      handleLocalFilterChange("maxPrice", "0");
      handleLocalFilterChange("minPrice", "0");
    } else {
      handleLocalFilterChange("maxPrice", "");
      handleLocalFilterChange("minPrice", "");
    }
  };

  const hasActiveFilters =
    localFilters.category ||
    localFilters.specialty ||
    localFilters.difficulty ||
    localFilters.price ||
    localFilters.certificate ||
    localFilters.featured ||
    localFilters.status ||
    localFilters.search ||
    localFilters.minPrice ||
    localFilters.maxPrice;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          {t("Filters", "Filters") || "Filters"}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t("Reset", "Reset") || "Reset"}
          </button>
        )}
      </div>

      {/* Search Button - Apply all local filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          {t("Search", "Search") || "Search"}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {t("Reset", "Reset") || "Reset"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Featured Filter - Move to top with special styling */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
            {t("Featured Courses", "Featured Courses") || "Featured Courses"}
          </label>
          <div className="space-y-2">
            {[
              {
                value: "",
                label: t("All Courses", "All Courses") || "All Courses",
                icon: "",
              },
              {
                value: "true",
                label: t("Featured Only", "Featured Only") || "Featured Only",
                icon: "",
              },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer hover:bg-yellow-100 p-2 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="featured"
                  value={option.value}
                  checked={localFilters.featured === option.value}
                  onChange={(e) =>
                    handleLocalFilterChange("featured", e.target.value)
                  }
                  className="text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm font-medium text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <BookOpen className="w-4 h-4 text-blue-600" />
            {t("Category", "Category") || "Category"}
          </label>
          <select
            value={localFilters.category || ""}
            onChange={(e) =>
              handleLocalFilterChange("category", e.target.value)
            }
            className="w-full p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          >
            <option value="">
              {t("All Categories", "All Categories") || "All Categories"}
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Specialty Filter */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Star className="w-4 h-4 text-green-600" />
            {t("Specialty", "Specialty") || "Specialty"}
          </label>
          <select
            value={localFilters.specialty || ""}
            onChange={(e) =>
              handleLocalFilterChange("specialty", e.target.value)
            }
            className="w-full p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
          >
            {specialtyOptions.map((specialty) => (
              <option key={specialty.value} value={specialty.value}>
                {specialty.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Clock className="w-4 h-4 text-purple-600" />
            {t("Difficulty", "Difficulty") || "Difficulty"}
          </label>
          <select
            value={localFilters.difficulty || ""}
            onChange={(e) =>
              handleLocalFilterChange("difficulty", e.target.value)
            }
            className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            {t("Status", "Status") || "Status"}
          </label>
          <select
            value={localFilters.status || ""}
            onChange={(e) => handleLocalFilterChange("status", e.target.value)}
            className="w-full p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Certificate Filter */}
        <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Star className="w-4 h-4 text-teal-600" />
            {t("Certificate", "certificate") || "Certificate"}
          </label>
          <div className="space-y-2">
            {certificateOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer hover:bg-teal-100 p-2 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="certificate"
                  value={option.value}
                  checked={localFilters.certificate === option.value}
                  onChange={(e) =>
                    handleLocalFilterChange("certificate", e.target.value)
                  }
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Free Courses Filter */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Sparkles className="w-5 h-5 text-green-600" />
            {t("Price Type", "Price Type") || "Price Type"}
          </label>
          <div className="space-y-2">
            {[
              {
                value: "all",
                label: t("All Courses", "All Courses") || "All Courses",
                icon: "",
              },
              {
                value: "free",
                label: t("Free Only", "Free Only") || "Free Only",
                icon: "",
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                  (option.value === "free" ? isFreeFilter : !isFreeFilter)
                    ? "bg-green-200 border border-green-400"
                    : "hover:bg-green-100"
                }`}
              >
                <input
                  type="radio"
                  name="priceType"
                  value={option.value}
                  checked={
                    option.value === "free" ? isFreeFilter : !isFreeFilter
                  }
                  onChange={() => handleFreeToggle(option.value)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm font-medium text-gray-700">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            {/* <DollarSign className="w-4 h-4 text-emerald-600" /> */}
            {t("Price Range", "Price Range") || "Price Range"}
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-emerald-600 mb-1 block">
                  {t("Min Price", "Min Price") || "Min Price"}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={localFilters.minPrice || ""}
                  onChange={(e) =>
                    handleLocalFilterChange("minPrice", e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApply();
                    }
                  }}
                  className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-emerald-600 mb-1 block">
                  {t("Max Price", "Max Price") || "Max Price"}
                </label>
                <input
                  type="number"
                  placeholder=""
                  value={localFilters.maxPrice || ""}
                  onChange={(e) =>
                    handleLocalFilterChange("maxPrice", e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApply();
                    }
                  }}
                  className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string,
    specialty: PropTypes.string,
    difficulty: PropTypes.string,
    price: PropTypes.string,
    certificate: PropTypes.string,
    featured: PropTypes.string,
    status: PropTypes.string,
    search: PropTypes.string,
    minPrice: PropTypes.string,
    maxPrice: PropTypes.string,
    language: PropTypes.string,
  }).isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  specialties: PropTypes.arrayOf(PropTypes.string).isRequired, // Now required from server
  onReset: PropTypes.func.isRequired,
};

export default FilterSidebar;
