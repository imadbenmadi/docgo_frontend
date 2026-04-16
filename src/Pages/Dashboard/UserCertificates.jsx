import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  StarIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { useAppContext } from "../../AppContext";
import { EnrollmentAPI } from "../../API/Enrollment";

const UserCertificates = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    if (user?.id) {
      fetchCertificates();
    }
  }, [user?.id]);
  useEffect(() => {}, [certificates]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await EnrollmentAPI.getMyCertificates();
      if (response?.success) {
        setCertificates(response.data || []);
      }
    } catch (error) {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCertificate = (certificate) => {
    const url =
      certificate.verificationUrl ||
      `${window.location.origin}/verify/certificate/${certificate.certificateId}`;
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificate.certCourse?.title}`,
        text: `I've completed ${certificate.certCourse?.title} and earned a certificate!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };
  const handleDownloadCertificate = async (certificateId, certificate) => {
    try {
      setDownloadingId(certificateId);
      // Navigate to the certificate page to download from there
      // window.open(`/verify/certificate/${certificateId}`, "_blank");
      window.open(
        `/Courses/${certificate.certCourse?.id}/watch/certificate`,
        "_blank",
      );
    } catch (error) {
    } finally {
      setDownloadingId(null);
    }
  };
  const CertificateCard = ({ certificate }) => {
    const course = certificate.certCourse || {};
    const meta = certificate.metadata || {};
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
        {/* Certificate Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <AcademicCapIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t("certificates.certificateOf", "Certificate of Completion")}
                </h3>
                <p className="text-blue-100 text-sm">{course.title}</p>
              </div>
            </div>
            <CheckCircleIcon className="h-6 w-6 text-green-300" />
          </div>
        </div>

        {/* Certificate Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {course.Category && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {course.Category}
                  </span>
                )}
                {course.Level && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {course.Level}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {course.Description ||
                  t(
                    "certificates.noDescription",
                    "Course description not available",
                  )}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {t("certificates.completed", "Completed")}:{" "}
                    {new Date(
                      meta.completionDate || certificate.issueDate,
                    ).toLocaleDateString()}
                  </span>
                </div>
                {meta.averageQuizScore != null && (
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {t("certificates.grade", "Grade")}:{" "}
                      {Math.round(meta.averageQuizScore)}%
                    </span>
                  </div>
                )}
              </div>

              {certificate.certificateId && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono break-all">
                  <strong>{t("certificates.number", "Certificate ID")}:</strong>{" "}
                  {certificate.certificateId}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 flex-wrap gap-2">
            <div className="text-xs text-gray-500">
              {t("certificates.issued", "Issued on")}{" "}
              {new Date(certificate.issueDate).toLocaleDateString()}
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-1">
              {course.id && (
                <Link
                  to={
                    String(course?.uploadType || "").toLowerCase() === "zip"
                      ? `/Courses/${course.id}/explore`
                      : `/Courses/${course.id}/watch`
                  }
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {t("certificates.viewCourse", "View Course")}
                </Link>
              )}

              <button
                onClick={() => handleShareCertificate(certificate)}
                className="inline-flex items-center px-3 py-1 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-sm"
              >
                <ShareIcon className="h-4 w-4 mr-1" />
                {t("certificates.share", "Share")}
              </button>

              <button
                onClick={() =>
                  handleDownloadCertificate(
                    certificate.certificateId,
                    certificate,
                  )
                }
                disabled={downloadingId === certificate.certificateId}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                {downloadingId === certificate.certificateId
                  ? t("certificates.downloading", "Opening...")
                  : t("certificates.download", "View")}
              </button>
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
              <DocumentTextIcon className="h-7 w-7 text-blue-600 mr-3" />
              {t("certificates.title", "My Certificates")}
            </h1>
            <p className="mt-1 text-gray-600">
              {t(
                "certificates.subtitle",
                "Your earned certificates and achievements",
              )}
            </p>
          </div>

          {certificates.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{certificates.length}</span>{" "}
              {t("certificates.totalCertificates", "certificates earned")}
            </div>
          )}
        </div>
      </div>

      {/* Certificates Grid */}
      <div>
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              {t("certificates.loading", "Loading certificates...")}
            </p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("certificates.noCertificates", "No certificates yet")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t(
                "certificates.noCertificatesText",
                "Complete courses to earn certificates and showcase your achievements.",
              )}
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <AcademicCapIcon className="h-4 w-4 mr-2" />
              {t("certificates.browseCourses", "Browse Courses")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCertificates;
