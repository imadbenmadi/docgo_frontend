import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaBook,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaFilter,
  FaGraduationCap,
  FaSpinner,
  FaTimesCircle,
  FaCommentAlt,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../AppContext";
import apiClient from "../utils/apiClient";
import ContactForm from "../components/contact/ContactForm";

const MyApplications = () => {
  const { t } = useTranslation("", { keyPrefix: "myApplications" });
  const navigate = useNavigate();
  const { isAuth, user } = useAppContext();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [typeFilter, setTypeFilter] = useState("all"); // all, course, program

  // Contact support modal
  const [contactModalData, setContactModalData] = useState(null); // { context, courseId, programId, title }

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
      return;
    }
    fetchApplications();
  }, [isAuth, navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/enrollment/my-applications");

      if (response.data.success) {
        setApplications(response.data.data.applications || []);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch applications",
        );
      }
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "approved":
        return <FaCheckCircle className="text-green-500" />;
      case "rejected":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredApplications = applications.filter((app) => {
    const statusMatch = filter === "all" || app.status === filter;
    const typeMatch =
      typeFilter === "all" ||
      (typeFilter === "course" && app.Course) ||
      (typeFilter === "program" && app.Program);
    return statusMatch && typeMatch;
  });

  const handleViewItem = (application) => {
    if (application.Course) {
      navigate(`/Courses/${application.CourseId}`);
    } else if (application.Program) {
      navigate(`/Programs/${application.ProgramId}`);
    }
  };

  const openContactSupport = (application) => {
    const item = application.Course || application.Program;
    const itemType = application.Course ? "course" : "program";
    setContactModalData({
      context: "application",
      courseId: application.Course ? application.CourseId : null,
      programId: application.Program ? application.ProgramId : null,
      title:
        item?.title ||
        item?.Title ||
        (itemType === "course" ? "Course" : "Program"),
      itemType,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Applications
              </h1>
              <p className="text-gray-600 mt-1">
                Track your course and program applications
              </p>
            </div>
            <button
              onClick={fetchApplications}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaSpinner className="text-sm" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filter by:
              </span>
            </div>

            {/* Status Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="program">Programs</option>
            </select>

            <div className="ml-auto text-sm text-gray-600">
              {filteredApplications.length} of {applications.length}{" "}
              applications
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Applications Found
            </h3>
            <p className="text-gray-600 mb-6">
              {applications.length === 0
                ? "You haven't applied to any courses or programs yet."
                : "No applications match your current filters."}
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const item = application.Course || application.Program;
              const itemType = application.Course ? "course" : "program";
              const itemTitle = item?.title || item?.Title;

              return (
                <div
                  key={`${itemType}-${application.id}`}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Item Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {itemType === "course" ? (
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaBook className="text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FaGraduationCap className="text-purple-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {itemTitle}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                              {itemType}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(application.status)}
                              <span>
                                Applied: {formatDate(application.createdAt)}
                              </span>
                            </div>

                            {application.paymentType && (
                              <div>
                                Payment:{" "}
                                <span className="capitalize">
                                  {application.paymentType}
                                </span>
                              </div>
                            )}

                            {application.enrollDate && (
                              <div className="text-green-600">
                                Enrolled: {formatDate(application.enrollDate)}
                              </div>
                            )}
                          </div>

                          {application.notes && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              "{application.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center gap-3">
                        <span className={getStatusBadge(application.status)}>
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </span>

                        <button
                          onClick={() => handleViewItem(application)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title={`View ${itemType}`}
                        >
                          <FaEye />
                        </button>

                        <button
                          onClick={() => openContactSupport(application)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Contact Support"
                        >
                          <FaCommentAlt />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Support Modal */}
      {contactModalData && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setContactModalData(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Contacter le support
              </h3>
              <button
                onClick={() => setContactModalData(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <div className="px-6 pb-6 pt-4">
              <p className="text-sm text-gray-500 mb-1">
                Concernant votre candidature :{" "}
                <span className="font-medium text-gray-800">
                  {contactModalData.title}
                </span>
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Ce message sera marqué comme support candidature.
              </p>
              <ContactForm
                context="application"
                courseId={contactModalData.courseId}
                programId={contactModalData.programId}
                showTitle={false}
                onSuccess={() => setContactModalData(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
