import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Briefcase,
  Award,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getCountryDisplayName } from "../../utils/countryCodeMap";

/**
 * Program Search Results Modal
 * Shows exact results and recommendations
 */
const ProgramSearchModal = ({
  isOpen,
  onClose,
  results = [],
  selectedCountry,
  selectedSpecialty,
  selectedType,
  loading = false,
  error = null,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("exact");

  // Separate exact matches and recommendations
  const { exactResults, recommendations } = useMemo(() => {
    if (!results || results.length === 0)
      return { exactResults: [], recommendations: [] };

    const exact = results.filter(
      (p) =>
        p.programCountry === selectedCountry &&
        p.programSpecialty === selectedSpecialty &&
        p.programType === selectedType,
    );

    const recs = results.filter(
      (p) =>
        !(
          p.programCountry === selectedCountry &&
          p.programSpecialty === selectedSpecialty &&
          p.programType === selectedType
        ),
    );

    return {
      exactResults: exact,
      recommendations: recs.slice(0, 6), // Show max 6 recommendations
    };
  }, [results, selectedCountry, selectedSpecialty, selectedType]);

  const countryDisplay = getCountryDisplayName(
    selectedCountry,
    i18n.language?.split("-")[0] || "fr",
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="bg-gray-100 border-b border-gray-200 text-gray-900 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {t("searchResults", "Search Results")}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {countryDisplay} • {selectedSpecialty} • {selectedType}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {loading ? (
                // Loading State
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span className="text-gray-600">
                      {t("searchingPrograms", "Searching for programs...")}
                    </span>
                  </div>
                </div>
              ) : error ? (
                // Error State
                <div className="p-8 text-center">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-900 mb-1">
                        {t("errorFetchingPrograms", "Error Fetching Programs")}
                      </p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              ) : exactResults.length === 0 && recommendations.length === 0 ? (
                // Empty State
                <div className="p-8 text-center">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {t("noProgramsFound", "No Programs Found")}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {t(
                          "tryOtherCriteria",
                          "Try adjusting your search criteria",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8">
                  {/* Tabs */}
                  <div className="flex gap-4 border-b mb-6">
                    <button
                      onClick={() => setSelectedTab("exact")}
                      className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
                        selectedTab === "exact"
                          ? "text-gray-900 border-gray-900"
                          : "text-gray-600 border-transparent hover:text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        {t("exactMatches", "Exact Matches")} (
                        {exactResults.length})
                      </span>
                    </button>
                    {recommendations.length > 0 && (
                      <button
                        onClick={() => setSelectedTab("recommendations")}
                        className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
                          selectedTab === "recommendations"
                            ? "text-gray-900 border-gray-900"
                            : "text-gray-600 border-transparent hover:text-gray-900"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          {t("youMayAlsoLike", "You May Also Like")} (
                          {recommendations.length})
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Results Grid */}
                  <motion.div
                    key={selectedTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {selectedTab === "exact" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exactResults.length === 0 ? (
                          <div className="col-span-full text-center py-8 text-gray-600">
                            {t("noExactMatches", "No exact matches found")}
                          </div>
                        ) : (
                          exactResults.map((program) => (
                            <ProgramCard
                              key={program.id}
                              program={program}
                              isRecommendation={false}
                            />
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((program) => (
                          <ProgramCard
                            key={program.id}
                            program={program}
                            isRecommendation={true}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading &&
              !error &&
              (exactResults.length > 0 || recommendations.length > 0) && (
                <div className="border-t bg-gray-50 p-6 md:p-8 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {t("totalPrograms", "Total Programs")}:{" "}
                    {exactResults.length + recommendations.length}
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 hover:shadow-lg transition"
                  >
                    {t("close", "Close")}
                  </button>
                </div>
              )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/**
 * Program Card Component
 */
const ProgramCard = ({ program, isRecommendation = false }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
        isRecommendation
          ? "border-purple-200 bg-purple-50/50"
          : "border-indigo-200 bg-indigo-50/50"
      }`}
      whileHover={{ y: -4 }}
    >
      {/* Badge */}
      {isRecommendation && (
        <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
          <Star className="w-3 h-3 inline mr-1" />
          {t("recommended", "Recommended")}
        </div>
      )}

      {/* Title */}
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {program.title || program.title_ar}
      </h4>

      {/* Meta Info */}
      <div className="space-y-2 mb-4">
        {program.university && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            {program.university}
          </p>
        )}

        {program.programCountry && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            {program.programCountry}
          </p>
        )}

        {program.Users_count && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            {program.Users_count} {t("enrolledStudents", "enrolled")}
          </p>
        )}
      </div>

      {/* Rating */}
      {program.Rate && (
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.round(program.Rate)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">
            {program.Rate?.toFixed(1)}
          </span>
        </div>
      )}

      {/* View Button */}
      <Link
        to={`/Programs/${program.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 group"
      >
        {t("viewDetails", "View Details")}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
};

export default ProgramSearchModal;
