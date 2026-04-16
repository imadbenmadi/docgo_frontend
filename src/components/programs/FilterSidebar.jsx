import {
  Globe,
  Filter,
  RotateCcw,
  Star,
  Tag,
  Zap,
  Search,
  GraduationCap,
} from "lucide-react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { clientProgramsAPI } from "../../API/Programs";

const FilterSidebar = ({ filters, onApplyFilters, onReset }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    countries: [],
    specialtiesPerCountry: {},
    typesPerCountrySpecialty: {},
    universities: [],
  });

  // Local form state (doesn't trigger URL changes)
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch all filters data on mount
  useEffect(() => {
    const fetchAllFilters = async () => {
      setLoading(true);
      try {
        const [opts, categories] = await Promise.all([
          clientProgramsAPI.getRegisterOptions(),
          clientProgramsAPI.getProgramCategories().catch(() => null),
        ]);

        const universities =
          categories?.data?.universities ||
          categories?.data?.data?.universities;

        setOptions({
          ...opts,
          universities: Array.isArray(universities) ? universities : [],
        });
      } catch {
        setOptions({
          countries: [],
          specialtiesPerCountry: {},
          typesPerCountrySpecialty: {},
          universities: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAllFilters();
  }, []);

  // Sync local filters with parent whenever parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle local filter change (doesn't trigger parent update)
  const handleLocalFilterChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };

    // If country changes, reset specialty and type
    if (key === "country") {
      updated.specialty = "";
      updated.type = "";
    }

    // If specialty changes, reset type
    if (key === "specialty") {
      updated.type = "";
    }

    setLocalFilters(updated);
  };

  const handlePriceTypeChange = (value) => {
    // priceRange is used as a simple "type" selector: free | paid | "" (all)
    const updated = { ...localFilters, priceRange: value };

    // Keep the state unambiguous: switching type clears custom min/max.
    if (value === "free" || value === "paid") {
      updated.minPrice = "";
      updated.maxPrice = "";
    }

    setLocalFilters(updated);
  };

  const handleMinPriceChange = (value) => {
    setLocalFilters((prev) => ({
      ...prev,
      minPrice: value,
      priceRange: "", // custom range overrides free/paid selector
    }));
  };

  const handleMaxPriceChange = (value) => {
    setLocalFilters((prev) => ({
      ...prev,
      maxPrice: value,
      priceRange: "", // custom range overrides free/paid selector
    }));
  };

  // Apply filters to parent (triggered by search button)
  const handleApplyFilters = () => {
    // Pass all local filters to parent at once
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }
  };

  // Get available specialties for selected country
  const availableSpecialties = localFilters.country
    ? options.specialtiesPerCountry[localFilters.country] || []
    : [];

  // Get available types for selected country-specialty
  const availableTypes =
    localFilters.country && localFilters.specialty
      ? options.typesPerCountrySpecialty[
          `${localFilters.country}::${localFilters.specialty}`
        ] || []
      : [];

  const universityLabelFor = (u) => {
    if (!u) return "";
    const lang = String(i18n.language || "").toLowerCase();
    const isArabic = lang.startsWith("ar");
    return isArabic ? u.university_ar || u.university : u.university;
  };

  const availableUniversities = Array.isArray(options.universities)
    ? [...options.universities]
        .filter((u) => u?.university)
        .sort((a, b) =>
          universityLabelFor(a).localeCompare(universityLabelFor(b)),
        )
    : [];

  const hasActiveFilters = Object.entries(localFilters).some(
    ([key, value]) => key !== "search" && value !== "",
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">
            {t("Filtres", "Filtres") || "Filtres"}
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-3 h-3" />
            {t("Reset", "Reset") || "Reset"}
          </button>
        )}
      </div>

      {/* Search and Reset Buttons - Top */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleApplyFilters}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          {t("Search", "Search") || "Search"}
        </button>
        <button
          onClick={() => {
            setLocalFilters({
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
            });
            onReset();
          }}
          className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t("Reset", "Reset") || "Reset"}
        </button>
      </div>

      <div className="space-y-3">
        {/* Featured Filter */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-2">
            <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
            {t("Featured Programs", "Featured Programs") || "Featured Programs"}
          </label>
          <div className="space-y-1">
            {[
              {
                value: "",
                label: t("All Programs", "All Programs") || "All Programs",
              },
              {
                value: "true",
                label: t("Featured Only", "Featured Only") || "Featured Only",
              },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-yellow-100 p-1.5 rounded text-xs"
              >
                <input
                  type="radio"
                  name="featured"
                  value={option.value}
                  checked={localFilters.featured === option.value}
                  onChange={(e) =>
                    handleLocalFilterChange("featured", e.target.value)
                  }
                  className="w-3 h-3 text-yellow-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-2">
            {t("Price", "Price") || "Price"}
          </label>

          {/* Price Type */}
          <div className="space-y-1 mb-3">
            {[
              {
                value: "",
                label: t("All", "All") || "All",
              },
              {
                value: "free",
                label: t("Free Only", "Free Only") || "Free Only",
              },
              {
                value: "paid",
                label: t("Paid Only", "Paid Only") || "Paid Only",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-green-100 p-1.5 rounded text-xs"
              >
                <input
                  type="radio"
                  name="priceType"
                  value={opt.value}
                  checked={(localFilters.priceRange || "") === opt.value}
                  onChange={(e) => handlePriceTypeChange(e.target.value)}
                  className="w-3 h-3 text-green-600"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Min/Max */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-green-700 mb-1 block">
                {t("Min", "Min") || "Min"}
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={localFilters.minPrice || ""}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyFilters();
                  }
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-green-700 mb-1 block">
                {t("Max", "Max") || "Max"}
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder=""
                value={localFilters.maxPrice || ""}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyFilters();
                  }
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          <p className="mt-2 text-[11px] text-gray-600">
            {t(
              "Tip: use Free/Paid, or set Min/Max for a custom range.",
              "Tip: use Free/Paid, or set Min/Max for a custom range.",
            ) || "Tip: use Free/Paid, or set Min/Max for a custom range."}
          </p>
        </div>

        {/* University Filter */}
        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            {t("University", "University") || "University"}
          </label>
          <select
            value={localFilters.university || ""}
            onChange={(e) =>
              handleLocalFilterChange("university", e.target.value)
            }
            disabled={loading}
            className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {loading
                ? t("Loading...", "Loading...")
                : t("All Universities", "All Universities") ||
                  "All Universities"}
            </option>
            {availableUniversities.map((u, index) => (
              <option key={`university-${index}`} value={u.university}>
                {universityLabelFor(u)}
              </option>
            ))}
          </select>
        </div>
        {/* Country Filter */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            {t("Country", "Country") || "Country"}
          </label>
          <select
            value={localFilters.country}
            onChange={(e) => handleLocalFilterChange("country", e.target.value)}
            disabled={loading}
            className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {loading
                ? t("Loading...", "Loading...")
                : t("Select Country", "Select Country") || "Select Country"}
            </option>
            {options.countries.map((country, index) => (
              <option key={`country-${index}`} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        {/* Specialty Filter */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            {t("Specialty", "Specialty") || "Specialty"}
          </label>
          <select
            value={localFilters.specialty}
            onChange={(e) =>
              handleLocalFilterChange("specialty", e.target.value)
            }
            disabled={!localFilters.country || loading}
            className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <option value="">
              {!localFilters.country
                ? t("Select Country First", "Select Country First") ||
                  "Select Country First"
                : t("Select Specialty", "Select Specialty") ||
                  "Select Specialty"}
            </option>
            {availableSpecialties.map((specialty, index) => (
              <option key={`specialty-${index}`} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            {t("Program Type", "Program Type") || "Program Type"}
          </label>
          <select
            value={localFilters.type}
            onChange={(e) => handleLocalFilterChange("type", e.target.value)}
            disabled={!localFilters.specialty || loading}
            className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <option value="">
              {!localFilters.specialty
                ? t("Select Specialty First", "Select Specialty First") ||
                  "Select Specialty First"
                : t("Select Type", "Select Type") || "Select Type"}
            </option>
            {availableTypes.map((type, index) => (
              <option key={`type-${index}`} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-pink-600" />
            {t("Tags", "Tags") || "Tags"}
          </label>
          <input
            type="text"
            placeholder={
              t(
                "Enter tags (comma separated)",
                "Enter tags (comma separated)",
              ) || "Enter tags (comma separated)"
            }
            value={localFilters.tags}
            onChange={(e) => handleLocalFilterChange("tags", e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
          />
        </div>
      </div>
    </div>
  );
};

FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    featured: PropTypes.string,
    priceRange: PropTypes.string,
    minPrice: PropTypes.string,
    maxPrice: PropTypes.string,
    tags: PropTypes.string,
    search: PropTypes.string,
    country: PropTypes.string,
    specialty: PropTypes.string,
    type: PropTypes.string,
    university: PropTypes.string,
  }).isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default FilterSidebar;
