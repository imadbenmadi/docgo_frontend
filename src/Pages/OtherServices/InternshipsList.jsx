import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BriefcaseBusiness, Clock, Filter, MapPin, Search } from "lucide-react";
import apiClient from "../../utils/apiClient";
import { buildApiUrl } from "../../utils/apiBaseUrl";

export default function InternshipsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    field: "",
    type: "all",
    isPaid: "all",
  });

  // Search input (only applied when user submits)
  const [searchQuery, setSearchQuery] = useState("");

  const isDashboardRoute = location.pathname
    .toLowerCase()
    .startsWith("/dashboard");
  const servicesHomePath = isDashboardRoute ? "/dashboard" : "/other-services";
  const internshipsListPath = isDashboardRoute
    ? "/dashboard/internships"
    : "/other-services/internships";

  useEffect(() => {
    fetchInternships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.field, filters.type, filters.isPaid, filters.search]);

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      const params = {
        search: filters.search || undefined,
        field: filters.field || undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        isPaid:
          filters.isPaid !== "all"
            ? filters.isPaid === "paid"
              ? true
              : false
            : undefined,
      };

      const response = await apiClient.get("/other-services/internships", {
        params,
      });
      setInternships(response.data.data || []);
    } catch {
      setInternships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fieldOptions = useMemo(() => {
    const set = new Set();
    internships.forEach((internship) => {
      if (internship?.field) set.add(String(internship.field));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [internships]);

  const typeOptions = useMemo(() => {
    const set = new Set();
    internships.forEach((internship) => {
      if (internship?.type) set.add(String(internship.type));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [internships]);

  const handleSubmitSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery.trim() }));
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({
      search: "",
      field: "",
      type: "all",
      isPaid: "all",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(servicesHomePath)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ←{" "}
            {t("internshipsPage.backToServices", "Back to Services") ||
              "Back to Services"}
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {t("internshipsPage.title", "International Internships") ||
                  "International Internships"}
              </h1>
              <p className="mt-2 text-gray-600">
                {(
                  t(
                    "internshipsPage.countText",
                    "{{count}} opportunities available",
                    { count: internships.length },
                  ) || `${internships.length} opportunities available`
                ).replace("{{count}}", String(internships.length))}
              </p>
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-white border border-gray-200 hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" />
              {t("internshipsPage.filters", "Filters") || "Filters"}
            </button>
          </div>

          {/* Search */}
          <div className="mt-6 flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmitSearch();
                }}
                placeholder={
                  t(
                    "internshipsPage.searchPlaceholder",
                    "Search internships...",
                  ) || "Search internships..."
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSubmitSearch}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              {t("internshipsPage.search", "Search") || "Search"}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold bg-white border border-gray-200 hover:bg-gray-50 transition"
            >
              {t("internshipsPage.reset", "Reset") || "Reset"}
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside
            className={`${showFilters ? "block" : "hidden"} lg:block lg:col-span-1`}
          >
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-4 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t("internshipsPage.filters", "Filters") || "Filters"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("internshipsPage.field", "Field") || "Field"}
                  </label>
                  <select
                    value={filters.field}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, field: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {t("internshipsPage.allFields", "All Fields") ||
                        "All Fields"}
                    </option>
                    {fieldOptions.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("internshipsPage.type", "Type") || "Type"}
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">
                      {t("internshipsPage.allTypes", "All Types") ||
                        "All Types"}
                    </option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("internshipsPage.payment", "Payment") || "Payment"}
                  </label>
                  <select
                    value={filters.isPaid}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        isPaid: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">
                      {t("internshipsPage.paymentAll", "All") || "All"}
                    </option>
                    <option value="paid">
                      {t("internshipsPage.paymentPaid", "Paid") || "Paid"}
                    </option>
                    <option value="unpaid">
                      {t("internshipsPage.paymentUnpaid", "Unpaid") || "Unpaid"}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                {t("internshipsPage.loading", "Loading internships...") ||
                  "Loading internships..."}
              </div>
            ) : internships.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-gray-600 text-lg">
                  {t(
                    "internshipsPage.empty",
                    "No internships found matching your criteria",
                  ) || "No internships found matching your criteria"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {internships.map((internship) => {
                  const descriptionText = internship?.description
                    ? String(internship.description).replace(/<[^>]*>/g, "")
                    : "";

                  const showPrice = internship?.isPaid && internship?.price;
                  const priceLabel = showPrice
                    ? `${internship.currency || "USD"} ${internship.price}`
                    : t("internshipsPage.unpaid", "Unpaid") || "Unpaid";

                  return (
                    <article
                      key={internship.id}
                      onClick={() =>
                        navigate(`${internshipsListPath}/${internship.id}`)
                      }
                      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer"
                    >
                      <div className="h-44 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center relative overflow-hidden">
                        {internship.introductoryImage ? (
                          <img
                            src={buildApiUrl(internship.introductoryImage)}
                            alt={internship.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <BriefcaseBusiness className="w-12 h-12 text-white/90" />
                        )}
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {internship.type && (
                              <span className="bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                {internship.type}
                              </span>
                            )}
                            {internship.field && (
                              <span className="bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                {internship.field}
                              </span>
                            )}
                          </div>
                          <span className="bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            {priceLabel}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      </div>

                      <div className="p-5 flex flex-col flex-1 min-w-0">
                        {internship.companyName && (
                          <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-1 break-words">
                            {internship.companyName}
                          </p>
                        )}

                        <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-snug break-words">
                          {internship.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                          {internship.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {internship.location}
                            </span>
                          )}
                          {internship.applicationDeadline && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {t("internshipsPage.applyBy", "Apply by") ||
                                "Apply by"}
                              :{" "}
                              {new Date(
                                internship.applicationDeadline,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {descriptionText && (
                          <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed mb-4 break-words">
                            {descriptionText}
                          </p>
                        )}

                        <div className="flex-1" />
                        <button className="w-full px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition">
                          {t("internshipsPage.viewDetails", "View Details") ||
                            "View Details"}{" "}
                          →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
