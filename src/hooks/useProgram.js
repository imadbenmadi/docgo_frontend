import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { clientProgramsAPI } from "../API/Programs";
import { useAppContext } from "../AppContext";
import apiClient from "../utils/apiClient";

export const useProgram = (programId) => {
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [refetching, setRefetching] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // pending, approved, rejected, null

  const navigate = useNavigate();
  const { isAuth, user } = useAppContext();
  const { t } = useTranslation();
  const abortControllerRef = useRef(null);

  // Check payment application status
  const checkPaymentStatus = useCallback(async () => {
    if (!isAuth || !programId) return;

    try {
      const response = await apiClient.get(
        `/user-payments/check-application/program/${programId}`,
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
    } catch {
      setPaymentStatus(null);
    }
  }, [isAuth, programId]);

  // Check enrollment/application status for this program (if backend didn't include it)
  const checkEnrollmentStatus = useCallback(
    async (currentProgramData) => {
      if (!isAuth || !user?.id || !programId) return;

      try {
        // If programData already includes userStatus, respect it
        if (currentProgramData?.userStatus) return;

        // Use apiClient (goes through Vite proxy → same-origin, cookies always work)
        const resp = await apiClient.get("/Users/programs/my-applications");
        const apps = Array.isArray(resp.data?.data)
          ? resp.data.data
          : resp.data?.data?.applications || [];

        // Find program application by ProgramId or nested Program id
        const app = apps.find(
          (a) =>
            String(a?.ProgramId) === String(programId) ||
            String(a?.Program?.id) === String(programId),
        );

        if (app) {
          setProgramData((prev) => ({
            ...prev,
            userStatus: {
              hasApplied: true,
              applicationStatus: app.status || "pending",
              application: app,
            },
          }));
        }
      } catch {
        return;
      }
    },
    [isAuth, user?.id, programId],
  );

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchProgramData = useCallback(
    async (showRefetching = false) => {
      if (!programId) return;

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

        const response = await clientProgramsAPI.getProgramDetails(programId);

        // Normalize program data structure
        if (response && response.program) {
          // Ensure requirements is an array if it exists
          if (response.program.requirements) {
            if (typeof response.program.requirements === "string") {
              try {
                response.program.requirements = JSON.parse(
                  response.program.requirements,
                );
              } catch {
                response.program.requirements = [response.program.requirements];
              }
            }
            if (!Array.isArray(response.program.requirements)) {
              response.program.requirements = [response.program.requirements];
            }
          } else {
            response.program.requirements = [];
          }
        }

        setProgramData(response);

        // Check payment status after loading program data
        await checkPaymentStatus();

        // If backend didn't return userStatus, try fetching user's applications
        await checkEnrollmentStatus(response);
      } catch (err) {
        // Don't set error if request was aborted
        if (err.name === "AbortError") {
          return;
        }

        // More specific error messages
        let errorMessage = "Failed to load program details. Please try again.";
        if (err.response?.status === 404) {
          errorMessage =
            "Program not found. It may have been removed or doesn't exist.";
        } else if (err.response?.status === 403) {
          errorMessage = "You don't have permission to access this program.";
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
    [programId, checkPaymentStatus, checkEnrollmentStatus],
  );

  // Initial fetch effect
  useEffect(() => {
    fetchProgramData();

    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProgramData]);

  // Standalone enrollment check: runs whenever auth/user becomes available
  // so that if the program loaded before the session cookie was confirmed,
  // we still detect the existing application.
  useEffect(() => {
    if (isAuth && user?.id && programData && !programData.userStatus) {
      checkEnrollmentStatus(programData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, user?.id, programData?.program?.id]);

  // Separate function for paid program application
  const handlePaidProgramApplication = useCallback(() => {
    navigate(`/payment/program/${programId}`, {
      state: {
        program: programData?.program,
        enrollmentType: "program",
      },
    });
  }, [navigate, programId, programData]);

  // Separate function for free program application
  const handleFreeProgramApplication = useCallback(async () => {
    try {
      setApplying(true);

      const response = await apiClient.post(
        "/enrollment/programs/enroll-free",
        {
          programId: programId,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to enroll");
      }

      // Refresh program data if needed
      await fetchProgramData(true);

      // Show success message
      await Swal.fire({
        title: t("alerts.application.enrolledTitle", "Enrolled Successfully"),
        text: t(
          "alerts.application.enrolledText",
          "Congratulations! You are enrolled in the program.",
        ),
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: t(
          "alerts.application.goToMyPrograms",
          "Go to My Programs",
        ),
        customClass: {
          popup: "rounded-lg shadow-xl",
          title: "text-lg font-semibold text-gray-900",
          content: "text-gray-600",
        },
      });

      // Navigate to my programs page
      navigate("/dashboard/my-programs");
    } catch (error) {
      let errorMessage =
        "Failed to submit application for the program. Please try again.";

      // Handle specific error cases
      if (error.response?.status === 409) {
        errorMessage = "You have already applied for this program.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to apply for this program.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      await Swal.fire({
        title: t("alerts.application.failedTitle", "Application Failed"),
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "rounded-lg shadow-xl",
          title: "text-lg font-semibold text-gray-900",
          content: "text-gray-600",
        },
      });
    } finally {
      setApplying(false);
    }
  }, [programId, fetchProgramData, navigate, t]);

  // Enhanced application handler with better error handling and UX
  const handleApplyClick = useCallback(async () => {
    // Check authentication first
    if (!isAuth || !user) {
      const result = await Swal.fire({
        title: t("alerts.auth.authRequiredTitle", "Authentication Required"),
        text: t(
          "alerts.auth.authRequiredText",
          "Please log in to apply for this program",
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

    // Check if already applied (do not block re-apply when status is rejected)
    if (
      programData?.userStatus?.hasApplied &&
      programData.userStatus.applicationStatus !== "rejected"
    ) {
      const status = programData.userStatus.applicationStatus;

      if (status === "approved") {
        await Swal.fire({
          title: t(
            "alerts.application.alreadyEnrolledTitle",
            "Already Enrolled",
          ),
          text: t(
            "alerts.application.alreadyEnrolledText",
            "You are already enrolled in this program",
          ),
          icon: "info",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: t(
            "alerts.application.goToMyPrograms",
            "Go to My Programs",
          ),
          customClass: {
            popup: "rounded-lg shadow-xl",
            title: "text-lg font-semibold text-gray-900",
            content: "text-gray-600",
          },
        });
      } else {
        await Swal.fire({
          title: t("alerts.application.alreadyAppliedTitle", "Already Applied"),
          text: `${t("common.applicationStatus", "Your application status is:")} ${status}`,
          icon: "info",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: t(
            "alerts.application.goToMyPrograms",
            "Go to My Programs",
          ),
          customClass: {
            popup: "rounded-lg shadow-xl",
            title: "text-lg font-semibold text-gray-900",
            content: "text-gray-600",
          },
        });
      }

      navigate("/dashboard/my-programs");
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
          navigate(`/payment/program/${programId}`, {
            state: {
              program: programData?.program,
              enrollmentType: "program",
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
          confirmButtonText: t(
            "alerts.payment.submitNew",
            "Submit new payment",
          ),
          cancelButtonText: t("common.cancel", "Cancel"),
        });

        if (result.isConfirmed) {
          navigate(`/payment/program/${programId}`, {
            state: {
              program: programData?.program,
              enrollmentType: "program",
            },
          });
        }
        return;
      }
    }

    // Get program price
    const programPrice = parseFloat(
      programData?.program?.discountPrice ||
        programData?.program?.price ||
        programData?.program?.Price ||
        0,
    );

    if (programPrice === 0) {
      // Handle free program application
      await handleFreeProgramApplication();
    } else {
      // Handle paid program - redirect to payment
      handlePaidProgramApplication();
    }
  }, [
    isAuth,
    user,
    programData,
    navigate,
    handleFreeProgramApplication,
    handlePaidProgramApplication,
    paymentStatus,
    programId,
    t,
  ]);

  // Retry function for error states
  const retry = useCallback(() => {
    setError(null);
    fetchProgramData();
  }, [fetchProgramData]);

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    fetchProgramData(true);
  }, [fetchProgramData]);

  // Computed values
  const applicationStatus = programData?.userStatus?.applicationStatus || null;
  // Treat a rejected application as re-applicable (legacy admin-unassign used to set rejected)
  const hasApplied =
    (programData?.userStatus?.hasApplied || false) &&
    applicationStatus !== "rejected";
  const isFree =
    (programData?.program?.discountPrice ||
      programData?.program?.price ||
      programData?.program?.Price ||
      0) === 0;
  const programPrice =
    programData?.program?.discountPrice ||
    programData?.program?.price ||
    programData?.program?.Price ||
    0;
  const hasError = !!error;
  const hasData = !!programData;

  return {
    // Data
    programData,
    programId,

    // Loading states
    loading,
    applying,
    refetching,

    // Error handling
    error,
    hasError,
    retry,

    // Actions
    handleApplyClick,
    refresh,

    // Computed values
    hasApplied,
    applicationStatus,
    isFree,
    programPrice,
    hasData,

    // Payment status
    paymentStatus,

    // User status
    user,
    isAuth,
  };
};
