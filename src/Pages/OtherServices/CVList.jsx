import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, FileText, Search } from "lucide-react";
import apiClient from "../../utils/apiClient";
import { buildApiUrl } from "../../utils/apiBaseUrl";
import { formatPrice } from "../../utils/money";

export default function CVList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("default");

  const isDashboardRoute = location.pathname
    .toLowerCase()
    .startsWith("/dashboard");
  const servicesHomePath = isDashboardRoute ? "/dashboard" : "/other-services";
  const cvListPath = isDashboardRoute ? "/dashboard/cv" : "/other-services/cv";

  // The search runs on the server, which ignores case and accents and still
  // finds a title that was mistyped by a letter. Filtering here with
  // `includes` meant "redaction" found nothing when the service was called
  // "Rédaction". Typing is debounced so a word costs one request, not eight.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get("/other-services/cv-services", {
          params: { search: query.trim() || undefined },
        });
        if (!cancelled) setServices(res.data?.data || []);
      } catch {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, query ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const amountOf = (s) => Number(s?.price ?? s?.estimatedPrice ?? 0);
  const isFree = (s) => s?.isPaid === false || !(amountOf(s) > 0);

  const visible = services
    .filter((s) =>
      price === "free" ? isFree(s) : price === "paid" ? !isFree(s) : true,
    )
    // Only when asked: the default order is the one the server ranked, which
    // with a search term means best match first.
    .sort((a, b) =>
      sort === "priceAsc"
        ? amountOf(a) - amountOf(b)
        : sort === "priceDesc"
          ? amountOf(b) - amountOf(a)
          : 0,
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(servicesHomePath)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← {t("cvListPage.back", "Back to Services") || "Back to Services"}
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t("cvListPage.title", "CV Services") || "CV Services"}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(
              "cvListPage.subtitle",
              "Choose the service that fits what you need, and our team will write it for you.",
            ) ||
              "Choose the service that fits what you need, and our team will write it for you."}
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                t("cvListPage.search", "Search services") || "Search services"
              }
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">
              {t("cvListPage.priceAll", "All prices") || "All prices"}
            </option>
            <option value="free">
              {t("cvListPage.free", "Free") || "Free"}
            </option>
            <option value="paid">
              {t("cvListPage.paid", "Paid") || "Paid"}
            </option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">
              {t("cvListPage.sortDefault", "Recommended") || "Recommended"}
            </option>
            <option value="priceAsc">
              {t("cvListPage.sortPriceAsc", "Price: low to high") ||
                "Price: low to high"}
            </option>
            <option value="priceDesc">
              {t("cvListPage.sortPriceDesc", "Price: high to low") ||
                "Price: high to low"}
            </option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-600">
            {t("cvListPage.loading", "Loading CV services...") ||
              "Loading CV services..."}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-600 text-lg">
              {query || price !== "all"
                ? t("cvListPage.noMatch", "No service matches that search.") ||
                  "No service matches that search."
                : t("cvListPage.empty", "No CV services are available yet.") ||
                  "No CV services are available yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {visible.map((service) => {
              const descriptionText = service?.description
                ? String(service.description).replace(/<[^>]*>/g, "")
                : "";

              const amount = service?.price ?? service?.estimatedPrice;
              const isPaid = service?.isPaid !== false && Number(amount) > 0;
              const priceLabel = isPaid
                ? formatPrice(amount, service.currency || "DZD", i18n.language)
                : t("cvListPage.free", "Free") || "Free";

              return (
                <article
                  key={service.id}
                  onClick={() => navigate(`${cvListPath}/${service.id}`)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer"
                >
                  <div className="h-44 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                    {service.introductoryImage ? (
                      <img
                        src={buildApiUrl(service.introductoryImage)}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-white/90" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {priceLabel}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </div>

                  <div className="p-5 flex flex-col flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-snug break-words">
                      {service.title}
                    </h3>

                    {descriptionText && (
                      <p className="text-sm text-gray-600 line-clamp-3 break-words">
                        {descriptionText}
                      </p>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                      {service.deliveryDays ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {t("cvListPage.delivery", "{{days}} days", {
                            days: service.deliveryDays,
                          }) || `${service.deliveryDays} days`}
                        </span>
                      ) : (
                        <span />
                      )}

                      <span className="text-blue-600 text-sm font-semibold group-hover:underline">
                        {t("cvListPage.view", "View details") || "View details"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
