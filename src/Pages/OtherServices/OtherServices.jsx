import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BriefcaseBusiness, FileText } from "lucide-react";
import apiClient from "../../utils/apiClient";
import { buildApiUrl } from "../../utils/apiBaseUrl";

export default function OtherServices() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [cvService, setCVService] = useState(null);
  const [internshipCount, setInternshipCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [cvRes, internshipsRes] = await Promise.all([
        apiClient.get("/other-services/cv-service"),
        apiClient.get("/other-services/internships"),
      ]);

      setCVService(cvRes.data.data);
      setInternshipCount(internshipsRes.data.count || 0);
    } catch {
      setCVService(null);
      setInternshipCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        {t("otherServicesPage.loading", "Loading services...") ||
          "Loading services..."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t("otherServicesPage.title", "Our Services") || "Our Services"}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(
              "otherServicesPage.subtitle",
              "Explore professional services designed to advance your career",
            ) ||
              "Explore professional services designed to advance your career"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CV Service */}
          <article
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer"
            onClick={() => navigate("/other-services/cv")}
          >
            <div className="h-44 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
              {cvService?.introductoryImage ? (
                <img
                  src={buildApiUrl(cvService.introductoryImage)}
                  alt={
                    t("otherServicesPage.cvCard.alt", "CV Service") ||
                    "CV Service"
                  }
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <FileText className="w-12 h-12 text-white/90" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {cvService?.title ||
                  t(
                    "otherServicesPage.cvCard.titleFallback",
                    "Professional CV Creation",
                  ) ||
                  "Professional CV Creation"}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t(
                  "otherServicesPage.cvCard.description",
                  "Get your professional CV created by experts. Perfect for job seekers looking to make a great first impression.",
                ) ||
                  "Get your professional CV created by experts. Perfect for job seekers looking to make a great first impression."}
              </p>

              <div className="flex-1" />
              <button className="w-full px-4 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition">
                {t("otherServicesPage.cvCard.cta", "Get Started") ||
                  "Get Started"}{" "}
                →
              </button>
            </div>
          </article>

          {/* Internships */}
          <article
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer"
            onClick={() => navigate("/other-services/internships")}
          >
            <div className="h-44 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center relative overflow-hidden">
              <BriefcaseBusiness className="w-12 h-12 text-white/90" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t(
                  "otherServicesPage.internshipsCard.title",
                  "International Internships",
                ) || "International Internships"}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {t(
                  "otherServicesPage.internshipsCard.description",
                  "Explore internship opportunities around the world. Build your experience with leading companies globally.",
                ) ||
                  "Explore internship opportunities around the world. Build your experience with leading companies globally."}
              </p>

              <p className="text-sm font-semibold text-emerald-700 mb-4">
                {internshipCount}{" "}
                {t(
                  "otherServicesPage.internshipsCard.countSuffix",
                  "active opportunities",
                ) || "active opportunities"}
              </p>

              <div className="flex-1" />
              <button className="w-full px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition">
                {t(
                  "otherServicesPage.internshipsCard.cta",
                  "Browse Internships",
                ) || "Browse Internships"}{" "}
                →
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
