import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  MessageCircle,
  Send,
  Calendar,
  MapPinIcon,
  Building2,
  FileText,
  Eye,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import MainLoading from "../MainLoading";
import { useAppContext } from "../AppContext";
import apiClient from "../services/apiClient";
import RichTextDisplay from "../components/Common/RichTextEditor/RichTextDisplay";

const statusBadgeClass = (status) => {
  const base =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold";

  switch (String(status || "").toLowerCase()) {
    case "approved":
    case "completed":
    case "active":
      return `${base} bg-green-100 text-green-700`;
    case "rejected":
      return `${base} bg-red-100 text-red-700`;
    case "pending":
    case "opened":
      return `${base} bg-blue-100 text-blue-700`;
    default:
      return `${base} bg-yellow-100 text-yellow-700`;
  }
};

const StatusIcon = ({ status }) => {
  switch (String(status || "").toLowerCase()) {
    case "approved":
    case "completed":
    case "active":
      return <CheckCircle className="w-4 h-4" />;
    case "rejected":
      return <AlertCircle className="w-4 h-4" />;
    case "pending":
    case "opened":
      return <Clock className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ProgramApplicationStatus() {
  const { t, i18n } = useTranslation();
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user, contactInfo } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const programIdStr = String(programId || "");
  const isRTL = i18n.language === "ar";

  const loadStatus = async () => {
    if (!user?.id) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/Users/${user.id}/Profile`);
      const data = response.data?.data;

      const programApplications = data?.applications?.programs || [];
      const programEnrollments = data?.enrollments?.programs || [];

      let foundApplication = programApplications.find(
        (a) => String(a?.ProgramId) === programIdStr,
      );
      const foundEnrollment = programEnrollments.find(
        (e) => String(e?.ProgramId) === programIdStr,
      );

      // Profile currently filters out rejected applications on the backend.
      // Fallback to the dedicated endpoint so status pages still work.
      if (!foundApplication) {
        try {
          const appsResp = await apiClient.get(
            `/Users/programs/my-applications`,
          );
          const apps = appsResp.data?.data || [];
          foundApplication = apps.find(
            (a) => String(a?.ProgramId) === programIdStr,
          );
        } catch (e) {
          // ignore; page will render without application details
        }
      }

      // Ensure user has access (only show if they have an application or enrollment)
      if (!foundApplication && !foundEnrollment) {
        setAccessDenied(true);
      }

      setApplication(foundApplication || null);
      setEnrollment(foundEnrollment || null);
    } catch (error) {
      setApplication(null);
      setEnrollment(null);
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, programIdStr]);

  const program = useMemo(() => {
    return (
      application?.Program ||
      application?.Programs ||
      enrollment?.Program ||
      null
    );
  }, [application, enrollment]);

  const title = useMemo(() => {
    if (!program) return "";
    if (i18n.language === "ar" && (program.title_ar || program.Title_ar)) {
      return program.title_ar || program.Title_ar;
    }
    return program.title || program.Title || "";
  }, [program, i18n.language]);

  const description = useMemo(() => {
    if (!program) return "";
    if (
      i18n.language === "ar" &&
      (program.description_ar || program.Description_ar)
    ) {
      return program.description_ar || program.Description_ar;
    }
    return program.description || program.Description || "";
  }, [program, i18n.language]);

  if (loading) return <MainLoading />;

  if (accessDenied || (!application && !enrollment)) {
    return (
      <div
        className={`min-h-[70vh] flex items-center justify-center p-4 ${isRTL ? "rtl" : "ltr"}`}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t(
              "enrolledProgram.accessDenied",
              "Access Denied",
              "Access Denied",
            )}
          </h2>
          <p className="text-gray-600 mb-6">
            {t(
              "enrolledProgram.noEnrollment",
              "You are not enrolled in this program. Only enrolled users can access this page.",
              "You are not enrolled in this program. Only enrolled users can access this page.",
            )}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/programs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.browsePrograms", "Browse Programs")}
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t("common.backToDashboard", "Back to Dashboard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = application?.status || enrollment?.status || "unknown";
  const university =
    i18n.language === "ar" && program?.university_ar
      ? program.university_ar
      : program?.university;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back", "Back", "Back")}
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={loadStatus}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t("common.refresh", "Refresh", "Refresh")}
            </button>
            <button
              onClick={() =>
                navigate("/dashboard/messages/new", {
                  state: {
                    context: "program",
                    programId: programIdStr,
                    programTitle: title,
                  },
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              {t("common.message", "Message", "Message")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner with Program Image */}
        <div className="mb-8 relative rounded-2xl overflow-hidden bg-white shadow-lg">
          {program?.Image && (
            <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
              <img
                src={program.Image}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {title}
                  </h1>
                  {university && (
                    <p className="text-blue-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {university}
                    </p>
                  )}
                </div>
                <span className={statusBadgeClass(currentStatus)}>
                  <StatusIcon status={currentStatus} />
                  {String(currentStatus).charAt(0).toUpperCase() +
                    String(currentStatus).slice(1)}
                </span>
              </div>
            </div>
          )}

          {!program?.Image && (
            <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-blue-400 to-blue-600 flex items-end p-6 relative">
              <div className="absolute inset-0 opacity-10 bg-pattern" />
              <div className="relative z-10 w-full">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {title}
                </h1>
                {university && (
                  <p className="text-blue-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {university}
                  </p>
                )}
              </div>
              <span
                className={`${statusBadgeClass(currentStatus)} absolute top-6 right-6`}
              >
                <StatusIcon status={currentStatus} />
                {String(currentStatus).charAt(0).toUpperCase() +
                  String(currentStatus).slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Description */}
            {description && (
              <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  {t(
                    "enrolledProgram.description",
                    "About This Program",
                    "About This Program",
                  )}
                </h2>
                <RichTextDisplay
                  content={description}
                  className="prose max-w-none"
                  textClassName="text-gray-700 leading-relaxed"
                />
              </div>
            )}

            {/* Payment Screenshot - Only show if approved */}
            {(currentStatus === "approved" ||
              currentStatus === "completed" ||
              currentStatus === "active") &&
              application?.screenShot && (
                <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-green-600" />
                    {t(
                      "enrolledProgram.paymentProof",
                      "Payment Proof",
                      "Payment Proof",
                    )}
                  </h2>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {t(
                        "enrolledProgram.paymentAccepted",
                        "Payment accepted and verified",
                        "Payment accepted and verified",
                      )}
                    </p>
                  </div>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video max-h-96">
                    <img
                      src={`${process.env.REACT_APP_API_BASE_URL || ""}/media/stream/pdf/${application.screenShot}`}
                      alt={t(
                        "enrolledProgram.paymentReceipt",
                        "Payment Receipt",
                        "Payment Receipt",
                      )}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {!application.screenShot && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <FileText className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                  </div>
                  <a
                    href={`${process.env.REACT_APP_API_BASE_URL || ""}/payment-history/screenshot/${application.paymentId || application.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {t(
                      "enrolledProgram.viewFullImage",
                      "View Full Image",
                      "View Full Image",
                    )}
                  </a>
                </div>
              )}

            {/* Program Details Grid */}
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                {t(
                  "enrolledProgram.details",
                  "Program Details",
                  "Program Details",
                )}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {program?.programStartDate && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {t(
                        "enrolledProgram.startDate",
                        "Program Start Date",
                        "Program Start Date",
                      )}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {formatDateTime(program.programStartDate)}
                    </p>
                  </div>
                )}
                {program?.programEndDate && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {t(
                        "enrolledProgram.endDate",
                        "Program End Date",
                        "Program End Date",
                      )}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {formatDateTime(program.programEndDate)}
                    </p>
                  </div>
                )}
                {(program?.programCountry || program?.country) && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {t("country", "Country")}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {program?.programCountry || program?.country}
                    </p>
                  </div>
                )}
                {program?.Price !== null && program?.Price !== undefined && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {t(
                        "enrolledProgram.price",
                        "Program Price",
                        "Program Price",
                      )}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {program.Price} {program.currency || "DZD"}
                    </p>
                  </div>
                )}
                {application?.enrollDate && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {t(
                        "enrolledProgram.enrollmentDate",
                        "Enrollment Date",
                        "Enrollment Date",
                      )}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {formatDateTime(
                        application.enrollDate || enrollment?.enrollmentDate,
                      )}
                    </p>
                  </div>
                )}
                {application?.paymentType && (
                  <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-lg p-4 border border-rose-100">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {t(
                        "enrolledProgram.paymentMethod",
                        "Payment Method",
                        "Payment Method",
                      )}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-2 capitalize">
                      {application.paymentType === "ccp"
                        ? "CCP"
                        : String(application.paymentType)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Communication/Notes Section */}
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                {t(
                  "enrolledProgram.communication",
                  "Communication & Notes",
                  "Communication & Notes",
                )}
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                {application?.notes ? (
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {application.notes}
                  </p>
                ) : (
                  <p className="text-gray-600">
                    {t(
                      "enrolledProgram.noNotes",
                      "No messages yet. Contact support if you have questions.",
                      "No messages yet. Contact support if you have questions.",
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-600">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t(
                  "enrolledProgram.enrollmentStatus",
                  "Enrollment Status",
                  "Enrollment Status",
                )}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    {t("enrolledProgram.status", "Status", "Status")}
                  </label>
                  <div className="mt-2">
                    <span className={statusBadgeClass(currentStatus)}>
                      <StatusIcon status={currentStatus} />
                      {String(currentStatus).charAt(0).toUpperCase() +
                        String(currentStatus).slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t(
                  "enrolledProgram.quickActions",
                  "Quick Actions",
                  "Quick Actions",
                )}
              </h3>
              <div className="space-y-3">
                <Link
                  to="/dashboard/applications/program"
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
                >
                  {t(
                    "enrolledProgram.myApplications",
                    "My Applications",
                    "My Applications",
                  )}
                </Link>
                <Link
                  to="/dashboard/messages"
                  className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  {t(
                    "enrolledProgram.openMessages",
                    "Open Messages",
                    "Open Messages",
                  )}
                </Link>
                <Link
                  to={`/Programs/${programIdStr}`}
                  className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t(
                    "enrolledProgram.viewProgram",
                    "View Program",
                    "View Program",
                  )}
                </Link>
              </div>
            </div>

            {/* Contact Information */}
            {(() => {
              const hasContactData =
                contactInfo &&
                (contactInfo.email ||
                  contactInfo.phone ||
                  contactInfo.address ||
                  contactInfo.facebook ||
                  contactInfo.instagram ||
                  contactInfo.linkedin ||
                  contactInfo.youtube ||
                  contactInfo.twitter ||
                  contactInfo.whatsapp ||
                  contactInfo.telegram);
              return (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    {t(
                      "enrolledProgram.contactInfo",
                      "Contact Information",
                      "Contact Information",
                    )}
                  </h3>
                  {!hasContactData ? (
                    <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p>
                        {t(
                          "enrolledProgram.noContactInfo",
                          "For inquiries, use our messaging system.",
                          "For inquiries, use our messaging system.",
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contactInfo.email && (
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                        >
                          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-gray-700 truncate hover:text-gray-900">
                            {contactInfo.email}
                          </span>
                        </a>
                      )}
                      {contactInfo.phone && (
                        <a
                          href={`tel:${contactInfo.phone}`}
                          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                        >
                          <Phone className="w-5 h-5 text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-gray-700 hover:text-gray-900">
                            {contactInfo.phone}
                          </span>
                        </a>
                      )}
                      {contactInfo.address && (
                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            {contactInfo.address}
                          </span>
                        </div>
                      )}
                      {(contactInfo.facebook ||
                        contactInfo.instagram ||
                        contactInfo.linkedin ||
                        contactInfo.youtube ||
                        contactInfo.twitter ||
                        contactInfo.whatsapp ||
                        contactInfo.telegram) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-3">
                            {t(
                              "enrolledProgram.followUs",
                              "Follow Us",
                              "Follow Us",
                            )}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {contactInfo.facebook && (
                              <a
                                href={contactInfo.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                                title="Facebook"
                              >
                                <Facebook className="w-5 h-5" />
                              </a>
                            )}
                            {contactInfo.instagram && (
                              <a
                                href={contactInfo.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-pink-100 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition-colors"
                                title="Instagram"
                              >
                                <Instagram className="w-5 h-5" />
                              </a>
                            )}
                            {contactInfo.linkedin && (
                              <a
                                href={contactInfo.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition-colors"
                                title="LinkedIn"
                              >
                                <Linkedin className="w-5 h-5" />
                              </a>
                            )}
                            {contactInfo.youtube && (
                              <a
                                href={contactInfo.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                                title="YouTube"
                              >
                                <Youtube className="w-5 h-5" />
                              </a>
                            )}
                            {contactInfo.twitter && (
                              <a
                                href={contactInfo.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-sky-100 text-sky-600 rounded-full hover:bg-sky-600 hover:text-white transition-colors"
                                title="Twitter"
                              >
                                <Twitter className="w-5 h-5" />
                              </a>
                            )}
                            {contactInfo.whatsapp && (
                              <a
                                href={contactInfo.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-5 h-5" />
                              </a>
                            )}
                            {contactInfo.telegram && (
                              <a
                                href={contactInfo.telegram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-sky-100 text-sky-600 rounded-full hover:bg-sky-600 hover:text-white transition-colors"
                                title="Telegram"
                              >
                                <Send className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
