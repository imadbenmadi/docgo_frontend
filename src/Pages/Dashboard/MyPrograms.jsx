import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import MainLoading from "../../MainLoading";
import apiClient from "../../services/apiClient";
import ImageWithFallback from "../../components/Common/ImageWithFallback";
import {
  getCountryDisplayName,
  getCountryName,
} from "../../utils/countryCodeMap";

const MyPrograms = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/Users/${user.id}/Profile`);
        const programs = response.data?.data?.applications?.programs || [];
        setApplications(Array.isArray(programs) ? programs : []);
      } catch (error) {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  if (loading) return <MainLoading />;

  return (
    <div className={`p-4 sm:p-6 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("dashboard.myPrograms", "Mes études à l’étranger")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t(
                "dashboard.myProgramsSubtitle",
                "Études à l’étranger auxquelles vous avez postulé",
              )}
            </p>
          </div>
          <Link
            to="/programs"
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            {t("dashboard.browsePrograms", "Parcourir les études à l’étranger")}
          </Link>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t(
              "dashboard.noEnrolledPrograms",
              "Aucune étude à l’étranger inscrite",
            )}
          </h3>
          <p className="text-gray-600 mb-6">
            {t(
              "dashboard.noEnrolledProgramsDescription",
              "Apply to scholarship programs to boost your career!",
            )}
          </p>
          <button
            onClick={() => navigate("/programs")}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t("dashboard.browsePrograms", "Parcourir les études à l’étranger")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {applications.map((application) => {
            const program = application.Program;
            const isDeleted = Boolean(program?.isDeleted);
            const title =
              i18n.language === "ar" && (program?.title_ar || program?.Title_ar)
                ? program.title_ar || program.Title_ar
                : program?.title || program?.Title;
            return (
              <div
                key={application.id}
                className={`bg-white rounded-lg shadow-sm border transition-shadow ${
                  isDeleted ? "border-red-200" : "hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isDeleted) {
                      navigate(`/Programs/${application.ProgramId}/status`);
                    }
                  }}
                  disabled={isDeleted}
                  className="w-full text-left"
                >
                  <div className="p-4 flex gap-4">
                    <ImageWithFallback
                      type="program"
                      src={
                        program?.Image
                          ? `${import.meta.env.VITE_API_URL}${program.Image}`
                          : null
                      }
                      alt={title || "Program"}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">
                        {title}
                      </div>
                      {isDeleted && (
                        <div className="mt-1 text-xs font-semibold text-red-600">
                          {t("dashboard.deleted", "Deleted")}
                        </div>
                      )}
                      {(() => {
                        const org =
                          (i18n.language === "ar" && program?.university_ar
                            ? program.university_ar
                            : program?.university) || "";
                        const loc = (() => {
                          const raw =
                            program?.programCountry || program?.country || "";
                          if (!raw) return "";

                          const rawStr = String(raw);
                          const isIso2 = /^[a-z]{2}$/i.test(rawStr);
                          const frName = isIso2
                            ? getCountryName(rawStr.toUpperCase())
                            : rawStr;

                          return i18n.language === "ar"
                            ? getCountryDisplayName(frName, "ar")
                            : frName;
                        })();
                        const capitalize = (s) =>
                          s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
                        const parts = [org, loc]
                          .filter(Boolean)
                          .map(capitalize);
                        const subtitle =
                          parts.length > 0
                            ? parts.join(" \u2022 ")
                            : [program?.programType, program?.category]
                                .filter(Boolean)
                                .map(capitalize)
                                .join(" \u2022 ");
                        return subtitle ? (
                          <div className="text-sm text-gray-500 mt-0.5 truncate">
                            {subtitle}
                          </div>
                        ) : null;
                      })()}
                      {application.enrollDate && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(
                            application.enrollDate,
                          ).toLocaleDateString()}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isDeleted
                              ? "bg-red-100 text-red-700"
                              : application.status === "approved" ||
                                  application.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : application.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {isDeleted
                            ? t("dashboard.deleted", "Deleted")
                            : String(application.status || "")}
                        </span>
                        {program?.programType && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 capitalize">
                            {program.programType}
                          </span>
                        )}
                      </div>
                      {isDeleted && (
                        <p className="mt-2 text-xs text-red-600">
                          {t(
                            "dashboard.deletedProgramSupport",
                            "This program has been deleted. Contact support for any considerations regarding your enrollment.",
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPrograms;
