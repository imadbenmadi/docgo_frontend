import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Info, ShieldAlert } from "lucide-react";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";
import { useAppContext } from "../../AppContext";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";
import { buildApiUrl } from "../../utils/apiBaseUrl";

export default function CVService() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuth } = useAppContext();
  const [cvService, setCVService] = useState(null);
  const [currentApp, setCurrentApp] = useState(null);
  const [pendingApp, setPendingApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState("");
  const [hasExistingApp, setHasExistingApp] = useState(false);

  const isDashboardRoute = location.pathname
    .toLowerCase()
    .startsWith("/dashboard");
  const servicesHomePath = isDashboardRoute ? "/dashboard" : "/other-services";
  const myApplicationsPath = isDashboardRoute
    ? "/dashboard/service-applications"
    : "/other-services/my-applications";
  const cvSelfPath = isDashboardRoute ? "/dashboard/cv" : "/other-services/cv";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const serviceRes = await apiClient.get("/other-services/cv-service");
      setCVService(serviceRes.data.data);

      if (isAuth) {
        try {
          const appsRes = await apiClient.get(
            "/other-services/my-cv-applications",
          );
          const apps = Array.isArray(appsRes.data?.data)
            ? appsRes.data.data
            : [];

          const latest = apps[0] || null;
          const latestPending =
            apps.find((a) => a?.status === "pending") || null;

          setCurrentApp(latest);
          setPendingApp(latestPending);
          setHasExistingApp(Boolean(latestPending));
          setContent(latestPending?.content || "");
        } catch (err) {
          if (err.response?.status !== 404) {
            // ignore; user might not have an application yet
          }
          setCurrentApp(null);
          setPendingApp(null);
          setHasExistingApp(false);
          setContent("");
        }
      } else {
        setCurrentApp(null);
        setPendingApp(null);
        setHasExistingApp(false);
        setContent("");
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load CV service data",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (cvService && cvService.isActive === false) {
      Swal.fire({
        icon: "info",
        title:
          t("cvServicePage.serviceUnavailableTitle", "Service unavailable") ||
          "Service unavailable",
        text:
          t(
            "cvServicePage.serviceUnavailableText",
            "This service is currently unavailable. Please try again later.",
          ) || "This service is currently unavailable. Please try again later.",
      });
      return;
    }

    if (!isAuth) {
      Swal.fire({
        icon: "info",
        title:
          t("cvServicePage.loginRequired", "Login required") ||
          "Login required",
        text:
          t(
            "cvServicePage.loginRequiredText",
            "Please login to submit your CV application.",
          ) || "Please login to submit your CV application.",
      });
      navigate(`/login?next=${encodeURIComponent(cvSelfPath)}`);
      return;
    }

    if (!content.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("cvServicePage.required", "Required") || "Required",
        text:
          t("cvServicePage.requiredText", "Please fill in your CV content") ||
          "Please fill in your CV content",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiClient.post("/other-services/cv-application", {
        content,
        applicationId: pendingApp?.id,
      });

      Swal.fire({
        icon: "success",
        title: t("cvServicePage.success", "Success") || "Success",
        text: hasExistingApp
          ? t(
              "cvServicePage.updated",
              "Your CV application has been updated",
            ) || "Your CV application has been updated"
          : t(
              "cvServicePage.submitted",
              "Your CV application has been submitted successfully",
            ) || "Your CV application has been submitted successfully",
      });

      setCurrentApp(response.data.data);
      await fetchData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("cvServicePage.error", "Error") || "Error",
        text:
          error.response?.data?.message ||
          t("cvServicePage.submitFailed", "Failed to submit application") ||
          "Failed to submit application",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        {t("cvServicePage.loading", "Loading CV Service...") ||
          "Loading CV Service..."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(servicesHomePath)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ←{" "}
            {t("cvServicePage.back", "Back to Services") || "Back to Services"}
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {cvService?.title ||
                  t(
                    "cvServicePage.titleFallback",
                    "Professional CV Creation",
                  ) ||
                  "Professional CV Creation"}
              </h1>
              <p className="mt-2 text-gray-600">
                {t(
                  "cvServicePage.subtitle",
                  "Submit your information and our team will craft a professional CV for you.",
                ) ||
                  "Submit your information and our team will craft a professional CV for you."}
              </p>
            </div>

            {cvService?.isActive === false ? (
              <div className="inline-flex items-start gap-2 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 max-w-xl">
                <ShieldAlert className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    {t(
                      "cvServicePage.inactiveTitle",
                      "Service currently unavailable",
                    ) || "Service currently unavailable"}
                  </p>
                  <p className="text-sm text-amber-800">
                    {t(
                      "cvServicePage.inactiveText",
                      "You can view the details, but applications are temporarily disabled.",
                    ) ||
                      "You can view the details, but applications are temporarily disabled."}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Media */}
        {cvService?.introductoryImage || cvService?.introductoryVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {cvService?.introductoryImage ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-64 bg-gray-100">
                  <img
                    src={buildApiUrl(cvService.introductoryImage)}
                    alt={
                      t("cvServicePage.imageAlt", "CV Service") || "CV Service"
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : null}

            {cvService?.introductoryVideo ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-64 bg-gray-100">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    src={buildApiUrl(cvService.introductoryVideo)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Service Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t("cvServicePage.descriptionTitle", "Service Description") ||
                  "Service Description"}
              </h2>
              <p className="text-sm text-gray-600">
                {t(
                  "cvServicePage.descriptionSubtitle",
                  "Details configured by our team in the dashboard.",
                ) || "Details configured by our team in the dashboard."}
              </p>
            </div>
          </div>

          {cvService?.description && String(cvService.description).trim() ? (
            <RichTextDisplay
              content={cvService.description}
              textClassName="prose max-w-none"
            />
          ) : (
            <p className="text-gray-600">
              {t(
                "cvServicePage.descriptionFallback",
                "Our professional CV creation service helps you craft a compelling resume that stands out to employers. Share your information and let our experts create a polished, professional CV tailored to your industry.",
              ) ||
                "Our professional CV creation service helps you craft a compelling resume that stands out to employers. Share your information and let our experts create a polished, professional CV tailored to your industry."}
            </p>
          )}
        </div>

        {/* Application Status */}
        {currentApp && (
          <div
            className={`rounded-2xl shadow-sm border p-6 mb-8 ${
              currentApp.status === "accepted"
                ? "bg-green-50 border-green-200"
                : currentApp.status === "rejected"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h3 className="font-bold text-lg mb-2">
                {t("cvServicePage.appStatusTitle", "Application Status") ||
                  "Application Status"}
              </h3>

              <button
                onClick={() => navigate(myApplicationsPath)}
                className="px-4 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                {t(
                  "cvServicePage.goToMyApplications",
                  "Go to My Applications",
                ) || "Go to My Applications"}
              </button>
            </div>
            <p className="mb-2">
              {t("cvServicePage.status", "Status") || "Status"}:{" "}
              <span className="font-bold text-lg">
                {currentApp.status.toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              {t("cvServicePage.submittedOn", "Submitted on") || "Submitted on"}{" "}
              : {new Date(currentApp.submissionDate).toLocaleDateString()}
            </p>

            {currentApp.status === "accepted" && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-green-200">
                <p className="font-bold mb-2">
                  {t("cvServicePage.greatNews", "Great news!") || "Great news!"}
                </p>
                <p className="text-sm mb-3">
                  {t(
                    "cvServicePage.acceptedText",
                    "Your CV application has been accepted. Our team will contact you shortly to discuss the next steps.",
                  ) ||
                    "Your CV application has been accepted. Our team will contact you shortly to discuss the next steps."}
                </p>
                <p className="text-sm text-gray-600">
                  {t(
                    "cvServicePage.acceptedHint",
                    "Please check your email for contact information.",
                  ) || "Please check your email for contact information."}
                </p>
              </div>
            )}

            {currentApp.status === "rejected" && currentApp.rejectionReason && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-red-200">
                <p className="font-bold text-red-700 mb-2">
                  {t("cvServicePage.rejectionReason", "Reason for rejection") ||
                    "Reason for rejection"}
                  :
                </p>
                <p className="text-sm">{currentApp.rejectionReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {hasExistingApp
                  ? t(
                      "cvServicePage.formTitleUpdate",
                      "Update Your CV Application",
                    ) || "Update Your CV Application"
                  : t(
                      "cvServicePage.formTitleNew",
                      "Submit Your CV Application",
                    ) || "Submit Your CV Application"}
              </h2>
              <p className="text-gray-600">
                {t(
                  "cvServicePage.formSubtitle",
                  "Share your information and professional details. Our team will use this to create your CV.",
                ) ||
                  "Share your information and professional details. Our team will use this to create your CV."}
              </p>
            </div>
          </div>

          {cvService?.isActive === false ? (
            <p className="text-gray-600 p-4 bg-gray-50 rounded-xl">
              {t(
                "cvServicePage.disabledApply",
                "Applications are temporarily disabled.",
              ) || "Applications are temporarily disabled."}
            </p>
          ) : (
            <>
              <label className="block font-semibold mb-2">
                {t("cvServicePage.yourInfo", "Your Information") ||
                  "Your Information"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder={
                  t(
                    "cvServicePage.textPlaceholder",
                    "Write your information here...",
                  ) || "Write your information here..."
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[260px]"
              />

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => navigate(servicesHomePath)}
                  className="px-6 py-2 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  {t("cvServicePage.cancel", "Cancel") || "Cancel"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {isSaving
                    ? t("cvServicePage.submitting", "Submitting...") ||
                      "Submitting..."
                    : hasExistingApp
                      ? t("cvServicePage.update", "Update Application") ||
                        "Update Application"
                      : t("cvServicePage.submit", "Submit Application") ||
                        "Submit Application"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
