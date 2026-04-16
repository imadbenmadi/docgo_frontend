import { useTranslation } from "react-i18next";
function Stats({
  statistics,
  enrollments,
  applications,
  certificates,
  favorites,
}) {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
      {/* Enrolled Courses */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div
            className={`${isRTL ? "mr-2 sm:mr-3 md:mr-4" : "ml-2 sm:ml-3 md:ml-4"}`}
          >
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {statistics.totalEnrollments ||
                enrollments.courses.length + enrollments.programs.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {t(
                "dashboard_data.totalEnrollments",
                "Nombre total d'inscriptions",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        <div className="flex items-center">
          <div className="bg-green-100 p-2 sm:p-3 rounded-full">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div
            className={`${isRTL ? "mr-2 sm:mr-3 md:mr-4" : "ml-2 sm:ml-3 md:ml-4"}`}
          >
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {statistics.pendingApplications ||
                applications.programs.length + applications.courses.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {t("dashboard_data.pendingApplications", "Demandes en attente")}
            </p>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <div
            className={`${isRTL ? "mr-2 sm:mr-3 md:mr-4" : "ml-2 sm:ml-3 md:ml-4"}`}
          >
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {statistics.totalCertificates || certificates.courses.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {t("dashboard_data.certificates", "Certificats")}
            </p>
          </div>
        </div>
      </div>

      {/* Favorites */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div
            className={`${isRTL ? "mr-2 sm:mr-3 md:mr-4" : "ml-2 sm:ml-3 md:ml-4"}`}
          >
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {statistics.totalFavorites || favorites.all.length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {t("dashboard_data.favorites", "Favoris")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
