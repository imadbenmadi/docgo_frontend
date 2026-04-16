import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaCheckCircle, FaLock } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { clientCoursesAPI } from "../API/Courses";
import PaymentAPI from "../API/PaymentInfo";
import { clientProgramsAPI } from "../API/Programs";
import { useAppContext } from "../AppContext";
import ccpIcon from "../assets/ccp.png";
import CCPPayment from "../components/Payment/CCPPayment";
import PaymentMethodSelector from "../components/Payment/PaymentMethodSelector";
import MainLoading from "../MainLoading";
import apiClient from "../utils/apiClient";
import { getApiErrorMessage } from "../utils/apiErrorTranslate";
import ImageWithFallback from "../components/Common/ImageWithFallback";
const PaymentPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const courseId = params.courseId;
  const programId = params.programId;
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuth, user } = useAppContext();

  const [selectedMethod, setSelectedMethod] = useState("ccp");
  const [loading, setLoading] = useState(false);
  const [itemData, setItemData] = useState(null);
  const [itemType, setItemType] = useState(null); // 'course' or 'program'
  const [itemLoading, setItemLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filteredMethods, setFilteredMethods] = useState([]);
  const [existingPayment, setExistingPayment] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(true);

  // Check if user already has a payment application for this item
  useEffect(() => {
    const checkExistingPayment = async () => {
      if (!isAuth || !user) return;

      try {
        setCheckingPayment(true);
        const itemId = courseId || programId;
        const itemType = courseId ? "course" : "program";

        const response = await apiClient.get(
          `/user-payments/check-application/${itemType}/${itemId}`,
        );

        if (response.data.success && response.data.hasApplication) {
          const application = response.data.application;
          setExistingPayment(application);

          // If payment is pending, redirect back to course/program page
          if (application.status === "pending") {
            Swal.fire({
              icon: "info",
              title: t("alerts.payment.pendingTitle", "Payment Pending"),
              html: `${t("alerts.payment.pendingTitle", "Payment Pending")}<br/><br/>
                                   <strong>${t("alerts.payment.transactionId", "Transaction ID:")}</strong> ${application.transactionId}<br/><br/>
                                   ${t("common.waitingForApproval", "Please wait for admin approval. You will be notified once verified.")}`,
              confirmButtonText: t("alerts.payment.goBack", "Go Back"),
              allowOutsideClick: false,
            }).then(() => {
              navigate(
                `/${itemType === "course" ? "Courses" : "Programs"}/${itemId}`,
              );
            });
            return;
          }

          // If payment is approved, redirect to my courses/programs
          if (application.status === "approved") {
            // If the backend indicates the user can submit a new payment (e.g. access removed by admin),
            // do NOT redirect. Let the user proceed with a new submission.
            if (!response.data.canSubmitNew) {
              Swal.fire({
                icon: "success",
                title: t("alerts.payment.successTitle", "Payment Successful!"),
                text: `${t("common.alreadyEnrolled", "You are already enrolled in this")} ${itemType}. ${t("common.redirecting", "Redirecting...")}`,
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                const go = async () => {
                  if (itemType !== "course") {
                    navigate("/programs");
                    return;
                  }

                  // Decide between /watch vs /explore for ZIP courses.
                  let uploadType = "";
                  try {
                    const courseRes =
                      await clientCoursesAPI.getCourseDetails(courseId);
                    const course = courseRes?.data?.course || courseRes?.data;
                    uploadType = String(course?.uploadType || "").toLowerCase();
                  } catch {
                    uploadType = "";
                  }

                  navigate(
                    uploadType === "zip"
                      ? `/Courses/${courseId}/explore`
                      : `/Courses/${courseId}/watch`,
                  );
                };

                go();
              });
              return;
            }

            Swal.fire({
              icon: "warning",
              title: t("alerts.payment.accessRemovedTitle", "Access Removed"),
              text: t(
                "alerts.payment.accessRemovedText",
                "Your access was removed by an admin. You can submit a new payment to re-enroll.",
              ),
              confirmButtonText: t("common.ok", "OK"),
            });

            setCheckingPayment(false);
            return;
          }

          // If payment is rejected, allow resubmission (show the form)
          if (application.status === "rejected") {
            // Show the form but with rejection info
            setCheckingPayment(false);
            return;
          }

          // If payment is cancelled, allow new submission (show the form)
          if (application.status === "cancelled") {
            setCheckingPayment(false);
            return;
          }

          // If payment is deleted, allow new submission (show the form)
          if (application.status === "deleted") {
            // Show the form but with deletion info
            setCheckingPayment(false);
            return;
          }
        } else {
          // No existing payment, allow new submission
          setExistingPayment(null);
        }
      } catch (error) {
        // If error, allow user to proceed (fail gracefully)
      } finally {
        setCheckingPayment(false);
      }
    };

    checkExistingPayment();
  }, [isAuth, user, courseId, programId, navigate]);

  // Fetch payment configuration
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        setConfigLoading(true);
        const response = await PaymentAPI.getPaymentInfo();
        if (response.success) {
          setPaymentConfig(response.data);

          // CCP screenshot payments only
          setSelectedMethod("ccp");
        }
      } catch (error) {
        // Use fallback configuration
        setPaymentConfig({
          ccp: { enabled: false, available: false },
          general: {
            defaultCurrency: "DZD",
            supportedCurrencies: ["DZD"],
          },
        });
        setError(
          "Failed to fetch payment configuration , please try later or contact the support team",
        );
      } finally {
        setConfigLoading(false);
      }
    };

    fetchPaymentConfig();
  }, []);

  // Get item data from navigation state or fetch from API
  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setItemLoading(true);

        if (courseId) {
          setItemType("course");

          // Fetch course data from API
          const response = await clientCoursesAPI.getCourseDetails(courseId);

          if (response.success && response.data) {
            setItemData(response.data.course || response.data);
          } else {
            navigate(`/Courses/${courseId}`);
            return;
          }
        } else if (programId) {
          setItemType("program");

          // Fetch program data from API
          const response = await clientProgramsAPI.getProgramDetails(programId);

          // Handle both response formats
          if (response) {
            // Check if it's the new format with success field
            if (response.success && response.data) {
              setItemData(response.data.program || response.data);
            }
            // Or the direct format where program is directly in response
            else if (response.program || response.data?.program) {
              setItemData(response.program || response.data.program);
            }
            // Or if response itself is the program object
            else if (response.Title || response.title) {
              setItemData(response);
            } else {
              navigate(`/Programs/${programId}`);
              return;
            }
          } else {
            navigate(`/Programs/${programId}`);
            return;
          }
        } else {
          // No valid data or ID, redirect to home
          navigate("/");
        }
      } catch (error) {
        const currentItemType = courseId
          ? "course"
          : programId
            ? "program"
            : "item";

        // Don't redirect, show error message instead
        setError(
          `Failed to fetch ${currentItemType} data. Please try again later.`,
        );

        // Set basic item data from URL params if available
        if (programId) {
          setItemData({ id: programId, Title: "Loading..." });
          setItemType("program");
        } else if (courseId) {
          setItemData({ id: courseId, title: "Loading..." });
          setItemType("course");
        }
      } finally {
        setItemLoading(false);
      }
    };

    fetchItemData();
  }, [location.state, courseId, programId, navigate]);

  // Check authentication
  useEffect(() => {
    if (!isAuth || !user) {
      navigate(`/login?from=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuth, user, navigate]);

  // Cleanup payment on page unload (when user navigates away or refreshes)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only cleanup if we're in the middle of a CCP payment process
      if (loading && selectedMethod === "ccp" && itemData?.id) {
        try {
          // Send cleanup request - this will be sent even if page is closing
          navigator.sendBeacon(
            `/upload/Payment/${
              itemType === "course" ? "Courses" : "Programs"
            }/${itemData.id}`,
            JSON.stringify({ method: "DELETE" }),
          );
        } catch (error) {}
      }
    };

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loading, selectedMethod, itemData, itemType]);

  // Extract pricing information based on item type
  const getItemPrice = () => {
    if (!itemData) return 0;

    if (itemType === "course") {
      const discountPrice = parseFloat(itemData.discountPrice || 0);
      const regularPrice = parseFloat(itemData.Price || 0);
      return discountPrice > 0 ? discountPrice : regularPrice;
    } else if (itemType === "program") {
      // Check for both uppercase and lowercase price fields
      const discountPrice = parseFloat(itemData.discountPrice || 0);
      const regularPrice = parseFloat(itemData.Price || itemData.price || 0);

      // Priority: discountPrice > regularPrice
      if (discountPrice > 0) return discountPrice;
      if (regularPrice > 0) return regularPrice;
      return 0;
    }
    return 0;
  };

  // Kept for future use if discount display is needed
  // const getOriginalPrice = () => {
  //     if (!itemData) return 0;
  //     return parseFloat(itemData.Price || 0);
  // };

  const price = getItemPrice();
  // const originalPrice = getOriginalPrice(); // Commented out - not currently used

  // Improved currency handling with proper fallbacks
  const getCurrency = () => {
    // Platform is DZD-only for now.
    return "DZD";
  };

  const currency = getCurrency();

  const hasDiscount = null;
  // itemData.discountPrice && itemData.discountPrice < itemData.Price;
  // itemType === "course"
  //     ? itemData.discountPrice && itemData.discountPrice < itemData.Price
  //     : itemData.originalPrice &&
  //       itemData.price &&
  //       itemData.originalPrice > itemData.price;

  const getItemTitle = () => {
    if (itemType === "course") {
      return itemData.Title;
    } else if (itemType === "program") {
      return itemData.Title || itemData.title;
    }
    return "Unknown Item";
  };

  const getItemImage = () => {
    const imagePath = itemData?.Image || itemData?.image;
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath;
    // Otherwise prepend the API URL
    return import.meta.env.VITE_API_URL + imagePath;
  };

  const getItemLevel = () => {
    if (itemType === "course") {
      return `${itemData.Level}  ${itemData.language}`;
    } else if (itemType === "program") {
      return `${
        itemData.programSpecialty ||
        itemData.Category ||
        itemData.category ||
        "Program"
      }  ${itemData.language || "Multiple"}`;
    }
    return "";
  };

  const paymentMethods = useMemo(() => {
    if (!paymentConfig) return [];

    return [
      {
        id: "ccp",
        name: "Algeria CCP",
        description: "Pay with Algeria CCP transfer",
        detailedInstructions: paymentConfig.ccp?.instructions,
        icon: ccpIcon,
        available: paymentConfig.ccp?.available,
        enabled: paymentConfig.ccp?.enabled,
        isEnabled: paymentConfig.ccp?.isEnabled,
      },
    ];
  }, [paymentConfig]);

  // Filter and update available payment methods when config changes
  useEffect(() => {
    if (!paymentConfig) {
      setFilteredMethods([]);
      return;
    }

    const availableMethods = paymentMethods.filter((method) => {
      // Check if method is both enabled and available
      const isEnabled = method.enabled && method.isEnabled !== false;
      const isAvailable = method.available;

      return isEnabled && isAvailable;
    });

    setFilteredMethods(availableMethods);

    // Set default payment method if none selected or current selection is not available
    if (availableMethods.length > 0) {
      const currentMethodAvailable = availableMethods.some(
        (method) => method.id === selectedMethod,
      );

      if (!currentMethodAvailable) {
        // Set to first available method
        setSelectedMethod(availableMethods[0].id);
      }
    }
  }, [paymentConfig, paymentMethods, selectedMethod]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePaymentSuccess = (paymentData) => {
    let successMessage = t(
      "alerts.payment.successTitle",
      "Payment Successful!",
    );
    let redirectMessage = t(
      "common.redirecting",
      "Redirecting to your dashboard...",
    );

    if (paymentData.method === "ccp") {
      successMessage = t("alerts.payment.successTitle", "Payment Successful!");
      redirectMessage = t(
        "common.ccpSubmitted",
        "Your CCP payment has been submitted for verification. You will be notified once it's approved.",
      );
    }

    Swal.fire({
      title: successMessage,
      text: redirectMessage,
      icon: "success",
      timer: paymentData.method === "ccp" ? 5000 : 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      // confirmButtonText: t("alerts.payment.goToPrograms", "Go to Programs"),
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      // if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
      navigate("/dashboard");
      // }
    });
  };

  const handlePaymentError = async (error) => {
    // If this was a CCP payment error, try to cleanup any uploaded file
    if (selectedMethod === "ccp" && itemData?.id) {
      try {
        const { PaymentAPI } = await import("../API/Payment");
        await PaymentAPI.cleanupCCPPayment({
          itemType,
          itemId: itemData.id,
        });
      } catch (cleanupError) {}
    }

    let errorTitle = t("alerts.payment.errorTitle", "Payment Failed!");
    const errorMessage = getApiErrorMessage(error, t);

    Swal.fire({
      title: t("alerts.payment.errorTitle", "Payment Error"),
      text: errorMessage,
      icon: "error",
      showConfirmButton: true,
      confirmButtonText: t("alerts.payment.tryAgain", "Try Again"),
      confirmButtonColor: "#ef4444",
      showCancelButton: true,
      cancelButtonText: t("alerts.payment.goBack", "Go Back"),
      cancelButtonColor: "#6b7280",
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // User wants to try again - stay on the page
        setLoading(false);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // User wants to go back
        navigate(-1);
      }
    });
  };

  // Show loading while checking payment status or loading data
  if (!itemData || configLoading || itemLoading || checkingPayment) {
    return <MainLoading />;
  } else if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-red-100">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg
                className="w-10 h-10 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Payment Page Unavailable
            </h2>

            {/* Error Description */}
            <p className="text-gray-600 mb-2 leading-relaxed">
              We&apos;re experiencing technical difficulties loading the payment
              page.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Please try again later or contact our support team for assistance.
            </p>

            {/* Error Details (if available) */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 font-medium">
                  Error Details:
                </p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Try Again
              </button>
              <button
                onClick={handleGoBack}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 border border-gray-200"
              >
                Go Back
              </button>
            </div>

            {/* Support Contact */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team on the footer of this page
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
            >
              <FaArrowLeft />
              <span>
                {t("paymentPage.backToItem", "Back")}{" "}
                {t(`paymentPage.${itemType}`)}
              </span>
            </button>

            <div className="flex items-center gap-3">
              <FaLock className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {t("paymentPage.title", "Secure Payment")}
              </h1>
            </div>
            <p className="text-gray-600 mt-2">
              {t(
                "paymentPage.enrollmentMessage",
                "Complete your enrollment in this course",
              )}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              {/* Rejection Notice */}
              {existingPayment && existingPayment.status === "rejected" && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl"></span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        {t("paymentPage.rejectionNotice.title", "Title")}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-red-700">
                          <strong>
                            {t("paymentPage.rejectionNotice.reason", "Reason")}:
                          </strong>{" "}
                          {existingPayment.rejectionReason ||
                            t(
                              "paymentPage.rejectionNotice.noReason",
                              "No Reason",
                            )}
                        </p>
                        <p className="text-red-600">
                          <strong>Transaction ID:</strong>{" "}
                          {existingPayment.transactionId}
                        </p>
                        <p className="text-red-600">
                          <strong>Amount:</strong> {existingPayment.amount}{" "}
                          {existingPayment.currency}
                        </p>
                        <p className="text-red-600">
                          <strong>Submitted:</strong>{" "}
                          {new Date(
                            existingPayment.createdAt,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-red-100 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Tip:</strong> Please make sure to upload a
                          clear screenshot of your payment receipt with the
                          correct transaction details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deletion/Cancellation Notice */}
              {existingPayment &&
                (existingPayment.status === "deleted" ||
                  existingPayment.status === "cancelled") && (
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {existingPayment.status === "cancelled"
                            ? t(
                                "paymentPage.cancelNotice.title",
                                "Previous Payment Cancelled",
                              )
                            : t(
                                "paymentPage.deleteNotice.title",
                                "Previous Payment Deleted",
                              )}
                        </h3>
                        <div className="space-y-2 text-sm">
                          {existingPayment.rejectionReason && (
                            <p className="text-gray-700">
                              <strong>Reason:</strong>{" "}
                              {existingPayment.rejectionReason}
                            </p>
                          )}
                          <p className="text-gray-600">
                            <strong>Transaction ID:</strong>{" "}
                            {existingPayment.transactionId}
                          </p>
                          <p className="text-gray-600">
                            <strong>Amount:</strong> {existingPayment.amount}{" "}
                            {existingPayment.currency}
                          </p>
                          <p className="text-gray-600">
                            <strong>Submitted:</strong>{" "}
                            {new Date(
                              existingPayment.createdAt,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-800">
                            <strong>Note:</strong> Your previous payment was
                            {existingPayment.status === "cancelled"
                              ? t(
                                  "paymentPage.cancelNotice.text",
                                  "cancelled by the administrator",
                                )
                              : t(
                                  "paymentPage.deleteNotice.text",
                                  "removed by the administrator",
                                )}
                            . You can submit a new payment below.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {existingPayment && existingPayment.status === "rejected"
                    ? "Resubmit Payment"
                    : existingPayment &&
                        (existingPayment.status === "deleted" ||
                          existingPayment.status === "cancelled")
                      ? "Submit New Payment"
                      : "Choose Payment Method"}
                </h2>

                <PaymentMethodSelector
                  methods={filteredMethods}
                  selectedMethod={selectedMethod}
                  onMethodChange={setSelectedMethod}
                />

                <div className="mt-8">
                  {selectedMethod === "ccp" && (
                    <CCPPayment
                      itemData={itemData}
                      itemType={itemType}
                      amount={price}
                      currency={currency}
                      paymentConfig={paymentConfig?.ccp}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                  {t("paymentPage.orderSummary", "Order Summary")}
                </h3>

                {/* Item Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex flex-col items-center text-center gap-3">
                    {getItemImage() && (
                      <img
                        src={getItemImage()}
                        alt={getItemTitle()}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      />
                    )}
                    <div className="w-full">
                      <h4 className="font-semibold text-gray-900 text-base mb-2">
                        {getItemTitle()}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {getItemLevel()}
                      </p>
                      <p className="text-xs text-blue-600 font-medium capitalize">
                        {t(`paymentPage.${itemType}`)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700 font-medium">
                        {t(
                          itemType === "course"
                            ? "paymentPage.coursePrice"
                            : "paymentPage.programFee",
                        )}
                      </span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {price} {currency}
                      </span>
                    </div>

                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-lg">
                          {t("paymentPage.total", "Total")}
                        </span>
                        <span className="font-bold text-2xl text-blue-600">
                          {price} {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed">
                      {t(
                        "paymentPage.securePayment",
                        "SSL Secure & Encrypted Payment",
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed">
                      {t(
                        "paymentPage.instantAccess",
                        "Instant access after payment",
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed">
                      {t(
                        "paymentPage.moneyBackGuarantee",
                        "30-day money-back guarantee",
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PaymentPage;
