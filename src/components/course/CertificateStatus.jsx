import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader, Download } from "lucide-react";
import apiClient from "../../utils/apiClient";

/**
 * ============================================================================
 * CERTIFICATE STATUS COMPONENT
 * ============================================================================
 * Frontend component to display certificate availability for a course
 * Shows on course detail pages when course has certificate enabled
 */

const CertificateStatus = ({ courseId, isCompleted, userId }) => {
  const [status, setStatus] = useState("loading"); // loading, available, unavailable, error
  const [template, setTemplate] = useState(null);
  const [userCertificate, setUserCertificate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkCertificateStatus();
  }, [courseId]);

  const checkCertificateStatus = async () => {
    try {
      setStatus("loading");

      // Fetch template for this course
      const templateResponse = await apiClient.get(
        `/certificate-templates/public/for-course/${courseId}`,
      );

      if (!templateResponse.data.data) {
        setStatus("unavailable");
        setTemplate(null);
        setError(
          "Certificate template not yet available. Please check back later.",
        );
        return;
      }

      setTemplate(templateResponse.data.data);
      setStatus("available");

      // If user is completed and logged in, check for issued certificate
      if (isCompleted && userId) {
        try {
          const certResponse = await apiClient.get(
            `/user/certificates/course/${courseId}`,
          );
          if (certResponse.data.data) {
            setUserCertificate(certResponse.data.data);
          }
        } catch {
          // Certificate might not be issued yet
        }
      }
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.error || "Failed to load certificate");
    }
  };

  if (status === "loading") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Loader className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-blue-700">Checking certificate status...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div>
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-yellow-800 font-medium">
            Certificate Not Yet Available
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            The instructor is still preparing the certificate template for this
            course. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Available
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-green-800 font-medium mb-2">
            Certificate Available
          </p>
          <p className="text-green-700 text-sm mb-4">
            Upon completion of this course, you will receive a certificate of
            achievement.
          </p>

          {/* Show certificate if user completed it */}
          {isCompleted && userCertificate ? (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-300">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">
                Your certificate has been issued!
              </span>
              <button className="ml-auto px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition flex items-center gap-1">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ) : isCompleted ? (
            <div className="bg-green-100 rounded p-2 text-sm text-green-800">
              Your certificate is being prepared. Check back soon!
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CertificateStatus;
