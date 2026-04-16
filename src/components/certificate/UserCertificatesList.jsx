import React, { useState, useEffect } from "react";
import {
  Download,
  Share2,
  ExternalLink,
  AlertCircle,
  Loader,
} from "lucide-react";
import apiClient from "../../utils/apiClient";

/**
 * ============================================================================
 * USER CERTIFICATES LIST COMPONENT
 * ============================================================================
 * Frontend component to display user's certificates
 * Shows all certificates earned by the user across all courses
 */

const UserCertificatesList = ({ userId }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserCertificates();
  }, [userId]);

  const fetchUserCertificates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/user/certificates");
      setCertificates(response.data.data || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setCertificates([]);
      } else {
        setError("Failed to load your certificates");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/user/certificates/${certificateId}/download`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch {
      alert("Failed to download certificate");
    }
  };

  const handleShare = (certificate) => {
    const verificationUrl =
      certificate.verificationUrl ||
      `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
    const text = `Check out my certificate for "${certificate.Course?.Title || "Course"}"`;

    if (navigator.share) {
      navigator.share({
        title: "My Certificate",
        text,
        url: verificationUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(verificationUrl);
      alert("Certificate link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading your certificates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Certificates Yet
        </h3>
        <p className="text-gray-600">
          Complete a course to earn your first certificate!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          {certificates.length} Certificate
          {certificates.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden border border-gray-200"
          >
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                {certificate.Course?.Title || "Certificate"}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Issued on{" "}
                {new Date(certificate.issuedDate).toLocaleDateString()}
              </p>
            </div>

            {/* Certificate Details */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Certificate ID:</span>
                <span className="text-sm font-mono text-gray-900">
                  {certificate.certificateId.slice(0, 12)}...
                </span>
              </div>

              {certificate.Course?.Category && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm text-gray-900">
                    {certificate.Course.Category}
                  </span>
                </div>
              )}

              {certificate.metadata?.completionScore && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {certificate.metadata.completionScore}%
                  </span>
                </div>
              )}

              {certificate.expiryDate && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Expires:</span>
                  <span>
                    {new Date(certificate.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 flex gap-2">
              <button
                onClick={() => handleDownload(certificate.id)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              <button
                onClick={() => handleShare(certificate)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium rounded-lg transition flex items-center justify-center gap-2"
                title="Share certificate"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {certificate.verificationUrl && (
                <a
                  href={certificate.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition flex items-center justify-center gap-2"
                  title="Verify"
                >
                  <ExternalLink className="w-4 h-4" />
                  Verify
                </a>
              )}
            </div>

            {/* Status */}
            {certificate.revoked && (
              <div className="bg-red-50 px-6 py-2 text-red-700 text-sm font-medium border-t border-red-200">
                ⚠️ This certificate has been revoked
                {certificate.revokeReason && ` - ${certificate.revokeReason}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserCertificatesList;
