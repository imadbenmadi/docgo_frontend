import Swal from "sweetalert2";
import i18n from "../i18n";

/**
 * Helper function to show sweet alerts with i18n support
 * Automatically handles language-based text and RTL direction
 */
export const showAlert = async (options) => {
  const isRTL = i18n.language === "ar";

  // Default configuration
  const defaultConfig = {
    allowOutsideClick: true,
    allowEscapeKey: true,
    customClass: {
      popup: "rounded-lg shadow-xl",
      title: "text-lg font-semibold text-gray-900",
      content: "text-gray-600",
    },
  };

  // Translate title and text if they are translation keys
  const config = {
    ...defaultConfig,
    ...options,
    title: options.title || "",
    text: options.text || "",
    didOpen: (popup) => {
      popup.setAttribute("dir", isRTL ? "rtl" : "ltr");
      if (typeof options.didOpen === "function") {
        options.didOpen(popup);
      }
    },
  };

  return await Swal.fire(config);
};

/**
 * Show success alert
 */
export const showSuccess = async (titleKey, textKey = null, options = {}) => {
  const { t } = i18n;

  return showAlert({
    icon: "success",
    title: t(titleKey),
    text: textKey ? t(textKey) : "",
    confirmButtonColor: "#10b981",
    confirmButtonText: t("common.ok", "OK"),
    ...options,
  });
};

/**
 * Show error alert
 */
export const showError = async (titleKey, textKey = null, options = {}) => {
  const { t } = i18n;

  return showAlert({
    icon: "error",
    title: t(titleKey),
    text: textKey ? t(textKey) : "",
    confirmButtonColor: "#ef4444",
    confirmButtonText: t("common.ok", "OK"),
    ...options,
  });
};

/**
 * Show info alert
 */
export const showInfo = async (titleKey, textKey = null, options = {}) => {
  const { t } = i18n;

  return showAlert({
    icon: "info",
    title: t(titleKey),
    text: textKey ? t(textKey) : "",
    confirmButtonColor: "#3b82f6",
    confirmButtonText: t("common.ok", "OK"),
    ...options,
  });
};

/**
 * Show warning alert
 */
export const showWarning = async (titleKey, textKey = null, options = {}) => {
  const { t } = i18n;

  return showAlert({
    icon: "warning",
    title: t(titleKey),
    text: textKey ? t(textKey) : "",
    confirmButtonColor: "#f59e0b",
    confirmButtonText: t("common.ok", "OK"),
    ...options,
  });
};

/**
 * Show confirmation dialog
 */
export const showConfirmation = async (
  titleKey,
  textKey = null,
  options = {},
) => {
  const { t } = i18n;

  return showAlert({
    icon: "warning",
    title: t(titleKey),
    text: textKey ? t(textKey) : "",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: t("common.yes", "Yes"),
    cancelButtonText: t("common.cancel", "Cancel"),
    ...options,
  });
};

/**
 * Show enrollment success
 */
export const showEnrollmentSuccess = async () => {
  const { t } = i18n;

  return showSuccess(
    "alerts.enrollment.successTitle",
    "alerts.enrollment.successText",
    {
      confirmButtonText: t("alerts.enrollment.startLearning", "Start Learning"),
    },
  );
};

/**
 * Show enrollment error
 */
export const showEnrollmentError = async (errorMessage = null) => {
  const { t } = i18n;

  return showError("alerts.enrollment.failedTitle", null, {
    text:
      errorMessage ||
      t(
        "alerts.enrollment.failedText",
        "Could not enroll in the course. Please try again.",
      ),
  });
};

/**
 * Show application success
 */
export const showApplicationSuccess = async () => {
  const { t } = i18n;

  return showSuccess(
    "alerts.application.successTitle",
    "alerts.application.successText",
    {
      confirmButtonText: t(
        "alerts.application.viewApplications",
        "View applications",
      ),
    },
  );
};

/**
 * Show application error
 */
export const showApplicationError = async (errorMessage = null) => {
  const { t } = i18n;

  return showError("alerts.application.failedTitle", null, {
    text:
      errorMessage ||
      t(
        "alerts.application.failedText",
        "Could not submit your application for the program. Please try again.",
      ),
  });
};

/**
 * Show payment pending
 */
export const showPaymentPending = async (transactionId) => {
  const { t } = i18n;

  return showInfo("alerts.payment.pendingTitle", null, {
    html: `${t("alerts.payment.pendingText", "Your payment is currently being reviewed by our administration team.")}<br/><br/>
           <strong>${t("alerts.payment.transactionId", "Transaction ID:")}</strong> ${transactionId}<br/><br/>
           ${t("common.waitingForApproval", "Vous serez notifié une fois approuvé")}`,
    confirmButtonText: t("common.ok", "OK"),
  });
};

/**
 * Show certificate generating
 */
export const showCertificateGenerating = async () => {
  const { t } = i18n;

  return showAlert({
    title: t("alerts.certificate.generatingTitle", "Generating Certificate"),
    html: t(
      "alerts.certificate.generatingText",
      "Please wait while your certificate is being created...",
    ),
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: (modal) => {
      Swal.showLoading();
    },
  });
};

/**
 * Show quiz incomplete
 */
export const showQuizIncomplete = async () => {
  const { t } = i18n;

  return showWarning(
    "alerts.quiz.incompleteTitle",
    "alerts.quiz.incompleteText",
  );
};

/**
 * Show quiz success
 */
export const showQuizSuccess = async (score) => {
  const { t } = i18n;

  const passText = t(
    "alerts.quiz.passText",
    "You scored {{score}}%. You can now obtain your certificate.",
  ).replace("{{score}}", score);

  return showSuccess("alerts.quiz.successTitle", null, {
    html: `<strong>${passText}</strong>`,
    confirmButtonText: t("alerts.quiz.viewResults", "View my results"),
  });
};

/**
 * Show quiz fail
 */
export const showQuizFail = async (score) => {
  const { t } = i18n;

  const failText = t(
    "alerts.quiz.failText",
    "You scored {{score}}%. At least 50% is needed to unlock the certificate.",
  ).replace("{{score}}", score);

  return showInfo("alerts.quiz.failTitle", null, {
    html: failText,
    confirmButtonText: t("alerts.quiz.viewResults", "View my results"),
  });
};

/**
 * Show simple text alert (without translation)
 * Use this for direct text messages, not translation keys
 */
export const showSimpleAlert = async (title, text = "", type = "info") => {
  return showAlert({
    icon: type,
    title: title,
    html: text,
    confirmButtonColor:
      type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#3b82f6",
    confirmButtonText: "OK",
  });
};

/**
 * Show simple success message (without translation)
 */
export const showSimpleSuccess = async (message) => {
  return showSimpleAlert("Success", message, "success");
};

/**
 * Show simple error message (without translation)
 */
export const showSimpleError = async (message) => {
  return showSimpleAlert("Error", message, "error");
};

/**
 * Show simple info message (without translation)
 */
export const showSimpleInfo = async (message) => {
  return showSimpleAlert("Information", message, "info");
};

/**
 * Close alert
 */
export const closeAlert = () => {
  Swal.close();
};

export default {
  showAlert,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showConfirmation,
  showEnrollmentSuccess,
  showEnrollmentError,
  showApplicationSuccess,
  showApplicationError,
  showPaymentPending,
  showCertificateGenerating,
  showQuizIncomplete,
  showQuizSuccess,
  showQuizFail,
  closeAlert,
};
