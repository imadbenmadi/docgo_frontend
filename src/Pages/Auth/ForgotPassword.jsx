import { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState("input"); // input | options | email_sent | admin_sent | error

  // Step 1: Email input
  const [email, setEmail] = useState("");
  const [inputError, setInputError] = useState("");
  const [inputLoading, setInputLoading] = useState(false);

  // Step 2: Options and action state
  const [selectedOption, setSelectedOption] = useState(null); // "email" | "admin"
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Step 3: Email sent tracking
  const [tokenId, setTokenId] = useState(null);
  const [emailFailedOnce, setEmailFailedOnce] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  // Validate and proceed to options
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setInputError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setInputError(
        t("forgot_password.email_required", "Please enter your email address"),
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setInputError(
        t("forgot_password.invalid_email", "Invalid email address"),
      );
      return;
    }

    setInputLoading(true);
    try {
      // Just validate the email format by checking if we can proceed
      // We don't actually submit here - user chooses an option next
      setEmail(trimmed);
      setCurrentStep("options");
    } catch (err) {
      setInputError(
        t("forgot_password.validation_error", "Error validating email"),
      );
    } finally {
      setInputLoading(false);
    }
  };

  // Option 1: Send automated password reset email
  const handleSendEmail = async () => {
    setActionError("");
    setActionLoading(true);
    setSelectedOption("email");

    try {
      const response = await apiClient.post("/forgot-password/send-email", {
        email,
      });

      if (response.data.emailFailed) {
        setEmailFailedOnce(true);
        setCurrentStep("options");
        setActionError(
          t(
            "forgot_password.email_send_failed",
            "We couldn't send the email. Try requesting admin help instead.",
          ),
        );
      } else {
        setTokenId(response.data.tokenId);
        setCurrentStep("email_sent");
      }
    } catch (err) {
      setEmailFailedOnce(true);
      setActionError(
        err.response?.data?.message ||
          t(
            "forgot_password.email_error",
            "Failed to send reset email. Please try requesting admin help.",
          ),
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Option 2: Request admin help (manual)
  const handleRequestAdmin = async () => {
    setActionError("");
    setActionLoading(true);
    setSelectedOption("admin");

    try {
      await apiClient.post("/forgot-password/request-admin-help", { email });
      setCurrentStep("admin_sent");
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          t(
            "forgot_password.admin_error",
            "Failed to submit request. Please try again.",
          ),
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Resend email
  const handleResendEmail = async () => {
    setResendError("");
    setResendSuccess("");
    setResendLoading(true);

    try {
      await apiClient.post("/forgot-password/resend-email", { tokenId });
      setResendSuccess(
        t("forgot_password.resent_success", "Email resent successfully!"),
      );
      setTimeout(() => setResendSuccess(""), 3000);
    } catch (err) {
      setResendError(
        err.response?.data?.message ||
          t("forgot_password.resend_error", "Failed to resend email"),
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Go back to email input
  const handleBackToInput = () => {
    setEmail("");
    setCurrentStep("input");
    setSelectedOption(null);
    setActionError("");
    setInputError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
            <svg
              className="h-7 w-7 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3M5.25 10.5h13.5a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 011.5-1.5z"
              />
            </svg>
          </div>
        </div>

        {/* STEP 1: Email Input */}
        {currentStep === "input" && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
              {t("forgot_password.title", "Password Recovery")}
            </h2>
            <p className="text-sm text-gray-500 mb-6 text-center">
              {t(
                "forgot_password.subtitle",
                "Enter your email to recover your account",
              )}
            </p>

            {inputError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {inputError}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("forgot_password.email_label", "Email Address")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={inputLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                {inputLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {inputLoading
                  ? t("forgot_password.checking", "Checking...")
                  : t("forgot_password.continue", "Continue")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {t(
                "forgot_password.remember_password",
                "Remember your password?",
              )}{" "}
              <Link
                to="/Login"
                className="text-blue-600 hover:underline font-medium"
              >
                {t("forgot_password.login_link", "Sign in")}
              </Link>
            </p>
          </>
        )}

        {/* STEP 2: Choose Recovery Method */}
        {currentStep === "options" && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
              {t(
                "forgot_password.recovery_options",
                "How Do You Want to Recover?",
              )}
            </h2>
            <p className="text-sm text-gray-500 mb-2 text-center">
              {t("forgot_password.email_display", "Email")}:{" "}
              <span className="font-medium">{email}</span>
            </p>
            <p className="text-xs text-gray-400 mb-6 text-center">
              {t("forgot_password.choose_method", "Choose a recovery method")}
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {actionError}
              </div>
            )}

            <div className="space-y-3">
              {/* Option 1: Automated Email */}
              <button
                onClick={handleSendEmail}
                disabled={actionLoading}
                className="w-full p-4 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5 rounded-full border-2 border-blue-600 flex items-center justify-center flex-shrink-0">
                    {selectedOption === "email" && (
                      <div className="h-3 w-3 bg-blue-600 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {t("forgot_password.auto_email", "Reset via Email")}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {t(
                        "forgot_password.auto_email_desc",
                        "We'll send you a link to reset your password instantly",
                      )}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-2">
                      ✓ {t("forgot_password.fastest", "Fastest")}
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Admin Help */}
              <button
                onClick={handleRequestAdmin}
                disabled={actionLoading}
                className="w-full p-4 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50 rounded-lg transition text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5 rounded-full border-2 border-amber-600 flex items-center justify-center flex-shrink-0">
                    {selectedOption === "admin" && (
                      <div className="h-3 w-3 bg-amber-600 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {t("forgot_password.request_admin", "Request Admin Help")}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {t(
                        "forgot_password.request_admin_desc",
                        "An administrator will manually assist you with password recovery",
                      )}
                    </p>
                    <p className="text-xs text-amber-600 font-medium mt-2">
                      ⏱ {t("forgot_password.manual_process", "Manual process")}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleBackToInput}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition text-sm"
              >
                {t("forgot_password.back", "Back")}
              </button>
              <button
                onClick={
                  selectedOption === "email"
                    ? handleSendEmail
                    : handleRequestAdmin
                }
                disabled={!selectedOption || actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                {actionLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {actionLoading
                  ? t("forgot_password.processing", "Processing...")
                  : t("forgot_password.confirm", "Confirm")}
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Email Sent Successfully */}
        {currentStep === "email_sent" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="h-7 w-7 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {t("forgot_password.email_sent", "Reset Email Sent!")}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(
                "forgot_password.email_sent_desc",
                "We've sent a password reset link to",
              )}{" "}
              <span className="font-medium">{email}</span>
            </p>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-left">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>{t("forgot_password.tip", "Tip:")}</strong>{" "}
                {t(
                  "forgot_password.check_spam",
                  "Check your spam folder if you don't see the email in 5 minutes.",
                )}
              </p>
            </div>

            {resendError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {resendError}
              </div>
            )}

            {resendSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {resendSuccess}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                {resendLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {resendLoading
                  ? t("forgot_password.resending", "Resending...")
                  : t("forgot_password.resend_button", "Resend Email")}
              </button>
              <Link
                to="/Login"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition text-sm text-center"
              >
                {t("forgot_password.back_to_login", "Back to Sign In")}
              </Link>
            </div>
          </div>
        )}

        {/* STEP 4: Admin Request Sent */}
        {currentStep === "admin_sent" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="h-7 w-7 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {t("forgot_password.request_received", "Request Received")}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(
                "forgot_password.admin_will_help",
                "Your password recovery request has been submitted. An administrator will contact you shortly at",
              )}{" "}
              <span className="font-medium">{email}</span>
            </p>
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 text-left">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>{t("forgot_password.timeline", "Timeline:")}</strong>{" "}
                {t(
                  "forgot_password.timeline_desc",
                  "You should expect to hear from us within 24 hours during business days.",
                )}
              </p>
            </div>
            <Link
              to="/Login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition text-sm"
            >
              {t("forgot_password.back_to_login", "Back to Sign In")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
