import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import handleRegister, { validateFirstStep } from "../../API/Register";
import AnimatedSelect from "../../components/AnimatedSelect";
import Register_Step_2 from "./Register_Step_2";
import InlineLoading from "../../InlineLoading";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import loginImage from "../../assets/login.png";
const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const getSafeNextPath = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    if (!raw.startsWith("/")) return null;
    if (raw.startsWith("//")) return null;
    return raw;
  };

  const getRedirectTo = () => {
    const params = new URLSearchParams(location.search);
    const nextFromQuery =
      getSafeNextPath(params.get("next")) ||
      getSafeNextPath(params.get("from"));
    const nextFromStorage = getSafeNextPath(
      sessionStorage.getItem("postLoginRedirect"),
    );
    const candidate = nextFromQuery || nextFromStorage || "/";
    if (candidate.toLowerCase().startsWith("/register")) return "/";
    if (candidate.toLowerCase().startsWith("/login")) return "/";
    return candidate;
  };
  const { set_Auth, set_user } = useAppContext();
  const { t } = useTranslation();
  const backgroundImage = loginImage;
  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    studyDomain: "",
    phoneNumber: "",
    university: "",
    professionalStatus: "",
    academicStatus: "",
  });

  // Handle form field changes - use callback to prevent re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // Handle select changes - use callback to prevent re-renders
  const handleSelectChange = useCallback((name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // Handle first step submission
  const handleFirstStep = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic client-side validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError(t("auth.fillAllFields", "Please fill all required fields"));
      setLoading(false);
      return;
    }

    // Validate with backend
    const validation = await validateFirstStep({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });

    if (validation.success) {
      setStep(2);
    } else {
      setError(
        validation.message || t("auth.validation_failed", "Validation failed"),
      );
    }

    setLoading(false);
  };

  // Handle final submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      const r = await handleRegister({
        userData: formData,
        setAuth: set_Auth,
        setUser: set_user,
      });

      if (r.success) {
        setLoading(false);
        Swal.fire({
          title: t(
            "alerts.auth.registrationSuccessTitle",
            "Registration Successful",
          ),
          text: t(
            "alerts.auth.registrationSuccessText",
            "You are now registered. You can log in.",
          ),
          icon: "success",
          timerProgressBar: true,
          timer: 2000,
          allowEscapeKey: true,
        }).then(() => {
          const redirectTo = getRedirectTo();
          sessionStorage.removeItem("postLoginRedirect");
          navigate(redirectTo, { replace: true });
        });
      } else if (r.status === 410) {
        Swal.fire({
          title: t(
            "alerts.auth.registrationSuccessTitle",
            "Registration Successful",
          ),
          text: t("common.loginRequired", "You must log in"),
          icon: "success",
          confirmButtonText: t("common.ok", "OK"),
          timerProgressBar: true,
          timer: 2000,
          allowEscapeKey: true,
        }).then(() => {
          window.location.href = "/login";
        });
      } else setError(r.message || "Registration failed");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData, set_Auth, set_user, navigate],
  );
  const step_2 = useCallback(
    () => (
      <Register_Step_2
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        setStep={setStep}
        loading={loading}
        error={error}
        setError={setError}
        setLoading={setLoading}
        backgroundImage={backgroundImage}
        AnimatedSelect={AnimatedSelect}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData, handleChange, handleSelectChange, handleSubmit, loading, error],
  );

  // Render step 1 form
  const renderStep1Form = () => (
    <div className="w-full transition-all duration-300 ease-in-out">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {t("auth.register", "Create Account")}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          {t(
            "auth.registerSubtitle",
            "Join HealthPathGlobal and start your learning journey today.",
          )}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm sm:text-base">
          <div className="font-semibold mb-1">{t("auth.error", "Error")}</div>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleFirstStep} className="space-y-5">
        {/* First Name and Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("auth.firstName", "First Name")}
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("auth.lastName", "Last Name")}
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("auth.password", "Password")}
          </label>
          <input
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-2">
            {t("auth.passwordHint", "Must be at least 8 characters")}
          </p>
        </div>

        {/* Next Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <InlineLoading borderColor="white" /> Processing...
            </span>
          ) : (
            t("auth.continue", "Continue")
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t("or", "or")}</span>
        </div>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-gray-700">
          {t("auth.haveAccount", "Already have an account?")} {"  "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            {t("auth.signIn", "Sign in")}
          </a>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 lg:p-0">
      {/* Side Image - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center  relative overflow-hidden">
        {/* Simplified: Removed complex gradients and decorative blobs */}
        {/* Original had: bg-gradient-to-br from-blue-200 to-indigo-100 with blob shapes */}

        <div className="relative z-10 px-12 text-center max-w-md">
          <div className="mb-8">
            <img
              src={backgroundImage}
              alt="Register Visual"
              className="w-full h-auto max-h-96 object-contain rounded-2xl "
            />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-gray-900">
            {t("auth.register", "Get Started")}
          </h3>
          <p className="text-gray-600 text-lg">
            {t(
              "auth.registerSubtitle",
              "Learn from experts and advance your career with us",
            )}
          </p>
        </div>
      </div>

      {/* Registration Form Section - Simplified and centered */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 min-h-screen lg:min-h-auto">
        <div className="w-full max-w-md">
          <div className="transition-all duration-300 ease-in-out">
            {step === 1 ? renderStep1Form() : step_2()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
