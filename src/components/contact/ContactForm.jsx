import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../AppContext";
import apiClient from "../../services/apiClient";
import PropTypes from "prop-types";

const ContactForm = ({
  context = "landing",
  courseId = null,
  programId = null,
  enableContextSelection = false,
  title = null,
  className = "",
  showTitle = true,
  onSuccess = null,
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();

  const canSelectContext = Boolean(
    enableContextSelection && context === "dashboard" && user,
  );
  const [selectedContext, setSelectedContext] = useState(context);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId);
  const [selectedProgramId, setSelectedProgramId] = useState(programId);
  const [profileLoading, setProfileLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);

  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    message: "",
    priority: "medium",
  });
  const post_link = user ? `/contact/auth-user` : `/contact`;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isRTL = i18n.language === "ar";

  // Keep local selection in sync when used as contextual (course/program) form.
  useEffect(() => {
    if (!canSelectContext) {
      setSelectedContext(context);
      setSelectedCourseId(courseId);
      setSelectedProgramId(programId);
    }
  }, [canSelectContext, context, courseId, programId]);

  // Lazy-load enrolled courses/programs when user selects a context that needs it.
  useEffect(() => {
    const needsCourses = canSelectContext && selectedContext === "course";
    const needsPrograms = canSelectContext && selectedContext === "program";
    if (!user?.id || (!needsCourses && !needsPrograms)) return;

    const load = async () => {
      try {
        setProfileLoading(true);
        const response = await apiClient.get(`/Users/${user.id}/Profile`);
        const courses = response.data?.data?.enrollments?.courses || [];
        const programs = response.data?.data?.applications?.programs || [];

        if (needsCourses) {
          setAvailableCourses(Array.isArray(courses) ? courses : []);
        }
        if (needsPrograms) {
          setAvailablePrograms(Array.isArray(programs) ? programs : []);
        }
      } catch {
        if (needsCourses) setAvailableCourses([]);
        if (needsPrograms) setAvailablePrograms([]);
      } finally {
        setProfileLoading(false);
      }
    };

    load();
  }, [canSelectContext, selectedContext, user?.id]);

  const effectiveContext = canSelectContext ? selectedContext : context;
  const effectiveCourseId = canSelectContext ? selectedCourseId : courseId;
  const effectiveProgramId = canSelectContext ? selectedProgramId : programId;

  const courseOptions = useMemo(() => {
    return (availableCourses || [])
      .map((enrollment) => {
        const course = enrollment?.Course;
        const id = enrollment?.CourseId || course?.id;
        const title =
          i18n.language === "ar" && course?.Title_ar
            ? course.Title_ar
            : course?.Title;
        return id
          ? { id, title: title || t("contact.course", "Course") }
          : null;
      })
      .filter(Boolean);
  }, [availableCourses, i18n.language, t]);

  const programOptions = useMemo(() => {
    return (availablePrograms || [])
      .map((application) => {
        const program = application?.Program;
        const id = application?.ProgramId || program?.id;
        const title =
          i18n.language === "ar" && (program?.title_ar || program?.Title_ar)
            ? program.title_ar || program.Title_ar
            : program?.title || program?.Title;
        return id
          ? { id, title: title || t("contact.program", "Program") }
          : null;
      })
      .filter(Boolean);
  }, [availablePrograms, i18n.language, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        context: effectiveContext,
        priority: formData.priority,
      };

      if (effectiveContext === "course" && effectiveCourseId) {
        payload.courseId = effectiveCourseId;
      }
      if (effectiveContext === "program" && effectiveProgramId) {
        payload.programId = effectiveProgramId;
      }

      const response = await apiClient.post(post_link, payload);

      setSuccess(true);
      setFormData({
        name: user ? `${user.firstName} ${user.lastName}` : "",
        email: user?.email || "",
        message: "",
        priority: "medium",
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t(
            "contact.errorSending",
            "Failed to send message. Please try again.",
          ),
      );
    } finally {
      setLoading(false);
    }
  };

  const getContextTitle = () => {
    switch (effectiveContext) {
      case "course":
        return title || t("contact.courseHelp", "Need help with this course?");
      case "program":
        return (
          title ||
          t("contact.programHelp", "Have questions about this program?")
        );
      case "dashboard":
        return title || t("contact.generalSupport", "Contact Support");
      default:
        return title || t("contact.getInTouch", "Get in Touch");
    }
  };

  const getContextSubtitle = () => {
    switch (effectiveContext) {
      case "course":
        return t(
          "contact.courseSubtitle",
          "Ask about course content, prerequisites, or any other questions you have.",
        );
      case "program":
        return t(
          "contact.programSubtitle",
          "Get answers about program requirements, application process, or scholarships.",
        );
      case "dashboard":
        return t(
          "contact.dashboardSubtitle",
          "Our support team is here to help you with any questions or issues.",
        );
      default:
        return t(
          "contact.landingSubtitle",
          "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
        );
    }
  };

  if (success) {
    return (
      <div className={`bg-transparent rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("contact.messageSent", "Message Sent Successfully!")}
          </h3>
          <p className="text-gray-600 mb-4">
            {t(
              "contact.thankYou",
              "Thank you for your message. We'll get back to you as soon as possible.",
            )}
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {t("contact.sendAnother", "Send Another Message")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-transparent rounded-lg shadow-sm p-6 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {showTitle && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {getContextTitle()}
          </h3>
          <p className="text-gray-600">{getContextSubtitle()}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {canSelectContext && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="concernContext"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("contact.concernType", "Concern type")}
              </label>
              <select
                id="concernContext"
                value={selectedContext}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedContext(value);
                  if (value !== "course") setSelectedCourseId(null);
                  if (value !== "program") setSelectedProgramId(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="dashboard">
                  {t("contact.concernGeneral", "General support")}
                </option>
                <option value="course">
                  {t("contact.concernCourse", "A course")}
                </option>
                <option value="program">
                  {t("contact.concernProgram", "A program")}
                </option>
              </select>
            </div>

            {selectedContext === "course" && (
              <div>
                <label
                  htmlFor="courseId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("contact.selectCourse", "Select course")}
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  id="courseId"
                  value={selectedCourseId || ""}
                  onChange={(e) => setSelectedCourseId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading || profileLoading}
                  required
                >
                  <option value="">
                    {profileLoading
                      ? t("contact.loading", "Loading...")
                      : t("contact.chooseCourse", "Choose a course")}
                  </option>
                  {courseOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedContext === "program" && (
              <div>
                <label
                  htmlFor="programId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("contact.selectProgram", "Select program")}
                  <span className="text-red-500"> *</span>
                </label>
                <select
                  id="programId"
                  value={selectedProgramId || ""}
                  onChange={(e) => setSelectedProgramId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading || profileLoading}
                  required
                >
                  <option value="">
                    {profileLoading
                      ? t("contact.loading", "Loading...")
                      : t("contact.chooseProgram", "Choose a program")}
                  </option>
                  {programOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("contact.name", "Full Name")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("contact.namePlaceholder", "Enter your full name")}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("contact.email", "Email Address")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t(
                "contact.emailPlaceholder",
                "Enter your email address",
              )}
              disabled={loading}
            />
          </div>
        </div>

        {(context === "dashboard" ||
          context === "course" ||
          context === "program") && (
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("contact.priority", "Priority")}
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="low">{t("contact.priorityLow", "Low")}</option>
              <option value="medium">
                {t("contact.priorityMedium", "Medium")}
              </option>
              <option value="high">{t("contact.priorityHigh", "High")}</option>
              <option value="urgent">
                {t("contact.priorityUrgent", "Urgent")}
              </option>
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("contact.message", "Your Message")}{" "}
            <span className="text-red-500">*</span>
          </label>

          <textarea
            id="message"
            name="message"
            required
            rows={5}
            maxLength={1000}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={t(
              "contact.messagePlaceholder",
              "Please describe your question or issue in detail...",
            )}
            disabled={loading}
          />

          <p className="text-xs text-gray-500 mt-1">
            {formData.message.length}/1000{" "}
            {t("contact.characters", "characters")}
          </p>
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !formData.name ||
            !formData.email ||
            !formData.message.trim()
          }
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("contact.sending", "Sending...")}
            </div>
          ) : (
            t("contact.sendMessage", "Send Message")
          )}
        </button>
      </form>

      {context === "landing" && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            {t("contact.responseTime", "We typically respond within 24 hours")}
          </p>
        </div>
      )}
    </div>
  );
};

ContactForm.propTypes = {
  context: PropTypes.oneOf(["landing", "dashboard", "course", "program"]),
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  programId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  enableContextSelection: PropTypes.bool,
  title: PropTypes.string,
  className: PropTypes.string,
  showTitle: PropTypes.bool,
};

export default ContactForm;
