import {
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  BookOpen,
  Clock,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { EnrollmentAPI } from "../API/Enrollment";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [status, setStatus] = useState("loading"); // "loading" | "valid" | "revoked" | "invalid" | "error"
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    if (!certificateId) {
      setStatus("invalid");
      return;
    }
    EnrollmentAPI.verifyCertificate(certificateId)
      .then((res) => {
        const data = res?.data;
        if (!data?.success) {
          setStatus("error");
          return;
        }
        if (data.revoked) {
          setStatus("revoked");
          return;
        }
        if (data.valid) {
          setCertificate(data.certificate);
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("error"));
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">
              healthpathglobal Certificate Verification
            </span>
          </div>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Verifying certificate...</p>
          </div>
        )}

        {/* Valid */}
        {status === "valid" && certificate && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Green top banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Certificate Valid</h1>
              <p className="text-green-100 text-sm mt-1">
                This certificate is authentic and has been verified.
              </p>
            </div>

            {/* Certificate image preview */}
            {certificate.hasImage && (
              <div className="px-6 pt-6">
                <img
                  src={`${getApiBaseUrl()}/verify/certificate/${certificate.certificateId}/image`}
                  alt="Certificate"
                  className="w-full rounded-xl shadow-md border border-gray-100"
                  loading="lazy"
                />
              </div>
            )}

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Student
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {certificate.studentName}
                  </p>
                  {certificate.email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      {certificate.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Course
                  </p>
                  <p className="text-gray-800 font-semibold">
                    {certificate.courseTitle}
                  </p>
                  {certificate.category && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {certificate.category}{" "}
                      {certificate.level ? ` ${certificate.level}` : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      Issued
                    </p>
                    <p className="text-gray-700 text-sm font-medium">
                      {new Date(certificate.issueDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
                {certificate.courseDuration && (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                    <Clock className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="text-gray-700 text-sm font-medium">
                        {certificate.courseDuration}h
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {certificate.averageQuizScore != null && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="text-sm text-purple-700 font-medium">
                    Assessment Score
                  </span>
                  <span className="text-xl font-bold text-purple-700">
                    {Math.round(certificate.averageQuizScore)}%
                  </span>
                </div>
              )}

              {/* Certificate ID */}
              <div className="border-t border-dashed border-gray-200 pt-4 text-center">
                <p className="text-xs text-gray-400">Certificate ID</p>
                <p className="text-xs font-mono text-gray-500 break-all mt-0.5">
                  {certificate.certificateId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Revoked */}
        {status === "revoked" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center">
              <XCircle className="w-12 h-12 mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Certificate Revoked</h1>
              <p className="text-red-100 text-sm mt-1">
                This certificate has been revoked and is no longer valid.
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </div>
        )}

        {/* Invalid / Not found */}
        {(status === "invalid" || status === "error") && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
              <h1 className="text-2xl font-bold">Certificate Not Found</h1>
              <p className="text-amber-100 text-sm mt-1">
                We could not find a certificate with this ID.
              </p>
            </div>
            <div className="p-6 text-center space-y-2">
              <p className="text-gray-500 text-sm">
                Make sure you are using the correct verification link from the
                certificate.
              </p>
              <p className="text-xs font-mono text-gray-400 break-all">
                {certificateId}
              </p>
            </div>
          </div>
        )}

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Return to healthpathglobal
          </Link>
        </div>
      </div>
    </div>
  );
}
