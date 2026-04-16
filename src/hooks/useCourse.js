import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useAppContext } from "../AppContext";
import courseService from "../services/courseService";
import apiClient from "../utils/apiClient";
import {
  showEnrollmentSuccess,
  showEnrollmentError,
  showInfo,
  showWarning,
} from "../utils/sweetAlertHelper";

export const useCourse = (courseId) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [refetching, setRefetching] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // pending, approved, rejected, null
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();
  const { isAuth, user } = useAppContext();
  const { t } = useTranslation();
  const abortControllerRef = useRef(null);

  const getAccessPathForCourse = useCallback(
    (course) => {
      const uploadType = String(course?.uploadType || "").toLowerCase();
      return uploadType === "zip"
        ? `/Courses/${courseId}/explore`
        : `/Courses/${courseId}/watch`;
    },
    [courseId],
  );

  // Check payment application status
  const checkPaymentStatus = useCallback(async () => {
    if (!isAuth || !courseId) return;

    try {
      const response = await apiClient.get(
        `/user-payments/check-application/course/${courseId}`,
      );

      if (response.data.success && response.data.hasApplication) {
        setPaymentStatus({
          status: response.data.application.status,
          rejectionReason: response.data.application.rejectionReason,
          transactionId: response.data.application.transactionId,
          createdAt: response.data.application.createdAt,
        });
      } else {
        setPaymentStatus(null);
      }
    } catch (error) {
      setPaymentStatus(null);
    }
  }, [isAuth, courseId]);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCourseData = useCallback(
    async (showRefetching = false) => {
      if (!courseId) return;

      try {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        if (showRefetching) {
          setRefetching(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await courseService.getCourse(courseId, {
          signal: abortControllerRef.current.signal,
        });

        // Normaliser les données pour s'assurer que objectives est un tableau
        if (response && response.course) {
          if (response.course.objectives) {
            if (typeof response.course.objectives === "string") {
              try {
                response.course.objectives = JSON.parse(
                  response.course.objectives,
                );
              } catch {
                // Si le parsing JSON échoue, on traite comme un seul objectif
                response.course.objectives = [response.course.objectives];
              }
            }
            // S'assurer que c'est un tableau
            if (!Array.isArray(response.course.objectives)) {
              response.course.objectives = [response.course.objectives];
            }
          } else {
            response.course.objectives = [];
          }
        }

        setCourseData(response);

        // Check payment status after loading course data
        await checkPaymentStatus();
      } catch (err) {
        // Don't set error if request was aborted
        if (err.name === "AbortError") {
          return;
        }

        // More specific error messages
        let errorMessage = "Failed to load course details. Please try again.";
        if (err.response?.status === 404) {
          errorMessage =
            "Course not found. It may have been removed or doesn't exist.";
        } else if (err.response?.status === 403) {
          errorMessage = "You don't have permission to access this course.";
        } else if (!navigator.onLine) {
          errorMessage =
            "No internet connection. Please check your network and try again.";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefetching(false);
        abortControllerRef.current = null;
      }
    },
    [courseId, checkPaymentStatus],
  );

  // Initial fetch effect
  useEffect(() => {
    fetchCourseData();

    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCourseData]);

  // Separate function for free course enrollment
  const handleFreeCourseEnrollment = useCallback(async () => {
    try {
      setEnrolling(true);

      const resp = await courseService.enrollFreeCourse(courseId);
      // if (!resp.success) {
      //     throw new Error(
      //         resp.message || "Failed to enroll in the course."
      //     );
      // }
      // Refresh course data to show enrolled status
      await fetchCourseData(true);

      // Show success message with better UX
      await showEnrollmentSuccess();

      // Navigate to course access page
      navigate(getAccessPathForCourse(courseData?.course));
    } catch (error) {
      let errorMessage = "Failed to enroll in the course. Please try again.";

      // Handle specific error cases
      if (error.response?.status === 400) {
        errorMessage = "You are already enrolled in this course.";
        setRedirecting(true);
      } else if (error.response?.status === 409) {
        errorMessage = "You are already enrolled in this course.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to enroll in this course.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      if (error.response?.status === 400 && redirecting) {
        const result = await Swal.fire({
          title: t(
            "alerts.enrollment.alreadyEnrolledTitle",
            "Already Enrolled",
          ),
          text: errorMessage,
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#6b7280",
          confirmButtonText: t("alerts.enrollment.goToCourse", "Go to Course"),
          cancelButtonText: t("common.cancel", "Cancel"),
          customClass: {
            popup: "rounded-lg shadow-xl",
            title: "text-lg font-semibold text-gray-900",
            content: "text-gray-600",
          },
        });

        if (result.isConfirmed) {
          navigate(getAccessPathForCourse(courseData?.course));
        }
      } else {
        await Swal.fire({
          title: t("alerts.enrollment.failedTitle", "Enrollment Failed"),
          text: errorMessage,
          icon: "error",
          confirmButtonColor: "#ef4444",
          customClass: {
            popup: "rounded-lg shadow-xl",
            title: "text-lg font-semibold text-gray-900",
            content: "text-gray-600",
          },
        });
      }
    } finally {
      setEnrolling(false);
    }
  }, [courseId, fetchCourseData, navigate, getAccessPathForCourse, courseData]);

  // Enhanced enrollment handler with better error handling and UX
  const handleEnrollClick = useCallback(async () => {
    // Check authentication first
    if (!isAuth || !user) {
      const result = await Swal.fire({
        title: t("alerts.auth.authRequiredTitle", "Authentication Required"),
        text: t(
          "alerts.auth.authRequiredText",
          "Please log in to enroll in this course",
        ),
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
        confirmButtonText: t("alerts.auth.goToLogin", "Go to Login"),
        cancelButtonText: t("common.cancel", "Cancel"),
        customClass: {
          popup: "rounded-lg shadow-xl",
          title: "text-lg font-semibold text-gray-900",
          content: "text-gray-600",
          confirmButton: "font-medium",
          cancelButton: "font-medium",
        },
      });

      if (result.isConfirmed) {
        navigate(`/login?from=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }

    // Check if already enrolled
    if (courseData?.userStatus?.isEnrolled) {
      navigate(getAccessPathForCourse(courseData?.course));
      return;
    }

    // Check payment status
    if (paymentStatus) {
      if (paymentStatus.status === "pending") {
        await Swal.fire({
          title: t("alerts.payment.pendingTitle", "Payment Pending"),
          html: `${t("alerts.payment.pendingText", "Your payment is pending approval")}<br/><br/>
                           <strong>${t("alerts.payment.transactionId", "Transaction ID:")}</strong> ${paymentStatus.transactionId}<br/><br/>
                           ${t("common.waitingForApproval", "You will be notified once it's approved.")}`,
          icon: "info",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: t("common.ok", "OK"),
        });
        return;
      }

      if (paymentStatus.status === "rejected") {
        const result = await Swal.fire({
          title: t("alerts.payment.rejectedTitle", "Payment Rejected"),
          html: `${t("alerts.payment.rejectedText", "Your payment was rejected")}<br/><br/>
                           <strong>${t("alerts.payment.reason", "Reason:")}</strong> ${paymentStatus.rejectionReason}<br/><br/>
                           ${t("common.resubmitQuestion", "Would you like to resubmit your payment?")}`,
          icon: "error",
          showCancelButton: true,
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280",
          confirmButtonText: t("alerts.payment.resubmit", "Resubmit"),
          cancelButtonText: t("common.cancel", "Cancel"),
        });

        if (result.isConfirmed) {
          navigate(`/payment/course/${courseId}`, {
            state: {
              course: courseData?.course,
              enrollmentType: "course",
              isResubmission: true,
            },
          });
        }
        return;
      }

      if (paymentStatus.status === "deleted") {
        const result = await Swal.fire({
          title: t("alerts.payment.deletedTitle", "Payment Deleted"),
          html: `${t("alerts.payment.deletedText", "Your payment was deleted")}<br/><br/>
                           ${
                             paymentStatus.rejectionReason
                               ? `<strong>${t("alerts.payment.reason", "Reason:")}</strong> ${paymentStatus.rejectionReason}<br/><br/>`
                               : ""
                           }
                           ${t("common.submitNewQuestion", "Would you like to submit a new payment?")}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280",
          confirmButtonText: t("alerts.payment.submitNew", "Submit New"),
          cancelButtonText: t("common.cancel", "Cancel"),
        });

        if (result.isConfirmed) {
          navigate(`/payment/course/${courseId}`, {
            state: {
              course: courseData?.course,
              enrollmentType: "course",
            },
          });
        }
        return;
      }
    }

    // Get course price
    const coursePrice = parseFloat(
      courseData?.course?.discountPrice || courseData?.course?.Price || 0,
    );

    if (coursePrice === 0) {
      // Handle free course enrollment
      await handleFreeCourseEnrollment();
    } else {
      navigate(`/payment/course/${courseId}`, {
        state: {
          course: courseData?.course,
          enrollmentType: "course",
        },
      });
    }
  }, [
    isAuth,
    user,
    courseData,
    courseId,
    navigate,
    handleFreeCourseEnrollment,
    paymentStatus,
    getAccessPathForCourse,
  ]);

  // Retry function for error states
  const retry = useCallback(() => {
    setError(null);
    fetchCourseData();
  }, [fetchCourseData]);

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    fetchCourseData(true);
  }, [fetchCourseData]);

  // Computed values
  // Enrollment must reflect an explicit enroll/apply action, not just that the
  // course content is viewable (e.g. free courses may expose previews).
  const isEnrolled = !!courseData?.userStatus?.isEnrolled;
  const canAccessContent = !!courseData?.userStatus?.canAccessContent;
  const isFree =
    (courseData?.course?.discountPrice || courseData?.course?.Price || 0) === 0;
  const coursePrice =
    courseData?.course?.discountPrice || courseData?.course?.Price || 0;
  const currency = courseData?.course?.Currency || "DZD";
  const hasError = !!error;
  const hasData = !!courseData;

  return {
    // Data
    courseData,
    courseId,

    // Loading states
    loading,
    enrolling,
    refetching,

    // Error handling
    error,
    hasError,
    retry,

    // Actions
    handleEnrollClick,
    refresh,

    // Computed values
    isEnrolled,
    canAccessContent,
    isFree,
    coursePrice,
    currency,
    hasData,

    // Payment status
    paymentStatus,

    // User status
    user,
    isAuth,
  };
};
