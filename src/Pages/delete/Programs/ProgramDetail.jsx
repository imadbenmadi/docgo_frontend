import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Users,
  Building2,
  PlayCircle,
  ExternalLink,
  Clock,
  FileText,
  Globe,
  Mail,
  Phone,
  Award,
  Download,
  Share2,
  BookmarkPlus,
  Eye,
} from "lucide-react";
import { clientProgramsAPI } from "../../../API/Programs";
import { useTranslation } from "react-i18next";
import InlineLoading from "../../../InlineLoading";
import { buildApiUrl } from "../../../utils/apiBaseUrl";
import { showSimpleSuccess } from "../../../utils/sweetAlertHelper";
import { getApiErrorMessage } from "../../../utils/apiErrorTranslate";

const resolveProgramMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;

  const value = String(mediaPath).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const normalized = value.replace(/^\/?public\/+?/i, "/");
  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;

  return buildApiUrl(withLeadingSlash);
};

const ProgramDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPrograms, setRelatedPrograms] = useState([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await clientProgramsAPI.getProgram(id);

      if (response.success) {
        setProgram(response.data.program);

        // Fetch related programs
        if (response.data.program?.Category) {
          const relatedResponse = await clientProgramsAPI.getPrograms({
            category: response.data.program.Category,
            limit: 3,
            excludeId: id,
          });

          if (relatedResponse.success) {
            setRelatedPrograms(relatedResponse.data.programs || []);
          }
        }
      } else {
        throw new Error(response.message || "Program not found");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t, t("error", "Error")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProgram();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return t("programs.notDefined", "Not defined");
    return new Date(dateString).toLocaleDateString(
      i18n.language === "ar" ? "ar-EG" : "fr-FR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      case "coming_soon":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return t("programs.status.open", "Open");
      case "closed":
        return t("programs.status.closed", "Closed");
      case "coming_soon":
        return t("programs.status.comingSoon", "Coming Soon");
      default:
        return status || t("programs.status.unknown", "Unknown Status");
    }
  };

  const handleApply = () => {
    if (program?.applicationLink) {
      window.open(program.applicationLink, "_blank");
    } else {
      // Redirect to application form or contact page
      navigate("/contact", {
        state: { programId: id, programTitle: program?.Title },
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title:
            i18n.language === "ar" && program?.Title_ar
              ? program.Title_ar
              : program?.Title,
          text:
            i18n.language === "ar" && program?.shortDescription_ar
              ? program.shortDescription_ar
              : program?.shortDescription,
          url: window.location.href,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showSimpleSuccess(t("programs.linkCopied", "Link copied to clipboard"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <InlineLoading />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || t("programs.notFound", "Program not found")}
          </h2>
          <button
            onClick={() => navigate("/programs")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {t("programs.backToPrograms", "Back to programs")}
          </button>
        </div>
      </div>
    );
  }

  const title =
    i18n.language === "ar" && program.Title_ar
      ? program.Title_ar
      : program.Title;
  const description =
    i18n.language === "ar" && program.Description_ar
      ? program.Description_ar
      : program.Description;
  const shortDescription =
    i18n.language === "ar" && program.shortDescription_ar
      ? program.shortDescription_ar
      : program.shortDescription;
  const requirements =
    i18n.language === "ar" && program.requirements_ar
      ? program.requirements_ar
      : program.requirements;
  const benefits =
    i18n.language === "ar" && program.benefits_ar
      ? program.benefits_ar
      : program.benefits;
  const university =
    i18n.language === "ar" && program.university_ar
      ? program.university_ar
      : program.university;
  const category =
    i18n.language === "ar" && program.Category_ar
      ? program.Category_ar
      : program.Category;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/programs")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("programs.backToPrograms", "Back to programs")}</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      program.status,
                    )}`}
                  >
                    {getStatusText(program.status)}
                  </span>

                  {program.isFeatured && (
                    <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {t("programs.featuredBadge", "Featured")}
                      </span>
                    </div>
                  )}

                  {category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {category}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {title}
                </h1>

                {shortDescription && (
                  <p className="text-xl text-gray-600 mb-6">
                    {shortDescription}
                  </p>
                )}

                {/* Quick Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {university && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-5 h-5" />
                      <span className="text-sm">{university}</span>
                    </div>
                  )}

                  {program.applicationDeadline && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">
                        {formatDate(program.applicationDeadline)}
                      </span>
                    </div>
                  )}

                  {program.Country && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm">{program.Country}</span>
                    </div>
                  )}

                  {program.Users_count > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">
                        {program.Users_count}{" "}
                        {t("programs.applicants", "applicants")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {program.status?.toLowerCase() === "open" && (
                    <button
                      onClick={handleApply}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>{t("programs.applyNow", "Apply Now")}</span>
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{t("programs.share", "Share")}</span>
                  </button>

                  <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <BookmarkPlus className="w-5 h-5" />
                    <span>{t("programs.save", "Save")}</span>
                  </button>
                </div>
              </div>

              {/* Program Image */}
              {program.Image && (
                <div className="relative mb-8 rounded-lg overflow-hidden">
                  <img
                    src={resolveProgramMediaUrl(program.Image)}
                    alt={title}
                    className="w-full h-64 sm:h-80 object-cover"
                  />

                  {/* Video Overlay */}
                  {program.videoUrl && (
                    <div
                      onClick={() => setIsVideoModalOpen(true)}
                      className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer hover:bg-opacity-50 transition-all"
                    >
                      <div className="bg-white rounded-full p-4 hover:scale-110 transition-transform">
                        <PlayCircle className="w-12 h-12 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Program Description */}
              {description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("programs.description", "Description")}
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: description,
                    }}
                  />
                </div>
              )}

              {/* Requirements */}
              {requirements && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("programs.requirements", "Requirements")}
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: requirements,
                    }}
                  />
                </div>
              )}

              {/* Benefits */}
              {benefits && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("programs.benefits", "Benefits")}
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: benefits,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t("programs.programInfo", "Program Information")}
                </h3>

                <div className="space-y-4">
                  {program.startDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("programs.startDate", "Start Date")}
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(program.startDate)}</span>
                      </div>
                    </div>
                  )}

                  {program.duration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("programs.duration", "Duration")}
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Clock className="w-4 h-4" />
                        <span>{program.duration}</span>
                      </div>
                    </div>
                  )}

                  {program.programType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("programs.type", "Type")}
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Award className="w-4 h-4" />
                        <span>{program.programType}</span>
                      </div>
                    </div>
                  )}

                  {program.contactEmail && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("programs.contact", "Contact")}
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${program.contactEmail}`}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {program.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {program.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("programs.website", "Website")}
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Globe className="w-4 h-4" />
                        <a
                          href={program.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {t("programs.visitWebsite", "Visit website")}
                        </a>
                      </div>
                    </div>
                  )}

                  {program.attachments && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("programs.attachments", "Attachments")}
                      </label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Download className="w-4 h-4" />
                        <a
                          href={resolveProgramMediaUrl(program.attachments)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {t("programs.downloadFiles", "Download files")}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>
                        {program.Views || 0} {t("programs.views", "views")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Programs */}
      {relatedPrograms.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {t("programs.relatedPrograms", "Similar Programs")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPrograms.map((relatedProgram) => (
              <div
                key={relatedProgram.id}
                onClick={() => navigate(`/programs/${relatedProgram.id}`)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              >
                <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-50">
                  {relatedProgram.Image ? (
                    <img
                      src={resolveProgramMediaUrl(relatedProgram.Image)}
                      alt={
                        i18n.language === "ar" && relatedProgram.Title_ar
                          ? relatedProgram.Title_ar
                          : relatedProgram.Title
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award className="w-8 h-8 text-blue-300" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {i18n.language === "ar" && relatedProgram.Title_ar
                      ? relatedProgram.Title_ar
                      : relatedProgram.Title}
                  </h3>

                  {(relatedProgram.shortDescription ||
                    relatedProgram.shortDescription_ar) && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {i18n.language === "ar" &&
                      relatedProgram.shortDescription_ar
                        ? relatedProgram.shortDescription_ar
                        : relatedProgram.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && program.videoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                À-
              </button>
            </div>
            <div className="p-4">
              <video
                src={resolveProgramMediaUrl(program.videoUrl || program.video)}
                controls
                className="w-full h-auto max-h-[60vh]"
              >
                {t(
                  "programs.videoNotSupported",
                  "Your browser does not support HTML5 video",
                )}
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramDetail;
