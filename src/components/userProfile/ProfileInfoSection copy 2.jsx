import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Clock } from "lucide-react";

const ProfileInfoSection = ({ profile }) => {
  const { t } = useTranslation();

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <div className="flex-shrink-0">
          <img
            src={profile.avatar}
            className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-lg"
            alt="Profile avatar"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/160x160?text=Profile";
            }}
          />
        </div>
        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
              {profile.name}
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
              <div className="w-5 h-5 bg-amber-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-800">
                {t("profile_data.professional_member", "Professional Member")}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>
                {profile.stats?.completed || 0}{" "}
                {t("profile_data.completed_courses", "Completed courses")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-orange-500">
              <Clock className="w-5 h-5" />
              <span>
                {profile.stats?.inProgress || 0}{" "}
                {t("profile_data.in_progress_courses", "Courses in progress")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <CheckCircle className="w-5 h-5" />
              <span>
                {profile.stats?.totalCertificates || 0}{" "}
                {t("profile_data.certificates", "Certificates")}
              </span>
            </div>
          </div>
          {profile.country && (
            <div className="mt-4 text-gray-600">
              <span className="font-medium">
                {t("profile_data.country", "Country")}:{" "}
              </span>
              {profile.country}
            </div>
          )}
          {profile.studyDomain && (
            <div className="mt-2 text-gray-600">
              <span className="font-medium">
                {t("profile_data.study_field", "Study Domain")}:{" "}
              </span>
              {profile.studyDomain}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoSection;
