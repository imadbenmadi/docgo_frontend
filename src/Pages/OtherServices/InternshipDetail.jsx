import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";
import { useAppContext } from "../../AppContext";
import RichTextDisplay from "../../components/Common/RichTextEditor/RichTextDisplay";
import { useTranslation } from "react-i18next";
import { buildApiUrl, introMediaUrl } from "../../utils/apiBaseUrl";
import FavoriteHeart from "../../components/Common/FavoriteHeart";
import { formatEuro, formatPrice } from "../../utils/money";
import AskQuestion from "../../components/contact/AskQuestion";

export default function InternshipDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { isAuth } = useAppContext();
  const [internship, setInternship] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [myApplication, setMyApplication] = useState(null);
  const [isCheckingApplication, setIsCheckingApplication] = useState(false);

  const isDashboardRoute = location.pathname
    .toLowerCase()
    .startsWith("/dashboard");
  const internshipsListPath = isDashboardRoute
    ? "/dashboard/internships"
    : "/other-services/internships";
  const myApplicationsPath = isDashboardRoute
    ? "/dashboard/service-applications"
    : "/other-services/my-applications";
  const selfPath = isDashboardRoute
    ? `/dashboard/internships/${id}`
    : `/other-services/internships/${id}`;

  // An accepted application on a paid internship still owes money, and until
  // now there was nowhere to pay it: the application was submitted, the row was
  // marked pending, and the screen said nothing more.
  const owesPayment = myApplication?.paymentStatus === "pending";
  const paymentPath = isDashboardRoute
    ? `/dashboard/payment/internship/${id}`
    : `/payment/internship/${id}`;

  const statusVariant = useMemo(() => {
    const status = myApplication?.status;
    if (status === "accepted") return "accepted";
    if (status === "rejected") return "rejected";
    if (status === "pending") return "pending";
    return null;
  }, [myApplication?.status]);

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/other-services/internships/${id}`,
        );
        setInternship(response.data.data);
      } catch {
        Swal.fire({
          icon: "error",
          title: t("error", "Error") || "Error",
          text:
            t(
              "internshipDetailPage.loadFailed",
              "Failed to load internship details",
            ) || "Failed to load internship details",
        });
        navigate(internshipsListPath);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternship();
  }, [id, navigate, t, internshipsListPath]);

  useEffect(() => {
    const fetchMyApplication = async () => {
      if (!isAuth || !id) {
        setMyApplication(null);
        setHasApplied(false);
        return;
      }

      try {
        setIsCheckingApplication(true);
        const res = await apiClient.get(
          "/other-services/my-internship-applications",
        );
        const apps = Array.isArray(res.data?.data) ? res.data.data : [];

        const found = apps.find((a) => {
          const internshipId = a?.internshipId ?? a?.Internship?.id;
          return String(internshipId) === String(id);
        });

        setMyApplication(found || null);
        setHasApplied(Boolean(found));
      } catch (error) {
        if (error?.response?.status === 401) {
          setMyApplication(null);
          setHasApplied(false);
          return;
        }

        Swal.fire({
          icon: "error",
          title: t("error", "Error") || "Error",
          text:
            t(
              "internshipDetailPage.checkApplicationFailed",
              "Failed to check your application status",
            ) || "Failed to check your application status",
        });
      } finally {
        setIsCheckingApplication(false);
      }
    };

    fetchMyApplication();
  }, [id, isAuth, t]);

  const handleApply = async () => {
    if (hasApplied) return;

    if (!isAuth) {
      Swal.fire({
        icon: "info",
        title:
          t("internshipDetailPage.loginRequiredTitle", "Login required") ||
          "Login required",
        text:
          t(
            "internshipDetailPage.loginRequiredText",
            "Please login to submit your internship application.",
          ) || "Please login to submit your internship application.",
      });
      navigate(`/login?next=${encodeURIComponent(selfPath)}`);
      return;
    }

    try {
      setIsSaving(true);
      const res = await apiClient.post(
        "/other-services/internship-application",
        {
          internshipId: id,
          content,
        },
      );

      Swal.fire({
        icon: "success",
        title:
          t("internshipDetailPage.success", "Success") ||
          t("cvServicePage.success", "Success") ||
          "Success",
        text:
          t(
            "internshipDetailPage.submitted",
            "Your application has been submitted successfully",
          ) || "Your application has been submitted successfully",
      });

      setMyApplication(res.data?.data || { status: "pending" });
      setHasApplied(true);
    } catch (error) {
      if (error.response?.status === 400) {
        Swal.fire({
          icon: "error",
          title:
            t("internshipDetailPage.alreadyAppliedTitle", "Already applied") ||
            "Already applied",
          text:
            t(
              "internshipDetailPage.alreadyAppliedText",
              "You have already applied to this internship",
            ) || "You have already applied to this internship",
        });

        setHasApplied(true);
        try {
          const listRes = await apiClient.get(
            "/other-services/my-internship-applications",
          );
          const apps = Array.isArray(listRes.data?.data)
            ? listRes.data.data
            : [];
          const found = apps.find(
            (a) => String(a?.internshipId ?? a?.Internship?.id) === String(id),
          );
          setMyApplication(found || null);
        } catch {
          // ignore
        }
      } else {
        Swal.fire({
          icon: "error",
          title: t("error", "Error") || "Error",
          text:
            error.response?.data?.message ||
            t(
              "internshipDetailPage.submitFailed",
              "Failed to submit application",
            ) ||
            "Failed to submit application",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        {t("internshipDetailPage.loading", "Loading internship details...") ||
          "Loading internship details..."}
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="p-8 text-center">
        {t("internshipDetailPage.notFound", "Internship not found") ||
          "Internship not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(internshipsListPath)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ←
            {t(
              "internshipDetailPage.backToInternships",
              "Back to Internships",
            ) || "Back to Internships"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Image */}
        {internship.introductoryImage && (
          <img
            src={buildApiUrl(internship.introductoryImage)}
            alt={internship.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}

        {/* Introductory video. An internship could always carry one - the
            admin form uploads it and the column stores it - but no screen ever
            showed it, so it went nowhere. */}
        {internship.introductoryVideo && (
          <div className="mb-8 overflow-hidden rounded-lg bg-black shadow-md">
            <video
              className="h-64 w-full object-contain"
              controls
              preload="metadata"
              poster={
                internship.introductoryImage
                  ? buildApiUrl(internship.introductoryImage)
                  : undefined
              }
              src={introMediaUrl("internship", id)}
            />
          </div>
        )}

        {/* Title and Meta */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-4xl font-bold text-gray-800">
              {internship.title}
            </h1>
            <FavoriteHeart
              item={{ ...internship, id }}
              type="internship"
              withLabel
              className="border border-gray-200 px-3"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm">
                {t("internshipDetailPage.company", "Company") || "Company"}
              </p>
              <p className="font-semibold">{internship.companyName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("internshipDetailPage.location", "Location") || "Location"}
              </p>
              <p className="font-semibold">{internship.location}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("internshipDetailPage.type", "Type") || "Type"}
              </p>
              <p className="font-semibold capitalize">{internship.type}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                {t("internshipDetailPage.payment", "Payment") || "Payment"}
              </p>
              <p className="font-semibold">
                {internship.isPaid && Number(internship.price) > 0 ? (
                  <>
                    {formatPrice(
                      internship.price,
                      internship.currency || "DZD",
                      i18n.language,
                    )}
                    {formatEuro(
                      internship.price,
                      internship.currency || "DZD",
                      i18n.language,
                    ) && (
                      <span className="ms-2 text-xs font-normal text-gray-500">
                        {formatEuro(
                          internship.price,
                          internship.currency || "DZD",
                          i18n.language,
                        )}
                      </span>
                    )}
                  </>
                ) : (
                  t("common.free", "Gratuit")
                )}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            {internship.startDate && (
              <p className="text-sm text-gray-600">
                {t("internshipDetailPage.start", "Start") || "Start"}:{" "}
                {new Date(internship.startDate).toLocaleDateString()}
              </p>
            )}
            {internship.applicationDeadline && (
              <p className="text-sm text-red-600 font-semibold">
                {t(
                  "internshipDetailPage.applicationDeadline",
                  "Application Deadline",
                ) || "Application Deadline"}
                :{" "}
                {new Date(internship.applicationDeadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("internshipDetailPage.description", "Description") ||
              "Description"}
          </h2>
          <RichTextDisplay
            content={internship.description}
            textClassName="prose max-w-none"
          />
        </div>

        {/* Requirements */}
        {internship.requirements && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {t("internshipDetailPage.requirements", "Requirements") ||
                "Requirements"}
            </h2>
            <RichTextDisplay
              content={internship.requirements}
              textClassName="prose max-w-none"
            />
          </div>
        )}

        {/* Contact */}
        {internship.contactEmail || internship.contactPhone ? (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {t(
                "internshipDetailPage.contactInformation",
                "Contact Information",
              ) || "Contact Information"}
            </h2>
            {internship.contactPerson && (
              <p className="mb-2">
                <span className="font-semibold">
                  {t("internshipDetailPage.contactPerson", "Contact Person") ||
                    "Contact Person"}
                  :
                </span>{" "}
                {internship.contactPerson}
              </p>
            )}
            {internship.contactEmail && (
              <p className="mb-2">
                <span className="font-semibold">
                  {t("internshipDetailPage.email", "Email") || "Email"}:
                </span>{" "}
                <a
                  href={`mailto:${internship.contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {internship.contactEmail}
                </a>
              </p>
            )}
            {internship.contactPhone && (
              <p>
                <span className="font-semibold">
                  {t("internshipDetailPage.phone", "Phone") || "Phone"}:
                </span>{" "}
                <a
                  href={`tel:${internship.contactPhone}`}
                  className="text-blue-600 hover:underline"
                >
                  {internship.contactPhone}
                </a>
              </p>
            )}
          </div>
        ) : null}

        {/* Application Section */}
        {isAuth && isCheckingApplication ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-600">
              {t(
                "internshipDetailPage.checkingStatus",
                "Checking your application status...",
              ) || "Checking your application status..."}
            </p>
          </div>
        ) : !hasApplied ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">
              {t(
                "internshipDetailPage.applyTitle",
                "Apply for This Internship",
              ) || "Apply for This Internship"}
            </h2>
            <p className="text-gray-600 mb-6">
              {t(
                "internshipDetailPage.applySubtitle",
                "Tell us why you're interested in this opportunity and why you'd be a great fit.",
              ) ||
                "Tell us why you're interested in this opportunity and why you'd be a great fit."}
            </p>

            <label className="block font-semibold mb-2">
              {t(
                "internshipDetailPage.applicationLetter",
                "Application Letter / Motivation",
              ) || "Application Letter / Motivation"}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder={
                t(
                  "internshipDetailPage.placeholder",
                  "Write your application here...",
                ) || "Write your application here..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[220px] mb-6"
            />

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => navigate(internshipsListPath)}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                {t("internshipDetailPage.cancel", "Cancel") || "Cancel"}
              </button>
              <button
                onClick={handleApply}
                disabled={isSaving}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400"
              >
                {isSaving
                  ? t("internshipDetailPage.submitting", "Submitting...") ||
                    "Submitting..."
                  : t("internshipDetailPage.submit", "Submit Application") ||
                    "Submit Application"}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-lg p-8 border-2 ${
              statusVariant === "accepted"
                ? "bg-green-50 border-green-300"
                : statusVariant === "rejected"
                  ? "bg-red-50 border-red-300"
                  : "bg-yellow-50 border-yellow-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-lg font-semibold">
                  {t(
                    "internshipDetailPage.alreadyAppliedBanner",
                    "You already applied to this internship",
                  ) || "You already applied to this internship"}
                </p>
                {isCheckingApplication ? (
                  <p className="text-sm text-gray-600 mt-1">
                    {t(
                      "internshipDetailPage.checkingStatus",
                      "Checking your application status...",
                    ) || "Checking your application status..."}
                  </p>
                ) : myApplication?.status ? (
                  <p className="text-sm text-gray-700 mt-1">
                    {t("internshipDetailPage.status", "Status") || "Status"}:{" "}
                    <span className="font-semibold">
                      {String(myApplication.status).toUpperCase()}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {owesPayment ? (
                  <button
                    onClick={() => navigate(paymentPath)}
                    className="px-4 py-2 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                  >
                    {t("internshipDetailPage.payNow", "Pay now") || "Pay now"}
                    {myApplication?.amountPaid
                      ? ` — ${internship?.currency || "DZD"} ${myApplication.amountPaid}`
                      : ""}
                  </button>
                ) : null}

                <button
                  onClick={() => navigate(myApplicationsPath)}
                  className="px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  {t(
                    "internshipDetailPage.goToMyApplications",
                    "Go to My Applications",
                  ) || "Go to My Applications"}
                </button>
              </div>
            </div>

            {owesPayment ? (
              <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-700">
                  {t(
                    "internshipDetailPage.paymentPending",
                    "This internship is paid. Your application is held until the payment is received and approved.",
                  ) ||
                    "This internship is paid. Your application is held until the payment is received and approved."}
                </p>
              </div>
            ) : null}

            {myApplication?.status === "rejected" &&
            myApplication?.rejectionReason ? (
              <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                <p className="font-semibold text-red-700 mb-1">
                  {t(
                    "internshipDetailPage.rejectionReason",
                    "Reason for rejection",
                  ) || "Reason for rejection"}
                  :
                </p>
                <p className="text-sm text-gray-700">
                  {myApplication.rejectionReason}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <AskQuestion context="internship" subjectType="internship" subjectId={id} />
    </div>
  );
}
