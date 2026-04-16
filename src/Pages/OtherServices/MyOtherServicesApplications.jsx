import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";

// Status badge component
const StatusBadge = ({ status, t }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    pending: t("status_pending", "Pending Review"),
    accepted: t("status_accepted", "Accepted"),
    rejected: t("status_rejected", "Rejected"),
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
};

const MyOtherServicesApplications = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [cvApplications, setCvApplications] = useState([]);
  const [internshipApplications, setInternshipApplications] = useState([]);
  const [expandedCvApp, setExpandedCvApp] = useState(null);
  const [expandedInternshipApp, setExpandedInternshipApp] = useState(null);
  const [error, setError] = useState(null);

  const isDashboardRoute = location.pathname
    .toLowerCase()
    .startsWith("/dashboard");

  const navPaths = useMemo(() => {
    const servicesHomePath = isDashboardRoute
      ? "/dashboard"
      : "/other-services";
    const cvPath = isDashboardRoute ? "/dashboard/cv" : "/other-services/cv";
    const internshipsPath = isDashboardRoute
      ? "/dashboard/internships"
      : "/other-services/internships";
    const internshipDetailPath = (internshipId) =>
      `${internshipsPath}/${internshipId}`;
    return { servicesHomePath, cvPath, internshipsPath, internshipDetailPath };
  }, [isDashboardRoute]);

  // Fetch user's CV applications (history)
  const fetchCVApplications = async () => {
    try {
      const response = await apiClient.get(
        "/other-services/my-cv-applications",
      );
      if (response.data.success && response.data.data) {
        setCvApplications(response.data.data);
      } else {
        setCvApplications([]);
      }
    } catch (err) {
      // Not an error if no application exists yet
      setCvApplications([]);
    }
  };

  // Fetch user's internship applications
  const fetchInternshipApplications = async () => {
    try {
      const response = await apiClient.get(
        "/other-services/my-internship-applications",
      );
      if (response.data.success && response.data.data) {
        setInternshipApplications(response.data.data);
      }
    } catch {
      setError(t("error_loading_applications", "Error loading applications"));
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCVApplications(), fetchInternshipApplications()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">
              {t("loading", "Loading your applications...")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("my_applications", "My Applications")}
          </h1>
          <p className="text-gray-600">
            {t(
              "view_track_applications",
              "View and track your CV and internship applications here",
            )}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* CV Application Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("cv_professional_creation", "Professional CV Creation")}
          </h2>

          {cvApplications.length > 0 ? (
            <div className="space-y-4">
              {cvApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                    setExpandedCvApp(expandedCvApp === app.id ? null : app.id)
                  }
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t("cv_application_submitted", "CV Application")}
                        </h3>
                        <StatusBadge status={app.status} t={t} />
                      </div>
                      <p className="text-sm text-gray-600">
                        {t("submitted_on", "Submitted on")}:{" "}
                        {new Date(app.submissionDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-sm text-primary-600 font-semibold">
                      {expandedCvApp === app.id
                        ? t("collapse", "Collapse")
                        : t("view_details", "View Details")}
                    </div>
                  </div>

                  {expandedCvApp === app.id && (
                    <div className="mt-4 space-y-4">
                      {/* CV Content Preview */}
                      <div className="p-4 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          {t("cv_content", "CV Content")}:
                        </p>
                        <div className="prose prose-sm max-w-none text-gray-700">
                          {app.content ? (
                            <RichTextDisplay
                              content={app.content}
                              textClassName="prose prose-sm max-w-none"
                            />
                          ) : (
                            <p className="text-gray-500 italic">
                              {t("no_content", "No content")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Rejection Reason if applicable */}
                      {app.status === "rejected" && app.rejectionReason && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-semibold text-red-800 mb-2">
                            {t("rejection_reason", "Rejection Reason")}:
                          </p>
                          <p className="text-red-700">{app.rejectionReason}</p>
                        </div>
                      )}

                      {/* Admin Contact Info if Accepted */}
                      {app.status === "accepted" && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm font-semibold text-green-800 mb-2">
                            {t("congratulations", "Congratulations!")}
                          </p>
                          <p className="text-green-700 mb-3">
                            {t(
                              "cv_accepted_message",
                              "Your CV application has been accepted. Our team will contact you with next steps.",
                            )}
                          </p>
                          {app.reviewedDate ? (
                            <p className="text-xs text-green-600">
                              {t("review_date", "Reviewed on")}:{" "}
                              {new Date(app.reviewedDate).toLocaleDateString()}
                            </p>
                          ) : null}
                        </div>
                      )}

                      {/* Notes if accepted */}
                      {app.status === "accepted" && app.notes && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-semibold text-blue-800 mb-2">
                            {t("admin_notes", "Admin Notes")}:
                          </p>
                          <p className="text-blue-700">{app.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {app.status === "pending" && (
                          <Link
                            to={navPaths.cvPath}
                            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            {t("edit_application", "Edit Application")}
                          </Link>
                        )}
                        <Link
                          to={navPaths.servicesHomePath}
                          className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          {t("back", "Back")}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">
                {t(
                  "no_cv_application",
                  "You haven't submitted a CV application yet.",
                )}
              </p>
              <Link
                to={navPaths.cvPath}
                className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t("submit_cv_application", "Submit CV Application")}
              </Link>
            </div>
          )}
        </section>

        {/* Internship Applications Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("internship_applications", "Internship Applications")}
          </h2>

          {internshipApplications.length > 0 ? (
            <div className="space-y-4">
              {internshipApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                    setExpandedInternshipApp(
                      expandedInternshipApp === app.id ? null : app.id,
                    )
                  }
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 break-words">
                          {app.Internship?.title ||
                            t("internship", "Internship")}
                        </h3>
                        <StatusBadge status={app.status} t={t} />
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          {t("company", "Company")}:{" "}
                          <span className="font-medium">
                            {app.Internship?.companyName || "—"}
                          </span>
                        </p>
                        <p>
                          {t("location", "Location")}:{" "}
                          <span className="font-medium">
                            {app.Internship?.location || "—"}
                          </span>
                        </p>
                        <p>
                          {t("applied_on", "Applied on")}:{" "}
                          {new Date(app.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {expandedInternshipApp === app.id ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedInternshipApp === app.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                      {/* Application Content */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          {t("your_application", "Your Application")}:
                        </p>
                        <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-3 rounded">
                          {app.content ? (
                            <RichTextDisplay
                              content={app.content}
                              textClassName="prose prose-sm max-w-none"
                            />
                          ) : (
                            <p className="text-gray-500 italic">
                              {t("no_content", "No content")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Internship Info */}
                      {app.Internship && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            {t("internship_details", "Internship Details")}:
                          </p>
                          <div className="bg-gray-50 p-3 rounded space-y-2">
                            <p>
                              <span className="font-medium">
                                {t("type", "Type")}:
                              </span>{" "}
                              {app.Internship.type === "work"
                                ? t("work", "Work")
                                : t("study", "Study")}
                            </p>
                            <p>
                              <span className="font-medium">
                                {t("duration", "Duration")}:
                              </span>{" "}
                              {new Date(
                                app.Internship.startDate,
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                app.Internship.endDate,
                              ).toLocaleDateString()}
                            </p>
                            {app.Internship.isPaid && (
                              <p>
                                <span className="font-medium">
                                  {t("compensation", "Compensation")}:
                                </span>{" "}
                                {app.Internship.price} {app.Internship.currency}
                                /{t("month", "month")}
                              </p>
                            )}
                            {app.Internship.contactEmail && (
                              <p>
                                <span className="font-medium">
                                  {t("contact_email", "Contact")}:
                                </span>{" "}
                                <a
                                  href={`mailto:${app.Internship.contactEmail}`}
                                  className="text-primary-600 hover:underline"
                                >
                                  {app.Internship.contactEmail}
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason if applicable */}
                      {app.status === "rejected" && app.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-semibold text-red-800 mb-2">
                            {t("rejection_reason", "Rejection Reason")}:
                          </p>
                          <p className="text-red-700">{app.rejectionReason}</p>
                        </div>
                      )}

                      {/* Status with review date */}
                      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded">
                        <span>
                          {app.reviewedDate
                            ? `${t("reviewed_on", "Reviewed on")}: ${new Date(
                                app.reviewedDate,
                              ).toLocaleDateString()}`
                            : t("pending_review", "Pending review")}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-3 pt-3">
                        <Link
                          to={navPaths.internshipDetailPath(app.internshipId)}
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          {t("view_internship", "View Internship")}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 mb-4">
                {t(
                  "no_internship_applications",
                  "You haven't applied to any internships yet.",
                )}
              </p>
              <Link
                to={navPaths.internshipsPath}
                className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t("browse_internships", "Browse Internships")}
              </Link>
            </div>
          )}
        </section>

        {/* Summary Stats */}
        {(cvApplications.length > 0 || internshipApplications.length > 0) && (
          <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-primary-600">
                {cvApplications.length}
              </div>
              <div className="text-sm text-gray-600">
                {t("cv_applications", "CV Applications")}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {internshipApplications.length}
              </div>
              <div className="text-sm text-gray-600">
                {t("internship_applications_count", "Internship Applications")}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {cvApplications.filter((a) => a?.status === "accepted").length +
                  internshipApplications.filter((a) => a.status === "accepted")
                    .length}
              </div>
              <div className="text-sm text-gray-600">
                {t("accepted_applications", "Accepted")}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MyOtherServicesApplications;
