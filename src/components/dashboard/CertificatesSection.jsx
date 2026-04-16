import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CertificatesSection = ({ certificates }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  if (!certificates || certificates.courses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {t("dashboard.noCertificates", "No Certificates Yet")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {t(
                "dashboard.noCertificatesDescription",
                "Complete courses and pass quizzes to earn certificates!",
              )}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/my-learning")}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {t("dashboard.startLearning", "Start Learning")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
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
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
            {t("dashboard.earnedCertificates", "Earned Certificates")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500">
            {certificates.courses.length}{" "}
            {t("dashboard.certificates", "certificates")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {certificates.courses.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-purple-200 hover:border-purple-400"
            onClick={() =>
              navigate(`/verify/certificate/${certificate.certificateId}`)
            }
          >
            <div className="flex flex-col h-full">
              {/* Certificate Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-600 p-1.5 sm:p-2 rounded-full">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-purple-700 uppercase">
                    {t("dashboard.certified", "Certified")}
                  </span>
                </div>
              </div>

              {/* Course Image */}
              {certificate.Course?.Image && (
                <img
                  src={`${import.meta.env.VITE_API_URL}${certificate.Course.Image}`}
                  alt={certificate.Course.Title}
                  className="w-full h-24 sm:h-32 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}

              {/* Course Info */}
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 line-clamp-2">
                  {i18n.language === "ar" && certificate.Course?.Title_ar
                    ? certificate.Course.Title_ar
                    : certificate.Course?.Title}
                </h3>

                <div className="space-y-1.5 sm:space-y-2">
                  {/* Completion Info */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate">
                      {t("dashboard.allVideosWatched", "All videos watched")}
                    </span>
                  </div>

                  {/* Quiz Passed */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate">
                      {t("dashboard.quizPassed", "Quiz passed")}
                    </span>
                  </div>

                  {/* Issue Date */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 pt-2 border-t">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">
                      {new Date(certificate.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Certificate Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/verify/certificate/${certificate.certificateId}`);
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {t("dashboard.viewCertificate", "View Certificate")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {certificates.courses.length > 6 && (
        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => navigate("/profile?tab=certificates")}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
          >
            {t("dashboard.viewAllCertificates", "View All Certificates")}
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

CertificatesSection.propTypes = {
  certificates: PropTypes.shape({
    courses: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        certificateId: PropTypes.string,
        issueDate: PropTypes.string.isRequired,
        Course: PropTypes.shape({
          Title: PropTypes.string,
          Title_ar: PropTypes.string,
          Image: PropTypes.string,
        }),
      }),
    ),
  }),
};

export default CertificatesSection;
