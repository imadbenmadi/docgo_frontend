import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const token = searchParams.get("token");

  const [stage, setStage] = useState("validating"); // validating | ready | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStage("error");
        setErrorMessage(
          t("reset_password.no_token", "No reset token provided"),
        );
        return;
      }

      try {
        const response = await apiClient.get(
          `/reset-password-with-token/validate-token/${token}`,
        );
        if (response.data.valid) {
          setEmail(response.data.email);
          setStage("ready");
        } else {
          setStage("error");
          setErrorMessage(
            response.data.message ||
              t("reset_password.invalid_token", "Invalid or expired token"),
          );
        }
      } catch (err) {
        setStage("error");
        setErrorMessage(
          err.response?.data?.message ||
            t("reset_password.validation_failed", "Failed to validate token"),
        );
      }
    };

    validateToken();
  }, [token, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate form
    if (!formData.newPassword || !formData.confirmPassword) {
      setErrorMessage(
        t("reset_password.all_fields_required", "Please fill in all fields"),
      );
      return;
    }

    if (formData.newPassword.length < 8) {
      setErrorMessage(
        t(
          "reset_password.password_too_short",
          "Password must be at least 8 characters",
        ),
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage(
        t("reset_password.passwords_not_match", "Passwords do not match"),
      );
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/reset-password-with-token", {
        token,
        newPassword: formData.newPassword,
      });
      setStage("success");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          t("reset_password.reset_failed", "Failed to reset password"),
      );
    } finally {
      setLoading(false);
    }
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

        {stage === "validating" && (
          // Loading state
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
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
            </div>
            <p className="text-gray-600">
              {t("reset_password.validating", "Validating your reset link...")}
            </p>
          </div>
        )}

        {stage === "ready" && (
          // Form state
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
              {t("reset_password.title", "Reset Your Password")}
            </h2>
            <p className="text-sm text-gray-500 mb-2 text-center">
              {t(
                "reset_password.subtitle",
                "Enter a new password for your account",
              )}
            </p>
            <p className="text-xs text-gray-400 mb-6 text-center">
              {t("reset_password.email_display", "Email")}: {email}
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("reset_password.new_password", "New Password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M15.171 13.576l1.414 1.414A10.015 10.015 0 0120.542 10c-1.274-4.057-5.064-7-9.542-7a9.948 9.948 0 00-1.528.119l2.36 2.36a4 4 0 01.734 5.997z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t(
                    "reset_password.password_requirement",
                    "Minimum 8 characters",
                  )}
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("reset_password.confirm_password", "Confirm Password")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M15.171 13.576l1.414 1.414A10.015 10.015 0 0120.542 10c-1.274-4.057-5.064-7-9.542 7a9.948 9.948 0 00-1.528.119l2.36 2.36a4 4 0 01.734 5.997z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                {loading && (
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
                {loading
                  ? t("reset_password.resetting", "Resetting...")
                  : t("reset_password.reset_button", "Reset Password")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {t("reset_password.remember_password", "Remember your password?")}{" "}
              <Link
                to="/Login"
                className="text-blue-600 hover:underline font-medium"
              >
                {t("reset_password.login_link", "Sign in")}
              </Link>
            </p>
          </>
        )}

        {stage === "success" && (
          // Success state
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
              {t("reset_password.success_title", "Password Reset Successful!")}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t(
                "reset_password.success_message",
                "Your password has been successfully reset. You can now sign in with your new password.",
              )}
            </p>
            <button
              onClick={() => navigate("/Login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition text-sm mt-4"
            >
              {t("reset_password.go_to_login", "Go to Sign In")}
            </button>
          </div>
        )}

        {stage === "error" && (
          // Error state
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="h-7 w-7 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {t("reset_password.error_title", "Reset Link Invalid")}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {errorMessage ||
                t(
                  "reset_password.error_message",
                  "The password reset link is invalid or has expired.",
                )}
            </p>
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition text-sm"
              >
                {t(
                  "reset_password.request_new_link",
                  "Request a New Reset Link",
                )}
              </Link>
              <Link
                to="/Login"
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition text-sm"
              >
                {t("reset_password.back_to_login", "Back to Sign In")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
