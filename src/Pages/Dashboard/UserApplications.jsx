import {
  AcademicCapIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PhotoIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { PaymentAPI } from "../../API/Payment";
import { useAppContext } from "../../AppContext";
import apiClient from "../../services/apiClient";
import ImageWithFallback from "../../components/Common/ImageWithFallback";

const UserApplications = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const { type } = useParams(); // 'programs' | 'courses' | undefined
  const [applications, setApplications] = useState({
    programs: [],
    courses: [],
  });

  // Maps: courseId → paymentHistory[], programId → paymentHistory[]
  const [coursePaymentMap, setCoursePaymentMap] = useState({});
  const [programPaymentMap, setProgramPaymentMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(type || "courses");

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    if (type) setActiveTab(type);
  }, [type]);

  const fetchApplications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch profile (enrollments + application status) AND payment history in parallel
      const [profileRes, courseAppsRes, programAppsRes] = await Promise.all([
        apiClient.get(`/Users/${user.id}/Profile`),
        apiClient
          .get("/Users/Courses/my-applications")
          .catch(() => ({ data: { success: false } })),
        apiClient
          .get("/Users/programs/my-applications")
          .catch(() => ({ data: { success: false } })),
      ]);

      // Build payment history lookup maps
      if (
        courseAppsRes.data?.success &&
        Array.isArray(courseAppsRes.data.data)
      ) {
        const map = {};
        courseAppsRes.data.data.forEach((app) => {
          if (app.paymentHistory?.length > 0)
            map[app.CourseId] = app.paymentHistory;
        });
        setCoursePaymentMap(map);
      }
      if (
        programAppsRes.data?.success &&
        Array.isArray(programAppsRes.data.data)
      ) {
        const map = {};
        programAppsRes.data.data.forEach((app) => {
          if (app.paymentHistory?.length > 0)
            map[app.ProgramId] = app.paymentHistory;
        });
        setProgramPaymentMap(map);
      }

      if (profileRes.data.success && profileRes.data.data) {
        const data = profileRes.data.data;

        const courseApps = data.applications?.courses || [];
        const courseEnrollments = data.enrollments?.courses || [];
        const allCourses = [...courseEnrollments, ...courseApps];

        const programApps = data.applications?.programs || [];
        const programEnrollments = data.enrollments?.programs || [];
        const enrolledProgramIds = new Set(
          programEnrollments.map((e) => e.ProgramId),
        );
        const deduplicatedApps = programApps.filter(
          (a) => !enrolledProgramIds.has(a.ProgramId),
        );
        const allPrograms = [...programEnrollments, ...deduplicatedApps];

        setApplications({ programs: allPrograms, courses: allCourses });
      } else {
        setApplications({ programs: [], courses: [] });
      }
    } catch (_error) {
      setApplications({ programs: [], courses: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user?.id]);

  const getStatusIcon = (status) => {
    if (!status) return <ClockIcon className="h-5 w-5 text-gray-400" />;

    switch (status.toLowerCase()) {
      case "approved":
      case "accepted":
      case "active":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "rejected":
      case "declined":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "pending":
      case "under_review":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
      case "approved":
      case "accepted":
      case "active":
        return "bg-green-100 text-green-800";
      case "rejected":
      case "declined":
        return "bg-red-100 text-red-800";
      case "pending":
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Always show both tabs
  const tabs = [
    {
      id: "courses",
      name: t("applications.courses", "Course Applications"),
      icon: DocumentTextIcon,
      count: applications.courses.length,
    },
    {
      id: "programs",
      name: t("applications.programs", "Program Applications"),
      icon: AcademicCapIcon,
      count: applications.programs.length,
    },
  ];

  const API_URL = import.meta.env.VITE_API_URL || "";

  const getScreenshotUrl = (payment) => {
    if (!payment) return null;
    if (payment.screenshot) return `${API_URL}${payment.screenshot}`;
    if (payment.screenShot) return `${API_URL}${payment.screenShot}`;
    return null;
  };

  const PaymentHistorySection = ({ paymentHistory }) => {
    if (!paymentHistory || paymentHistory.length === 0) return null;
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
          <PhotoIcon className="h-4 w-4 text-gray-400" />
          {t("applications.paymentHistory", "Payment History")}
        </h4>
        <div className="space-y-3">
          {paymentHistory.map((payment) => {
            const screenshotUrl = getScreenshotUrl(payment);
            const statusColor =
              payment.status === "approved"
                ? "bg-green-100 text-green-700"
                : payment.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : payment.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600";
            return (
              <div
                key={payment.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {screenshotUrl ? (
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <img
                      src={screenshotUrl}
                      alt="Payment screenshot"
                      className="w-16 h-16 object-cover rounded border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </a>
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    <PhotoIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}`}
                    >
                      {payment.status}
                    </span>
                    {payment.amount && (
                      <span className="text-xs text-gray-500">
                        {payment.amount} {payment.currency || "DZD"}
                      </span>
                    )}
                  </div>
                  {payment.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">
                      <span className="font-medium">Reason:</span>{" "}
                      {payment.rejectionReason}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ApplicationCard = ({ application, type, paymentHistory }) => {
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
      const checkPaymentStatus = async () => {
        const itemId =
          type === "program"
            ? application.ProgramId || application.Program?.id
            : application.CourseId || application.Course?.id;
        if (itemId && type) {
          const result = await PaymentAPI.checkPaymentApplication(type, itemId);
          if (result.success && result.data) {
            setPaymentStatus(result.data.status);
          }
        }
      };
      checkPaymentStatus();
    }, [application.id, type]);

    // Get the item using the same pattern as PendingApplicationsSection
    const item =
      type === "program"
        ? application.applicationProgram || application.Program
        : application.applicationCourse || application.Course;

    const title =
      item?.Title || item?.title || item?.Name || item?.name || "Untitled";
    const description =
      item?.Description || item?.description || item?.short_description || "";
    const imageUrl = item?.Image || item?.image || item?.thumbnail;

    // Use correct backend property names for status and enrollment
    const isEnrollment = !!(
      application.EnrolledAt ||
      application.enrollDate ||
      application.enrollmentDate
    );
    // Prefer 'status' (lowercase) for program applications, fallback to Status (uppercase) for others
    let displayStatus = application.status || application.Status || "Pending";

    if (paymentStatus) {
      if (paymentStatus === "approved") {
        displayStatus = "Active";
      } else if (paymentStatus === "pending") {
        displayStatus = "Pending";
      }
    } else if (
      isEnrollment ||
      ["approved", "accepted", "active"].includes(
        (displayStatus || "").toLowerCase(),
      )
    ) {
      displayStatus = "Active";
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4 flex-1">
              <ImageWithFallback
                type={type === "program" ? "program" : "course"}
                src={
                  imageUrl ? `${import.meta.env.VITE_API_URL}${imageUrl}` : null
                }
                alt={title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                {/* <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {description}
                </p> */}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {getStatusIcon(displayStatus)}
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  displayStatus,
                )}`}
              >
                {displayStatus}
              </span>
            </div>
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {isEnrollment
                  ? t("applications.enrolledOn", "Enrolled")
                  : t("applications.appliedOn", "Applied")}
                :{" "}
                {new Date(
                  application.createdAt || application.EnrolledAt,
                ).toLocaleDateString()}
              </span>
            </div>
            {application.ReviewedAt && (
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  {t("applications.reviewedOn", "Reviewed")}:{" "}
                  {new Date(application.ReviewedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Application Message */}
          {application.ApplicationMessage && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {t("applications.message", "Application Message")}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                {application.ApplicationMessage}
              </p>
            </div>
          )}

          {/* Admin Response */}
          {application.AdminResponse && (
            <div
              className={`mb-4 p-3 rounded-lg border-l-4 ${
                application.Status &&
                (application.Status.toLowerCase() === "approved" ||
                  application.Status.toLowerCase() === "accepted")
                  ? "bg-green-50 border-l-green-400"
                  : application.Status &&
                      (application.Status.toLowerCase() === "rejected" ||
                        application.Status.toLowerCase() === "declined")
                    ? "bg-red-50 border-l-red-400"
                    : "bg-yellow-50 border-l-yellow-400"
              }`}
            >
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {t("applications.adminResponse", "Admin Response")}
              </h4>
              <p className="text-sm text-gray-700">
                {application.AdminResponse}
              </p>
            </div>
          )}

          {/* Payment History with screenshots */}
          <PaymentHistorySection paymentHistory={paymentHistory} />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              {t("applications.applicationId", "Application ID")}:{" "}
              {application.id}
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={
                  type === "program"
                    ? `/programs/${
                        application.ProgramId || application.Program?.id
                      }`
                    : `/courses/${
                        application.CourseId || application.Course?.id
                      }`
                }
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                {t("applications.view", "View Details")}
              </Link>

              {(application.status || application.Status) &&
                (["approved", "accepted", "active"].includes(
                  (
                    application.status ||
                    application.Status ||
                    ""
                  ).toLowerCase(),
                ) ||
                  isEnrollment) && (
                  <Link
                    to={
                      type === "program"
                        ? `/Programs/${application.ProgramId}`
                        : String(
                              application.Course?.uploadType || "",
                            ).toLowerCase() === "zip"
                          ? `/Courses/${application.CourseId}/explore`
                          : `/Courses/${application.CourseId}/watch`
                    }
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    {type === "program"
                      ? t("applications.viewProgram", "View Program")
                      : String(
                            application.Course?.uploadType || "",
                          ).toLowerCase() === "zip"
                        ? t("exploreCourse", "Explore the course")
                        : t("applications.startCourse", "Start Course")}
                  </Link>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AcademicCapIcon className="h-7 w-7 text-blue-600 mr-3" />
              {type === "programs"
                ? t("applications.programTitle", "My Program Applications")
                : type === "courses"
                  ? t("applications.courseTitle", "My Course Applications")
                  : t("applications.title", "My Applications")}
            </h1>
            <p className="mt-1 text-gray-600">
              {type === "programs"
                ? t(
                    "applications.programSubtitle",
                    "Track your program applications and their status",
                  )
                : type === "courses"
                  ? t(
                      "applications.courseSubtitle",
                      "Track your course applications and their status",
                    )
                  : t(
                      "applications.subtitle",
                      "Track your course and program applications",
                    )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    className={`${isRTL ? "ml-2" : "mr-2"} h-5 w-5 ${
                      activeTab === tab.id
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              {t("applications.loading", "Loading applications...")}
            </p>
          </div>
        ) : (
          <>
            {activeTab === "programs" && (
              <div>
                {applications.programs.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t(
                        "applications.noProgramApplications",
                        "No program applications",
                      )}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t(
                        "applications.noProgramApplicationsText",
                        "You haven't applied to any programs yet.",
                      )}
                    </p>
                    <Link
                      to="/programs"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t("applications.browsePrograms", "Browse Programs")}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.programs.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        type="program"
                        paymentHistory={
                          programPaymentMap[application.ProgramId] || []
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "courses" && (
              <div>
                {applications.courses.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t(
                        "applications.noCourseApplications",
                        "No course applications",
                      )}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t(
                        "applications.noCourseApplicationsText",
                        "You haven't applied to any courses yet.",
                      )}
                    </p>
                    <Link
                      to="/courses"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t("applications.browseCourses", "Browse Courses")}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.courses.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        type="course"
                        paymentHistory={
                          coursePaymentMap[application.CourseId] || []
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserApplications;
