import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import CountryFlagSelector from "../../components/CountryFlagSelector";
import ProgramSearchModal from "./ProgramSearchModal";
import apiClient from "../../utils/apiClient";

/**
 * Advanced Professional Search Hero Section
 * Allows users to filter programs by Country -> Specialty -> Type
 * Content (title, description, button text) is managed via HomePageManagement dashboard
 */
const AdvancedSearchHero = ({ cms }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const c = (key) => cms?.[`${key}_${lang}`] || cms?.[`${key}_en`] || null;
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    countries: [],
    specialtiesPerCountry: {},
    typesPerCountrySpecialty: {},
  });

  // Form state
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Search modal state
  const [showModal, setShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Load register options on mount
  useEffect(() => {
    fetchRegisterOptions();
  }, []);

  // Reset specialty and type when country changes
  useEffect(() => {
    setSelectedSpecialty("");
    setSelectedType("");
  }, [selectedCountry]);

  // Reset type when specialty changes
  useEffect(() => {
    setSelectedType("");
  }, [selectedSpecialty]);

  const fetchRegisterOptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/public/register-options");
      if (response.data?.options) {
        const opt = response.data.options;
        const countries = opt.programCountries || [];
        const specialtiesPerCountry = opt.programSpecialtiesPerCountry || {};
        const typesPerCountrySpecialty =
          opt.programTypesPerCountrySpecialty || {};

        setOptions({
          countries,
          specialtiesPerCountry,
          typesPerCountrySpecialty,
        });
      }
    } catch {
      setOptions({
        countries: [],
        specialtiesPerCountry: {},
        typesPerCountrySpecialty: {},
      });
    } finally {
      setLoading(false);
    }
  };

  // Get available specialties for selected country
  const availableSpecialties = selectedCountry
    ? options.specialtiesPerCountry[selectedCountry] || []
    : [];

  // Get available types for selected country-specialty
  const availableTypes =
    selectedCountry && selectedSpecialty
      ? options.typesPerCountrySpecialty[
          `${selectedCountry}::${selectedSpecialty}`
        ] || []
      : [];

  // Perform advanced search
  const handleSearch = async () => {
    if (!selectedCountry || !selectedSpecialty || !selectedType) {
      setSearchError("Please select all fields");
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);

      // Fetch programs matching the selection
      const response = await apiClient.get("/programs", {
        params: {
          programCountry: selectedCountry,
          programSpecialty: selectedSpecialty,
          programType: selectedType,
          status: "open",
          limit: 100,
        },
      });

      setSearchResults(response.data?.programs || []);
      setShowModal(true);
    } catch (error) {
      setSearchError(
        error.response?.data?.message || "Error fetching programs",
      );
      setSearchResults([]);
      setShowModal(true);
    } finally {
      setSearchLoading(false);
    }
  };

  // Get content from CMS (/home) or fallback to i18n
  const programSearcherTitle =
    c("programSearcherTitle") ||
    t("findYourPerfectProgram", "Find Your Perfect Program");
  const programSearcherDescription =
    c("programSearcherDescription") ||
    t(
      "advancedSearchDesc",
      "Search for programs by country, specialty, and type. Discover exactly what you're looking for.",
    );
  const programSearcherPlaceholder =
    c("programSearcherPlaceholder") || t("selectCountry", "Select Country");
  const searchButtonText =
    c("programSearcherButtonText") || t("searchPrograms", "Search Programs");

  return (
    <>
      <div className="relative w-full py-16 md:py-20 px-6 md:px-12 lg:px-20 xl:px-28 bg-white overflow-hidden">
        {/* Animated Background - Removed for clean white design */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {t("advancedSearch", "Advanced Program Finder")}
              </span>
              <Sparkles className="w-4 h-4 text-gray-600" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {programSearcherTitle}
            </h2>

            <p className="text-gray-600 max-w-2xl mx-auto">
              {programSearcherDescription}
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Country Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {t("country", "Country")}
                  <span className="text-red-500">*</span>
                </label>
                <CountryFlagSelector
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  countries={options.countries}
                  placeholder={programSearcherPlaceholder}
                  disabled={loading}
                />
              </div>

              {/* Specialty Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                  {t("specialty", "Specialty")}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  disabled={!selectedCountry || loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedCountry
                      ? t("selectCountryFirst", "Select country first")
                      : t("selectSpecialty", "Select Specialty")}
                  </option>
                  {availableSpecialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                  {t("type", "Type")}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  disabled={!selectedSpecialty || loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedSpecialty
                      ? t("selectSpecialtyFirst", "Select specialty first")
                      : t("selectType", "Select Type")}
                  </option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {searchError && (
              <motion.div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {searchError}
              </motion.div>
            )}

            {/* Search Button */}
            <motion.button
              onClick={handleSearch}
              disabled={
                !selectedCountry ||
                !selectedSpecialty ||
                !selectedType ||
                searchLoading
              }
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="w-5 h-5" />
              {searchLoading
                ? t("searching", "Searching...")
                : searchButtonText}
            </motion.button>
          </motion.div>

          {/* Info Cards */}
          {/* <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              {
                title: t("professionalResults", "Professional Results"),
                desc: t(
                  "professionalResultsDesc",
                  "Get exactly the programs matching your criteria",
                ),
              },
              {
                title: t("detailedComparison", "Easy Comparison"),
                desc: t(
                  "easyComparisonDesc",
                  "Compare programs side by side with detailed information",
                ),
              },
              {
                title: t("recommendations", "Smart Recommendations"),
                desc: t(
                  "recommendationsDesc",
                  "Discover programs you may also like based on your selection",
                ),
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 hover:border-blue-200 transition"
              >
                <h4 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </motion.div> */}
        </div>
      </div>

      {/* Search Results Modal */}
      <ProgramSearchModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        results={searchResults}
        selectedCountry={selectedCountry}
        selectedSpecialty={selectedSpecialty}
        selectedType={selectedType}
        loading={searchLoading}
        error={searchError}
      />
    </>
  );
};

AdvancedSearchHero.propTypes = {
  cms: PropTypes.object,
};

export default AdvancedSearchHero;
