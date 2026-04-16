import {
  ArrowLeft,
  Clock,
  GraduationCap,
  Heart,
  MessageSquare,
  PlayCircle,
  Send,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { IoMdRefresh } from "react-icons/io";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../AppContext";
import { useProgram } from "../hooks/useProgram";
import MainLoading from "../MainLoading";
import apiClient from "../utils/apiClient";
import Seo from "../components/SEO/Seo";
import { getApiErrorMessage } from "../utils/apiErrorTranslate";
import { useEffect } from "react";
import { buildApiUrl, getApiBaseUrl } from "../utils/apiBaseUrl";
// Import component parts
import ProgramContent from "../components/Program/ProgramContent";
import ProgramFAQSection from "../components/Program/ProgramFAQSection";
import ProgramReviews from "../components/Program/ProgramReviews";
import ImageWithFallback from "../components/Common/ImageWithFallback";
import VideoPlayer from "../components/Common/VideoPlayer";
import CoursePaymentButton from "../components/PaymentHistory/CoursePaymentButton";
import reviewsAPI from "../API/Reviews";

export const ProgramDetails = () => {
  const { t, i18n } = useTranslation("", { keyPrefix: "programs" });
  const { t: tGlobal } = useTranslation(); // global keys (common.*, apiErrors.*)
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const location = useLocation();

  const [showVideo, setShowVideo] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    name: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const {
    programData,
    loading,
    applying,
    refetching,
    error,
    hasError,
    retry,
    handleApplyClick,
    hasApplied,
    applicationStatus,
    isFree,
    programPrice,
    currency,
    hasData,
    paymentStatus,
  } = useProgram(programId);
  const [applied, setApplied] = useState(hasApplied);
  const [programReviews, setProgramReviews] = useState([]);
  const [userProgramReview, setUserProgramReview] = useState(null);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState(null);

  // ===== ALL HOOKS MUST BE CALLED UNCONDITIONALLY BEFORE ANY EARLY RETURNS =====

  // Fetch reviews
  useEffect(() => {
    if (!programId) return;
    reviewsAPI
      .getProgramReviews(programId)
      .then((res) => {
        const reviews = res.data.reviews || [];
        setProgramReviews(reviews);
        if (user?.id) {
          const mine = reviews.find(
            (r) => r.UserId === user.id || r.user?.id === user.id,
          );
          if (mine) setUserProgramReview(mine);
        }
      })
      .catch(() => {});
  }, [programId, user?.id]);

  // Resolve video URL - must be called unconditionally
  useEffect(() => {
    let isActive = true;

    const resolveProgramVideoUrl = async () => {
      // Only proceed if we have data
      if (!hasData || !programData?.program) {
        if (isActive) setResolvedVideoUrl(null);
        return;
      }

      const videoUrl =
        programData.program.videoUrl ||
        programData.program.videos?.[0]?.videoUrl;

      if (!videoUrl) {
        if (isActive) setResolvedVideoUrl(null);
        return;
      }

      if (String(videoUrl).startsWith("http")) {
        if (isActive) setResolvedVideoUrl(videoUrl);
        return;
      }

      const normalizedPath = String(videoUrl).trim();
      const filename = normalizedPath
        .split("?")[0]
        .split("#")[0]
        .split("/")
        .filter(Boolean)
        .pop();

      if (!filename) {
        if (isActive) setResolvedVideoUrl(buildApiUrl(normalizedPath));
        return;
      }

      const requiresProtectedStream =
        normalizedPath.startsWith("/Courses_Videos/");

      if (!requiresProtectedStream) {
        if (isActive) setResolvedVideoUrl(buildApiUrl(normalizedPath));
        return;
      }

      try {
        const response = await apiClient.get(
          `/media/signed-url/video/${filename}`,
        );
        if (isActive) {
          setResolvedVideoUrl(
            response.data?.url ||
              `${getApiBaseUrl()}/media/stream/video/${encodeURIComponent(filename)}`,
          );
        }
      } catch {
        if (isActive) {
          setResolvedVideoUrl(
            `${getApiBaseUrl()}/media/stream/video/${encodeURIComponent(filename)}`,
          );
        }
      }
    };

    resolveProgramVideoUrl();

    return () => {
      isActive = false;
    };
  }, [hasData, programData]);

  const formatCurrency = (amount, currencyCode) => {
    if (!amount || parseFloat(amount) === 0) return t("Free", "Free") || "Free";
    return new Intl.NumberFormat(i18n.language === "ar" ? "ar-DZ" : "en-US", {
      style: "currency",
      currency: currencyCode || "DZD",
    }).format(amount);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactForm.subject || !contactForm.message) {
      toast.error(tGlobal("common.fillAllFields"));
      return;
    }

    if (!user && (!contactForm.name || !contactForm.email)) {
      toast.error(tGlobal("common.fillAllFields"));
      return;
    }

    try {
      setIsSubmittingContact(true);

      const requestData = {
        subject: contactForm.subject,
        message: contactForm.message,
        programId: programId,
        programTitle: programData?.program?.Title || "Program",
        ...(user
          ? {
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`,
              userEmail: user.email,
            }
          : {
              name: contactForm.name,
              email: contactForm.email,
            }),
      };

      const response = await apiClient.post("/contact", requestData);

      if (response.status === 200) {
        toast.success(tGlobal("common.messageSentSuccess"));
        setShowContactForm(false);
        setContactForm({
          subject: "",
          message: "",
          name: user ? `${user.firstName} ${user.lastName}` : "",
          email: user?.email || "",
        });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, tGlobal));
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: programData?.program?.Title || "Program",
      text:
        programData?.program?.shortDescription ||
        "Check out this amazing program!",
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => {
            toast.success(tGlobal("common.linkCopied"));
          })
          .catch(() => {
            toast.error(tGlobal("common.linkCopyFailed"));
          });
      }
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          toast.success(tGlobal("common.linkCopied"));
        })
        .catch(() => {
          toast.error(tGlobal("common.linkCopyFailed"));
        });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(
      isFavorite
        ? tGlobal("common.removedFromFavorites")
        : tGlobal("common.addedToFavorites"),
    );
  };

  if (loading) {
    return (
      <>
        <Seo
          title={t("Program", "Program") || "Program"}
          description={
            t(
              "Program details and enrollment on healthpathglobal.",
              "Program details and enrollment on healthpathglobal.",
            ) || "Program details and enrollment on healthpathglobal."
          }
          canonicalPath={location.pathname}
        />
        <MainLoading />
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <Seo
          title={
            t("Something went wrong", "Something went wrong") ||
            "Something went wrong"
          }
          description={
            t("Failed to load program", "Failed to load program") ||
            "Failed to load program"
          }
          canonicalPath={location.pathname}
          noIndex={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-red-500 text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("Something went wrong", "Something went wrong") ||
                "Something went wrong"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                t("Failed to load program", "Failed to load program") ||
                "Failed to load program"}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={retry}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <IoMdRefresh className="text-lg" />
                {t("Try Again", "Try Again") || "Try Again"}
              </button>
              <button
                onClick={() => navigate("/Programs")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t("Browse Programs", "Browse Programs") || "Browse Programs"}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!hasData) {
    return (
      <>
        <Seo
          title={
            t("Program not found", "Program not found") || "Program not found"
          }
          description={
            t(
              "This program doesn't exist or has been removed.",
              "This program doesn't exist or has been removed.",
            ) || "This program doesn't exist or has been removed."
          }
          canonicalPath={location.pathname}
          noIndex={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-gray-400 text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("Program not found", "Program not found") ||
                "Program not found"}
            </h2>
            <p className="text-gray-600 mb-6">
              {t(
                "This program doesn't exist or has been removed.",
                "This program doesn't exist or has been removed.",
              ) || "This program doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => navigate("/Programs")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("Browse Programs", "Browse Programs") || "Browse Programs"}
            </button>
          </div>
        </div>
      </>
    );
  }

  const { program } = programData;

  const status = (applicationStatus || "").toString().toLowerCase();
  const isEnrolled =
    hasApplied && ["approved", "completed", "enrolled"].includes(status);

  const programTitle =
    i18n.language === "ar" && program.Title_ar
      ? program.Title_ar
      : program.Title;
  const programDescription =
    i18n.language === "ar" && program.Description_ar
      ? program.Description_ar
      : program.Description;

  const programSeoDescription =
    (i18n.language === "ar" && program.shortDescription_ar
      ? program.shortDescription_ar
      : program.shortDescription) ||
    programDescription ||
    "";
  const programSeoImage = program.Image ? buildApiUrl(program.Image) : null;
  const seoDescription = programSeoDescription
    ? programSeoDescription.length > 160
      ? `${programSeoDescription.slice(0, 157)}...`
      : programSeoDescription
    : t(
        "Program details and enrollment on healthpathglobal.",
        "Program details and enrollment on healthpathglobal.",
      ) || "Program details and enrollment on healthpathglobal.";

  const seoLang = (i18n.language || "en").toLowerCase().startsWith("ar")
    ? "ar"
    : "en";
  const seoLocale = seoLang === "ar" ? "ar_DZ" : "en_US";
  const siteUrl =
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const absoluteUrl = siteUrl ? `${siteUrl}${location.pathname}` : undefined;
  const siteName = import.meta.env.VITE_SITE_NAME || "healthpathglobal";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: programTitle,
    description: seoDescription,
    url: absoluteUrl,
    image: programSeoImage || undefined,
    provider: {
      "@type": "university",
      name: siteName,
      url: siteUrl || undefined,
    },
  };

  return (
    <>
      <Seo
        title={programTitle || t("Program", "Program") || "Program"}
        description={seoDescription}
        canonicalPath={location.pathname}
        image={programSeoImage}
        type="article"
        lang={seoLang}
        locale={seoLocale}
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-gray-50 w-full">
        {/* Enhanced Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t("Program Details", "Program Details") ||
                      "Program Details"}
                  </h1>
                  <p className="text-gray-600">{programTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t("Contact", "Contact") || "Contact"}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorite
                      ? "bg-red-50 text-red-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        {refetching && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg flex items-center text-sm sm:text-base">
              <IoMdRefresh className="animate-spin mr-2 w-4 h-4" />
              <span className="hidden sm:inline">
                {t("Refreshing...", "Refreshing...") || "Refreshing..."}
              </span>
              <span className="sm:hidden">...</span>
            </div>
          </div>
        )}

        {/* Enhanced Hero Section with Video */}
        <div className="bg-white shadow-sm mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Program Image/Video */}
            <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative rounded-xl mb-8 group">
              {(() => {
                const videoUrl =
                  program.videoUrl || program.videos?.[0]?.videoUrl;

                if (videoUrl) {
                  // Add base URL if the video path is relative
                  const fullVideoUrl = resolvedVideoUrl;

                  return (
                    <div className="relative w-full h-full">
                      {!showVideo ? (
                        // Video Thumbnail with Play Button
                        <div
                          className="relative w-full h-full cursor-pointer"
                          onClick={() => setShowVideo(true)}
                        >
                          {/* Poster Image */}
                          <ImageWithFallback
                            type="program"
                            src={
                              program.Image ? buildApiUrl(program.Image) : null
                            }
                            alt={programTitle}
                            className="w-full h-full object-cover"
                          />

                          {/* Dark Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />

                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                              {/* Pulsing Ring */}
                              <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" />

                              {/* Play Button */}
                              <button className="relative bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-full p-6 shadow-2xl transform group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                                <PlayCircle
                                  className="w-16 h-16"
                                  strokeWidth={1.5}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Video Label */}
                          <div className="absolute bottom-6 left-6 bg-black bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-white" />
                            <span className="text-white font-medium">
                              {t("Watch Video", "Watch Video") || "Watch Video"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Video Player
                        <div className="relative w-full h-full bg-black">
                          <VideoPlayer
                            key={fullVideoUrl}
                            src={fullVideoUrl}
                            poster={
                              program.Image
                                ? buildApiUrl(program.Image)
                                : undefined
                            }
                            title={programTitle}
                            className="w-full h-full"
                            autoPlay
                          />

                          {/* Close Button */}
                          <button
                            onClick={() => setShowVideo(false)}
                            className="absolute top-4 right-4 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-2 transition-all duration-200 z-10"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <ImageWithFallback
                      type="program"
                      src={program.Image ? buildApiUrl(program.Image) : null}
                      alt={programTitle}
                      className="w-full h-full object-cover"
                    />
                  );
                }
              })()}
            </div>

            {/* Program Title and Info */}
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <h1
                  className="text-4xl font-bold text-gray-900 mb-4"
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                >
                  {programTitle}
                </h1>
                {/* Show short description if available, otherwise full description */}
                {(program.short_description ||
                  program.short_description_ar ||
                  programDescription) && (
                  <p
                    className="text-xl text-gray-600 mb-6"
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  >
                    {i18n.language === "ar" && program.short_description_ar
                      ? program.short_description_ar
                      : program.short_description || programDescription}
                  </p>
                )}

                {/* Program Stats */}
                <div className="flex flex-wrap gap-6">
                  {program.startDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>
                        {t("Starts", "Starts") || "Starts"}:{" "}
                        {new Date(program.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {program.participantCount && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span>
                        {program.participantCount}{" "}
                        {t("participants", "Participants") || "participants"}
                      </span>
                    </div>
                  )}
                  {program.rating && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star className="w-5 h-5 fill-current text-yellow-400" />
                      <span>{program.rating}</span>
                      {program.reviewsCount && (
                        <span className="text-gray-500">
                          ({program.reviewsCount}{" "}
                          {t("reviews", "Reviews") || "reviews"})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2">
              {/* Program Content Component */}
              <ProgramContent program={program} />

              {/* FAQ Section */}
              <div className="mt-8">
                <ProgramFAQSection programId={programId} />
              </div>

              {/* Reviews Section */}
              <div className="mt-8">
                <ProgramReviews
                  programId={programId}
                  reviews={programReviews}
                  isEnrolled={isEnrolled}
                  userReview={userProgramReview}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Program Information Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
                {/* Program Image */}
                <div className="relative mb-4 group">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center overflow-hidden">
                    <ImageWithFallback
                      type="program"
                      src={buildApiUrl(program.Image)}
                      alt={programTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <PlayCircle className="text-purple-600 text-xl" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  {t("Program Information", "Program Information") ||
                    "Program Information"}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-center">
                    {isFree ? (
                      <div className="text-3xl font-bold text-green-600">
                        {t("Free", "Free") || "Free"}
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(programPrice, currency)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Status + Action */}
                {isEnrolled ? (
                  // ── Enrolled ──
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                      <div className="mt-0.5 text-green-500 text-lg">✓</div>
                      <div>
                        <p className="font-semibold text-green-800">
                          {tGlobal("common.enrolled", "Enrolled")}
                        </p>
                        <p className="text-sm text-green-600 mt-0.5">
                          {tGlobal(
                            "alerts.application.enrolledText",
                            "Congratulations! You are enrolled in this program.",
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/my-programs")}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-colors text-white bg-green-600 hover:bg-green-700"
                    >
                      {tGlobal(
                        "alerts.application.goToMyPrograms",
                        "Go to My Programs",
                      )}
                    </button>
                    {/* View Payment History Button */}
                    {paymentStatus?.status === "approved" && (
                      <CoursePaymentButton
                        itemId={program.id}
                        itemType="program"
                        itemTitle={programTitle}
                      />
                    )}
                  </div>
                ) : paymentStatus?.status === "pending" ? (
                  // ── Payment pending — block the button ──
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-amber-700 mb-2">
                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <span className="font-semibold">
                          {tGlobal(
                            "alerts.payment.pendingTitle",
                            "Payment Under Review",
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-amber-700">
                        {tGlobal(
                          "alerts.payment.pendingText",
                          "Your payment is being verified by our admin team.",
                        )}
                      </p>
                      {paymentStatus.transactionId && (
                        <div className="mt-2 text-xs text-amber-600 bg-amber-100 rounded-lg px-3 py-2 font-mono break-all">
                          <span className="font-sans font-semibold">ID: </span>
                          {paymentStatus.transactionId}
                        </div>
                      )}
                      <p className="text-xs text-amber-600 mt-2">
                        {tGlobal(
                          "common.waitingForApproval",
                          "You will be notified once it's approved.",
                        )}
                      </p>
                    </div>
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>⏳</span>
                      {tGlobal("common.awaitingApproval", "Awaiting Approval")}
                    </button>
                  </div>
                ) : paymentStatus?.status === "rejected" ? (
                  // ── Payment rejected — allow resubmit ──
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-red-700 mb-2">
                        <span className="text-lg">✕</span>
                        <span className="font-semibold">
                          {tGlobal(
                            "alerts.payment.rejectedTitle",
                            "Payment Rejected",
                          )}
                        </span>
                      </div>
                      {paymentStatus.rejectionReason && (
                        <p className="text-sm text-red-600">
                          <span className="font-semibold">
                            {tGlobal("alerts.payment.reason", "Reason:")}
                          </span>{" "}
                          {paymentStatus.rejectionReason}
                        </p>
                      )}
                      <p className="text-xs text-red-500 mt-2">
                        {tGlobal(
                          "common.resubmitQuestion",
                          "You can resubmit a new payment screenshot.",
                        )}
                      </p>
                    </div>
                    <button
                      onClick={handleApplyClick}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-colors text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {tGlobal("alerts.payment.resubmit", "Resubmit Payment")}
                    </button>
                  </div>
                ) : paymentStatus?.status === "deleted" ? (
                  // ── Payment deleted — allow fresh submission ──
                  <div className="space-y-3">
                    <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <span className="text-lg">🗑</span>
                        <span className="font-semibold">
                          {tGlobal(
                            "alerts.payment.deletedTitle",
                            "Payment Deleted",
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {tGlobal(
                          "alerts.payment.deletedText",
                          "Your payment was removed by the administrator.",
                        )}
                      </p>
                      {paymentStatus.rejectionReason && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
                          <span className="font-semibold">
                            {tGlobal("alerts.payment.reason", "Reason:")}
                          </span>{" "}
                          {paymentStatus.rejectionReason}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleApplyClick}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-colors text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {tGlobal(
                        "alerts.payment.submitNew",
                        "Submit New Payment",
                      )}
                    </button>
                  </div>
                ) : hasApplied ? (
                  // ── Application exists (old flow / manual assignment) ──
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-lg text-center border ${
                        status === "rejected"
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-yellow-50 border-yellow-200 text-yellow-800"
                      }`}
                    >
                      <div className="font-semibold">
                        {status === "rejected"
                          ? tGlobal(
                              "common.applicationRejected",
                              "Application Rejected",
                            )
                          : tGlobal(
                              "common.applicationPending",
                              "Application Pending",
                            )}
                      </div>
                      <div className="text-sm mt-1 opacity-90">
                        {status === "rejected"
                          ? tGlobal(
                              "alerts.application.rejectedText",
                              "Your application was not approved this time.",
                            )
                          : tGlobal(
                              "alerts.application.pendingText",
                              "Your application is under review.",
                            )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/Programs/${programId}/status`)}
                      className="w-full py-3 px-4 rounded-lg font-semibold transition-colors text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {tGlobal(
                        "common.viewApplicationStatus",
                        "View Application Status",
                      )}
                    </button>
                  </div>
                ) : (
                  // ── Default — apply button ──
                  <button
                    onClick={handleApplyClick}
                    disabled={applying}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      applying
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : isFree
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {applying ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        {t("Applying...", "Applying...") || "Applying..."}
                      </div>
                    ) : isFree ? (
                      t("Apply for Free", "Apply for Free") || "Apply for Free"
                    ) : (
                      t("Apply Now", "Apply Now") || "Apply Now"
                    )}
                  </button>
                )}

                {/* Program Details */}
                <div className="space-y-4 pt-4 border-t">
                  {program.startDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t("Start Date", "Start Date") || "Start Date"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(program.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {program.duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t("Duration", "Duration") || "Duration"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {program.duration}
                        </p>
                      </div>
                    </div>
                  )}

                  {program.level && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t("Level", "Level") || "Level"}
                        </p>
                        <p className="text-sm text-gray-600">{program.level}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Section */}
                <div className="border-t pt-6 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {t(
                      "Questions about this program?",
                      "Questions about this program?",
                    ) || "Questions about this program?"}
                  </h4>
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={18} />
                    {t("Contact Us", "Contact Us") || "Contact Us"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {t("Contact Us", "Contact Us") || "Contact Us"}
                  </h3>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  ></button>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {!user && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("Name", "Name") || "Name"} *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("Email", "Email") || "Email"} *
                        </label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Subject", "Subject") || "Subject"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Message", "Message") || "Message"} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t("Cancel", "Cancel") || "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingContact ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t("Sending...", "Sending...") || "Sending..."}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t("Send Message", "Send Message") || "Send Message"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProgramDetails;
