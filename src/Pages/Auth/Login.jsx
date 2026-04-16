import { useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import InlineLoading from "../../InlineLoading";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import apiClient from "../../utils/apiClient";
import loginImage from "../../assets/login.png";
import { getApiErrorMessage } from "../../utils/apiErrorTranslate";
const Login = () => {
  const backgroundImage = loginImage;
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { set_Auth, set_user, login } = useAppContext();

  const getSafeNextPath = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    if (!raw.startsWith("/")) return null;
    if (raw.startsWith("//")) return null;
    return raw;
  };

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const nextFromQuery =
      getSafeNextPath(params.get("next")) ||
      getSafeNextPath(params.get("from"));
    const nextFromState = getSafeNextPath(
      location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search || ""}${location.state.from.hash || ""}`
        : null,
    );
    const nextFromStorage = getSafeNextPath(
      sessionStorage.getItem("postLoginRedirect"),
    );

    const candidate = nextFromQuery || nextFromState || nextFromStorage || "/";
    if (candidate.toLowerCase().startsWith("/login")) return "/";
    if (candidate.toLowerCase().startsWith("/register")) return "/";
    return candidate;
  }, [location.search, location.state]);

  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // Handle login submission
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      // Basic validation
      if (!formData.email || !formData.password) {
        setError(t("auth.fillAllFields", "Please fill all required fields"));
        setLoading(false);
        return;
      }

      try {
        // Use centralized context login (sets storage + state)
        const result = await login(formData);
        if (result?.blocked) {
          navigate("/blocked", { replace: true });
          return;
        }
        if (result?.deleted) {
          navigate("/deleted", { replace: true });
          return;
        }
        if (!result?.success) {
          throw new Error(
            result?.message ||
              t("auth.loginError", "An error occurred during login"),
          );
        }

        Swal.fire({
          title: t("alerts.auth.successTitle", "Login Successful"),
          text: t("alerts.auth.successText", "You are now logged in."),
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          // allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          sessionStorage.removeItem("postLoginRedirect");
          navigate(redirectTo, { replace: true });
        });
      } catch (err) {
        setError(
          getApiErrorMessage(
            err,
            t,
            t("auth.loginError", "An error occurred during login"),
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, login, navigate, redirectTo, set_Auth, set_user, t],
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 lg:p-0">
      {/* Side Image - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center  relative overflow-hidden">
        {/* Simplified: Removed complex gradients and decorative blobs */}
        {/* Original had: bg-gradient-to-br from-blue-600 to-indigo-700 with absolute positioned blob animations */}

        <div className="relative z-10 px-12 text-center max-w-md">
          <div className="mb-8">
            <img
              src={backgroundImage}
              alt="Login Visual"
              className="w-full h-auto max-h-96 object-contain rounded-2xl "
            />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-gray-900">
            {t("auth.welcomeBack", "Welcome Back")}
          </h3>
          <p className="text-gray-600 text-lg">
            {t(
              "auth.registerSubtitle",
              "Join thousands of learners on their journey to success",
            )}
          </p>
        </div>
      </div>

      {/* Login Form Section - Simplified and centered */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 min-h-screen lg:min-h-auto">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {t("auth.login", "Sign In")}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              {t(
                "auth.loginSubtitle",
                "Welcome to HealthPathGlobal. Sign in to your account to continue.",
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm sm:text-base">
              <div className="font-semibold mb-1">
                {t("auth.error", "Error")}
              </div>
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("auth.email", "Email Address")}
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("auth.password", "Password")}
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {t("auth.forgotPassword", "Forgot Password?")}
                </a>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <InlineLoading borderColor="white" />{" "}
                  {t("auth.signingIn", "Signing in...")}
                </span>
              ) : (
                t("auth.signIn", "Sign In")
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t("or", "or")}
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-700">
              {t("auth.noAccount", "Don't have an account?")} {"  "}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {t("auth.signUp", "Sign up now")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
