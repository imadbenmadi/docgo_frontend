import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "../Common/ImageWithFallback";

const PendingApplicationsSection = ({ applications }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Statuses that are visible in this section (pending/waiting + rejected so user can see outcome)
  const PENDING_STATUSES = ["pending", "opened", "rejected"];

  // Combine programs and courses applications — only truly pending ones
  const allApplications = [
    ...(applications.programs || []).map((app) => ({
      ...app,
      type: "program",
    })),
    ...(applications.courses || []).map((app) => ({
      ...app,
      type: "course",
    })),
  ]
    .filter((app) =>
      PENDING_STATUSES.includes(String(app.status || "").toLowerCase()),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!allApplications || allApplications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-amber-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("dashboard.noPendingApplications", "No Pending Applications")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t(
                "dashboard.noPendingApplicationsDescription",
                "Apply for courses and programs to start your journey!",
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/programs")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {t("dashboard.applyPrograms", "Apply for Programs")}
            </button>
            <button
              onClick={() => navigate("/courses")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
              {t("dashboard.applyCourses", "Apply for Courses")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
            {t("dashboard.pendingApplications", "Pending applications")}
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          {allApplications.length} {t("dashboard.applications", "applications")}
        </div>
      </div>

      <div className="space-y-4">
        {allApplications.map((application) => {
          const item =
            application.type === "program"
              ? application.applicationProgram || application.Program
              : application.applicationCourse || application.Course;

          return (
            <div
              key={`${application.type}-${application.id}`}
              className={`rounded-lg p-2 sm:p-3 md:p-4 hover:shadow-md transition-shadow border-l-4 ${
                application.status === "rejected"
                  ? "bg-red-50 border-red-400"
                  : "bg-amber-50 border-amber-400"
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                <ImageWithFallback
                  type={application.type === "program" ? "program" : "course"}
                  src={
                    item?.Image
                      ? `${import.meta.env.VITE_API_URL}${item.Image}`
                      : null
                  }
                  alt={item?.Title}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item?.title || item?.Title}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            application.type === "program"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {application.type === "program"
                            ? t("dashboard.program", "Program")
                            : t("dashboard.course", "Course")}
                        </span>
                        {application.type === "program" && (
                          <span>{item?.university}</span>
                        )}
                        {application.type === "course" && (
                          <span>{item?.Category}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "opened"
                            ? "bg-purple-100 text-purple-800"
                            : application.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {application.status === "pending" &&
                        t("dashboard.pending", "Pending")}
                      {application.status === "opened" &&
                        t("dashboard.opened", "Opened")}
                      {application.status === "rejected" &&
                        t("dashboard.rejected", "Rejected")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">
                        {t("dashboard.submittedOn", "Submitted on")}:
                      </span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {application.type === "program" &&
                      item?.applicationDeadline && (
                        <div>
                          <span className="text-gray-500">
                            {t("dashboard.deadline", "Deadline")}:
                          </span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {new Date(
                              item.applicationDeadline,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                    {application.type === "course" && item?.Price && (
                      <div>
                        <span className="text-gray-500">
                          {t("dashboard.price", "Price")}:
                        </span>
                        <span className="ml-2 text-blue-600 font-bold">
                          {item.Price} {item.Currency || "DZD"}
                        </span>
                      </div>
                    )}
                  </div>

                  {application.status === "rejected" ? (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 text-center font-medium">
                      {t(
                        "dashboard.applicationRejected",
                        "This application was rejected",
                      )}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>
                          {t(
                            "dashboard.applicationProgress",
                            "Application Progress",
                          )}
                        </span>
                        <span>
                          {application.status === "pending" ? "40%" : "10%"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            application.status === "pending"
                              ? "bg-yellow-500 w-2/5"
                              : "bg-purple-500 w-1/12"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      {allApplications.length > 5 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/my-applications")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t("dashboard.viewAllApplications", "View All Applications")}
            <svg
              className="w-4 h-4"
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

PendingApplicationsSection.propTypes = {
  applications: PropTypes.shape({
    programs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        applicationProgram: PropTypes.shape({
          Title: PropTypes.string,
          Image: PropTypes.string,
          university: PropTypes.string,
          applicationDeadline: PropTypes.string,
        }),
      }),
    ),
    courses: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        applicationCourse: PropTypes.shape({
          Title: PropTypes.string,
          Image: PropTypes.string,
          Category: PropTypes.string,
          Price: PropTypes.number,
          Currency: PropTypes.string,
        }),
      }),
    ),
  }),
};

export default PendingApplicationsSection;
