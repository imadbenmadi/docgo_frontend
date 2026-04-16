import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Clock, Award, FileText, User, Globe } from "lucide-react";

const ProfileInfoSection = ({ profile }) => {
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;

  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return t("profile_data.notProvided", "Not provided");
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? trimmed : t("profile_data.notProvided", "Not provided");
    }

    if (typeof value === "boolean") {
      return value ? t("common.yes", "Yes") : t("common.no", "No");
    }

    return String(value);
  };

  const renderStatusLabel = (value, map) => {
    if (!value) return t("profile_data.notProvided", "Not provided");
    return map[value] || value;
  };

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

  const name = profile?.name || "";
  const avatarUrl = profile?.avatar ? `${API_URL}${profile.avatar}` : null;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="w-full h-full object-cover"
                alt={t("profile_data.avatarAlt", "Profile avatar")}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : null}
            <div
              className={`w-full h-full items-center justify-center ${avatarUrl ? "hidden" : "flex"}`}
            >
              <User className="w-16 h-16 lg:w-20 lg:h-20 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
              {name}
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
              <div className="w-5 h-5 bg-amber-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-800">
                {t("profile_data.professional_member", "Professional Member")}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <div>
                <div className="font-bold text-lg">
                  {profile?.stats?.coursesCompleted || 0}
                </div>
                <div className="text-xs text-gray-600">
                  {t("profile_data.completed", "Completed")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-500">
              <Clock className="w-5 h-5" />
              <div>
                <div className="font-bold text-lg">
                  {profile?.stats?.coursesInProgress || 0}
                </div>
                <div className="text-xs text-gray-600">
                  {t("profile_data.in_progress", "In Progress")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Award className="w-5 h-5" />
              <div>
                <div className="font-bold text-lg">
                  {profile?.stats?.totalCertificates || 0}
                </div>
                <div className="text-xs text-gray-600">
                  {t("profile_data.certificates", "Certificates")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <FileText className="w-5 h-5" />
              <div>
                <div className="font-bold text-lg">
                  {profile?.stats?.totalApplications || 0}
                </div>
                <div className="text-xs text-gray-600">
                  {t("profile_data.applications", "Applications")}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {profile?.email ? (
              <div className="text-gray-600">
                <span className="font-medium">
                  {t("profile_data.email", "Email")}:{" "}
                </span>
                {profile.email}
              </div>
            ) : null}

            {profile?.phoneNumber ? (
              <div className="text-gray-600">
                <span className="font-medium">
                  {t("profile_data.phone", "Phone")}:{" "}
                </span>
                {profile.phoneNumber}
              </div>
            ) : null}
          </div>

          {/* Student Profile Information */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">
                {t(
                  "profile_data.studentProfileInformation",
                  "Student Profile Information",
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.university", "University")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.university)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.country", "Country")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.country)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.studyDomain", "Study Domain")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.studyDomain)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.specialty", "Specialty")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.specialty)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.academicAverage", "Academic Average")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.academicAverage)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t(
                    "profile_data.currentAcademicLevel",
                    "Current Academic Level",
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.currentAcademicLevel)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.redoubledYear", "Redoubled Year")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.hasRedoubledYear)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.professionalStatus", "Professional Status")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderStatusLabel(profile?.professionalStatus, {
                    student: t("editProfile.student", "Student"),
                    worker: t("editProfile.worker", "Working Professional"),
                    other: t("editProfile.other", "Other"),
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.academicStatus", "Academic Status")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderStatusLabel(profile?.academicStatus, {
                    student: t("editProfile.currentStudent", "Current Student"),
                    graduated: t("editProfile.graduated", "Graduated"),
                    other: t("editProfile.other", "Other"),
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.yearsOfExperience", "Years Of Experience")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.yearsOfExperience)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  {t("profile_data.currentJobTitle", "Current Job Title")}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {renderValue(profile?.currentJobTitle)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoSection;
