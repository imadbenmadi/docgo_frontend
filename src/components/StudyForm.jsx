import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { clientProgramsAPI } from "../API/Programs";
import apiClient from "../utils/apiClient";

const recordSearch = async (what, where, lang) => {
  try {
    await apiClient.post("/home/search", {
      what: what || null,
      where: where || null,
      lang,
    });
  } catch {
    // Non-critical - silent failure
  }
};

const StudyForm = ({ customFields, customLocations }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  // API fallback state (used when customFields / customLocations is absent)
  const [apiCategories, setApiCategories] = useState([]);
  const [apiCountries, setApiCountries] = useState([]);
  const [apiFilteredCountries, setApiFilteredCountries] = useState([]);
  // loading only required when BOTH CMS sources are absent
  const [loading, setLoading] = useState(!customFields && !customLocations);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const lang = i18n.language?.split("-")[0] || "en";

  //  API fallback: only fetch what's missing
  useEffect(() => {
    if (customFields && customLocations) return; // fully CMS - skip API
    fetchData();
  }, [customFields, customLocations]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, locsRes] = await Promise.all([
        customFields
          ? Promise.resolve(null)
          : clientProgramsAPI.getProgramCategories(),
        customLocations
          ? Promise.resolve(null)
          : clientProgramsAPI.getProgramLocations(),
      ]);
      if (catsRes) {
        const cats = catsRes.data?.categories || catsRes.categories || [];
        setApiCategories(Array.isArray(cats) ? cats : []);
      }
      if (locsRes) {
        const locs = locsRes.data?.locations || locsRes.locations || [];
        setApiCountries(Array.isArray(locs) ? locs : []);
        setApiFilteredCountries(Array.isArray(locs) ? locs : []);
      }
    } catch {
      setApiCategories([]);
      setApiCountries([]);
      setApiFilteredCountries([]);
    } finally {
      setLoading(false);
    }
  };

  //  CMS mode: both custom sources provided
  const isCmsMode = !!(customFields && customLocations);

  // All items (unfiltered) - memoized to avoid re-running on every render
  const allFieldItems = useMemo(
    () =>
      customFields
        ? customFields.map((f) => ({
            label: f[lang] || f.en || f.fr || f.ar || "",
            value: f.en || f[lang] || "",
          }))
        : apiCategories.map((c) => ({ label: c, value: c })),
    [customFields, apiCategories, lang],
  );

  const allLocationItems = useMemo(
    () =>
      customLocations
        ? customLocations.map((f) => ({
            label: f[lang] || f.en || f.fr || f.ar || "",
            value: f.en || f[lang] || "",
            // fields[] links this location to specific study domains
            linkedFields: Array.isArray(f.fields) ? f.fields : [],
          }))
        : apiFilteredCountries.map((c) => ({
            label: c,
            value: c,
            linkedFields: [],
          })),
    [customLocations, apiFilteredCountries, lang],
  );

  //  Bidirectional smart filtering
  // "Where" options filtered by selected "What"
  const filteredLocationItems = useMemo(() => {
    if (!isCmsMode || !selectedCategory) return allLocationItems;
    return allLocationItems.filter(
      (loc) =>
        !loc.linkedFields.length || // unlinked = shows always
        loc.linkedFields.includes(selectedCategory),
    );
  }, [allLocationItems, selectedCategory, isCmsMode]);

  // "What" options filtered by selected "Where"
  const filteredFieldItems = useMemo(() => {
    if (!isCmsMode || !selectedCountry) return allFieldItems;
    const selLoc = allLocationItems.find((l) => l.value === selectedCountry);
    if (!selLoc || !selLoc.linkedFields.length) return allFieldItems;
    return allFieldItems.filter((f) => selLoc.linkedFields.includes(f.value));
  }, [allFieldItems, allLocationItems, selectedCountry, isCmsMode]);

  //  Handlers with cross-reset
  const handleCategoryChange = async (value) => {
    setSelectedCategory(value);

    if (isCmsMode) {
      // Reset "where" if it's no longer in filtered list
      if (selectedCountry) {
        const available = value
          ? allLocationItems.filter(
              (l) => !l.linkedFields.length || l.linkedFields.includes(value),
            )
          : allLocationItems;
        if (!available.some((l) => l.value === selectedCountry)) {
          setSelectedCountry("");
        }
      }
      return; // no API call in CMS mode
    }

    // API fallback: filter countries by selected category
    setSelectedCountry("");
    if (!value) {
      setApiFilteredCountries(apiCountries);
      return;
    }
    try {
      const response = await clientProgramsAPI.searchPrograms({
        category: value,
      });
      const programs = response?.data?.programs || response?.programs || [];
      if (programs.length > 0) {
        const unique = [
          ...new Set(
            programs.map((p) => p.Location || p.location).filter(Boolean),
          ),
        ];
        const filtered = apiCountries.filter((c) => unique.includes(c));
        setApiFilteredCountries(filtered.length > 0 ? filtered : apiCountries);
      } else {
        setApiFilteredCountries(apiCountries);
      }
    } catch {
      setApiFilteredCountries(apiCountries);
    }
  };

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    if (isCmsMode && selectedCategory && value) {
      const selLoc = allLocationItems.find((l) => l.value === value);
      if (
        selLoc &&
        selLoc.linkedFields.length &&
        !selLoc.linkedFields.includes(selectedCategory)
      ) {
        // Selected "where" doesn't support current "what" - reset what
        setSelectedCategory("");
      }
    }
  };

  //  Submit
  const handleSubmit = async () => {
    const whatLabel =
      filteredFieldItems.find((o) => o.value === selectedCategory)?.label ||
      selectedCategory ||
      null;
    const whereLabel =
      filteredLocationItems.find((o) => o.value === selectedCountry)?.label ||
      selectedCountry ||
      null;
    if (whatLabel || whereLabel) recordSearch(whatLabel, whereLabel, lang);
    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedCountry) params.append("location", selectedCountry);
    navigate(`/Programs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // In CMS mode the "where" is always interactive; API mode requires a category first
  const locationDisabled = !isCmsMode && !customLocations && !selectedCategory;

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* What - Study Domain */}
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-xl appearance-none cursor-pointer hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm sm:text-base transition-all duration-200"
          dir={i18n.dir()}
        >
          <option value="" disabled>
            {t("WhatDoYouWantToStudy", "What do you want to study?")}
          </option>
          {filteredFieldItems.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`absolute ${
            isRTL ? "left-3 sm:left-4" : "right-3 sm:right-4"
          } top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${selectedCategory ? "rotate-180" : ""}`}
          size={20}
        />
      </div>

      {/* Where - Location */}
      <div className="relative">
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          disabled={locationDisabled}
          className="w-full p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-xl appearance-none cursor-pointer hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          dir={i18n.dir()}
        >
          <option value="" disabled>
            {t("WhereDoYouwantToStudy?", "Where do you want to study?")}
          </option>
          {filteredLocationItems.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`absolute ${
            isRTL ? "left-3 sm:left-4" : "right-3 sm:right-4"
          } top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${selectedCountry ? "rotate-180" : ""}`}
          size={20}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedCategory && !selectedCountry}
        className="w-full p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t("ToRegister", "Register")}
      </button>
    </div>
  );
};

export default StudyForm;
