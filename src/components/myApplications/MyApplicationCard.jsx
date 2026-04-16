import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Clock, Calendar, MapPin } from "lucide-react";
import {
  getCountryDisplayName,
  getCountryName,
} from "../../utils/countryCodeMap";

const MyApplicationCard = ({ program, status }) => {
  const { t, i18n } = useTranslation();

  const countryText = (() => {
    const raw = program?.programCountry || program?.country || "";
    if (!raw) return "";

    const rawStr = String(raw);
    const isIso2 = /^[a-z]{2}$/i.test(rawStr);
    const frName = isIso2 ? getCountryName(rawStr.toUpperCase()) : rawStr;

    return i18n.language === "ar"
      ? getCountryDisplayName(frName, "ar")
      : frName;
  })();
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      rejected: {
        icon: XCircle,
        text: t("myApplicationsPage.status.rejected", "Rejected"),
        className: "bg-red-50 text-red-700 border-red-200",
      },
      accepted: {
        icon: CheckCircle,
        text: t("myApplicationsPage.status.accepted", "Accepted"),
        className: "bg-green-50 text-green-700 border-green-200",
      },
      pending: {
        icon: Clock,
        text: t("myApplicationsPage.status.pending", "Pending"),
        className: "bg-amber-50 text-amber-700 border-amber-200",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium ${config.className}`}
      >
        <Icon size={16} />
        <span>{config.text}</span>
      </div>
    );
  };

  const backgroundStyles = {
    rejected: "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200",
    accepted:
      "bg-gradient-to-br from-green-50 to-green-100/50 border-green-200",
    pending: "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200",
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 ${backgroundStyles[status]}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Program Image */}
          <div className="flex-shrink-0">
            <div className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm p-2 shadow-sm">
              <img
                src={import.meta.env.VITE_API_URL + program.Image}
                alt={program.title}
                className="w-24 h-20 lg:w-28 lg:h-24 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              {/* Program Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    {program.title}
                  </h2>
                  <div className="hidden lg:block">
                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {t("myApplicationsPage.appliedOn", "Applied on")}{" "}
                      {program.appliedDate || ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{countryText || t("country", "Country")}</span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      {t("myApplicationsPage.description")}
                    </h3>
                    {/* <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                                            {program.description}
                                        </p> */}
                  </div>
                </div>
              </div>

              {/* Mobile Status Badge */}
              <div className="lg:hidden">
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar for Pending Applications */}
        {status === "pending" && (
          <div className="mt-6 pt-4 border-t border-amber-200/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-amber-700">
                {t(
                  "myApplicationsPage.applicationProgress",
                  "Application Progress",
                )}
              </span>
              <span className="text-xs text-amber-600">
                {t("myApplicationsPage.underReview", "Under Review")}
              </span>
            </div>
            <div className="w-full bg-amber-200/50 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full w-3/4 transition-all duration-300" />
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
export default MyApplicationCard;
