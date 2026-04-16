import {
  ExclamationTriangleIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAppContext } from "../../AppContext";
import apiClient from "../../services/apiClient";
import { Countries } from "../../data/Countries";
import { StudyDomains } from "../../data/fields";

//  helpers
const InputRow = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const SectionCard = ({ icon: Icon, title, subtitle, accent, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={`px-6 py-4 border-b border-gray-100 ${accent}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/80">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Spinner = () => (
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
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
//

const UserSettings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, set_user, store_logout } = useAppContext();
  const isRTL = i18n.language === "ar";

  //  profile
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    studyDomain: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  //  password
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  //  delete
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  //  i18n helper
  const localized = (str) => {
    if (!str || !str.includes(" / ")) return str || "";
    const [fr, ar] = str.split(" / ");
    return i18n.language === "ar" ? ar : fr;
  };

  // seed form from context
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        studyDomain: user.studyDomain || "",
      });
    }
  }, [user]);

  //  profile save
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.firstName?.trim() || profile.firstName.trim().length < 3)
      return Swal.fire({
        icon: "warning",
        title: t("settings.validationError", "Validation error"),
        text: t(
          "settings.firstNameMin",
          "First name must be at least 3 characters.",
        ),
      });
    if (!profile.lastName?.trim() || profile.lastName.trim().length < 3)
      return Swal.fire({
        icon: "warning",
        title: t("settings.validationError", "Validation error"),
        text: t(
          "settings.lastNameMin",
          "Last name must be at least 3 characters.",
        ),
      });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email?.trim() || ""))
      return Swal.fire({
        icon: "warning",
        title: t("settings.validationError", "Validation error"),
        text: t("settings.invalidEmail", "Please enter a valid email."),
      });

    setProfileSaving(true);
    try {
      const res = await apiClient.put(`/Users/${user.id}/Profile`, profile);
      const updated = res.data?.user;
      if (updated) {
        const merged = { ...user, ...updated };
        set_user(merged);
        try {
          localStorage.setItem("user", JSON.stringify(merged));
          sessionStorage.setItem("user", JSON.stringify(merged));
        } catch {}
      }
      Swal.fire({
        icon: "success",
        title: t("settings.saved", "Saved!"),
        text: t("settings.profileSaved", "Profile updated successfully."),
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("settings.error", "Error"),
        text:
          err.response?.data?.message ||
          err.response?.data?.error ||
          t("settings.saveFailed", "Failed to save changes."),
      });
    } finally {
      setProfileSaving(false);
    }
  };

  //  password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwd.currentPassword)
      return Swal.fire({
        icon: "warning",
        title: t("settings.validationError", "Validation error"),
        text: t(
          "settings.currentPasswordRequired",
          "Current password is required.",
        ),
      });
    if (pwd.newPassword.length < 8)
      return Swal.fire({
        icon: "warning",
        title: t("settings.validationError", "Validation error"),
        text: t(
          "settings.passwordMin",
          "New password must be at least 8 characters.",
        ),
      });
    if (pwd.newPassword !== pwd.confirmPassword)
      return Swal.fire({
        icon: "warning",
        title: t("settings.validationError", "Validation error"),
        text: t("settings.passwordMismatch", "New passwords do not match."),
      });

    setPwdSaving(true);
    try {
      await apiClient.put(`/Users/${user.id}/change-password`, {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setPwd({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      Swal.fire({
        icon: "success",
        title: t("settings.saved", "Saved!"),
        text: t("settings.passwordChanged", "Password changed successfully."),
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: t("settings.error", "Error"),
        text:
          err.response?.data?.message ||
          err.response?.data?.error ||
          t("settings.passwordChangeFailed", "Failed to change password."),
      });
    } finally {
      setPwdSaving(false);
    }
  };

  //  delete account request
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE")
      return Swal.fire({
        icon: "warning",
        title: t("settings.validationError", "Validation error"),
        text: t(
          "settings.typeDeleteToConfirm",
          'Please type "DELETE" to confirm.',
        ),
      });

    const result = await Swal.fire({
      icon: "warning",
      title: t("settings.deleteAccountTitle", "Request account deletion?"),
      html: t(
        "settings.deleteAccountWarning",
        "A deletion request will be sent to the administrator. Your account will remain active until an admin reviews and approves the request.",
      ),
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t(
        "settings.yesRequestDelete",
        "Yes, request deletion",
      ),
      cancelButtonText: t("common.cancel", "Cancel"),
    });
    if (!result.isConfirmed) return;

    setDeleting(true);
    try {
      await apiClient.post(`/Users/${user.id}/delete-request`);
      setDeleteConfirmText("");
      await Swal.fire({
        icon: "success",
        title: t("settings.deleteRequestSent", "Request submitted"),
        html: t(
          "settings.deleteRequestSentText",
          "Your account deletion request has been submitted.<br><br>An administrator will review it and contact you if needed. Your account remains active in the meantime.",
        ),
        confirmButtonColor: "#2563eb",
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      if (err.response?.status === 409) {
        Swal.fire({
          icon: "info",
          title: t("settings.requestAlreadyPending", "Request already pending"),
          text:
            msg ||
            t(
              "settings.deletePendingText",
              "You already have a pending deletion request. Please wait for admin review.",
            ),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: t("settings.error", "Error"),
          text:
            msg ||
            t("settings.deleteFailed", "Failed to submit deletion request."),
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  //  password strength
  const pwdStrength = (() => {
    const p = pwd.newPassword;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1)
      return {
        label: t("settings.pwdWeak", "Weak"),
        color: "bg-red-500",
        w: "25%",
      };
    if (s <= 2)
      return {
        label: t("settings.pwdFair", "Fair"),
        color: "bg-yellow-400",
        w: "50%",
      };
    if (s <= 3)
      return {
        label: t("settings.pwdGood", "Good"),
        color: "bg-blue-400",
        w: "75%",
      };
    return {
      label: t("settings.pwdStrong", "Strong"),
      color: "bg-green-500",
      w: "100%",
    };
  })();

  //
  return (
    <div
      className={`max-w-2xl mx-auto px-4 py-8 space-y-6 ${isRTL ? "rtl" : "ltr"}`}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("settings.title", "Settings")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t(
            "settings.subtitle",
            "Manage your account preferences and security.",
          )}
        </p>
      </div>

      {/*  Profile  */}
      <SectionCard
        icon={UserCircleIcon}
        title={t("settings.profileSection", "Profile Information")}
        subtitle={t("settings.profileSubtitle", "Update your personal details")}
        accent="bg-blue-50"
      >
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputRow label={t("editProfile.firstName", "First Name")} required>
              <input
                className={inputCls}
                name="firstName"
                value={profile.firstName}
                onChange={handleProfileChange}
                minLength={3}
                maxLength={30}
              />
            </InputRow>
            <InputRow label={t("editProfile.lastName", "Last Name")} required>
              <input
                className={inputCls}
                name="lastName"
                value={profile.lastName}
                onChange={handleProfileChange}
                minLength={3}
                maxLength={30}
              />
            </InputRow>
          </div>

          <InputRow label={t("editProfile.email", "Email Address")} required>
            <input
              className={inputCls}
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
            />
          </InputRow>

          <InputRow label={t("editProfile.phoneNumber", "Phone Number")}>
            <input
              className={inputCls}
              type="tel"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleProfileChange}
              placeholder="+213 xxx xxx xxx"
            />
          </InputRow>

          <InputRow label={t("editProfile.country", "Country")}>
            <select
              className={inputCls}
              name="country"
              value={profile.country}
              onChange={handleProfileChange}
            >
              <option value="">
                {t("register.selectCountry", "Select Country")}
              </option>
              {Countries.map((c) => (
                <option key={c} value={c}>
                  {localized(c)}
                </option>
              ))}
            </select>
          </InputRow>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputRow label={t("editProfile.studyDomain", "Study Domain")}>
              <select
                className={inputCls}
                name="studyDomain"
                value={profile.studyDomain}
                onChange={handleProfileChange}
              >
                <option value="">
                  {t("editProfile.selectStudyDomain", "Select Domain")}
                </option>
                {StudyDomains.map((f) => (
                  <option key={f} value={f}>
                    {localized(f)}
                  </option>
                ))}
              </select>
            </InputRow>
            <InputRow label={t("editProfile.studyDomain", "Study Domain")}>
              <select
                className={inputCls}
                name="studyDomain"
                value={profile.studyDomain}
                onChange={handleProfileChange}
              >
                <option value="">
                  {t("editProfile.selectStudyDomain", "Select Domain")}
                </option>
                {StudyDomains.map((d) => (
                  <option key={d} value={d}>
                    {localized(d)}
                  </option>
                ))}
              </select>
            </InputRow>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
            >
              {profileSaving && <Spinner />}
              {profileSaving
                ? t("settings.saving", "Saving...")
                : t("editProfile.saveChanges", "Save Changes")}
            </button>
          </div>
        </form>
      </SectionCard>

      {/*  Security  */}
      <SectionCard
        icon={KeyIcon}
        title={t("settings.securitySection", "Security")}
        subtitle={t("settings.securitySubtitle", "Change your password")}
        accent="bg-purple-50"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <InputRow
            label={t("settings.currentPassword", "Current Password")}
            required
          >
            <div className="relative">
              <input
                className={inputCls + " pr-16"}
                type={showPwd.current ? "text" : "password"}
                value={pwd.currentPassword}
                autoComplete="current-password"
                onChange={(e) =>
                  setPwd((p) => ({
                    ...p,
                    currentPassword: e.target.value,
                  }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setShowPwd((s) => ({
                    ...s,
                    current: !s.current,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                {showPwd.current
                  ? t("settings.hide", "Hide")
                  : t("settings.show", "Show")}
              </button>
            </div>
          </InputRow>

          <InputRow label={t("settings.newPassword", "New Password")} required>
            <div className="relative">
              <input
                className={inputCls + " pr-16"}
                type={showPwd.new ? "text" : "password"}
                value={pwd.newPassword}
                autoComplete="new-password"
                minLength={8}
                onChange={(e) =>
                  setPwd((p) => ({
                    ...p,
                    newPassword: e.target.value,
                  }))
                }
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                {showPwd.new
                  ? t("settings.hide", "Hide")
                  : t("settings.show", "Show")}
              </button>
            </div>
            {pwdStrength && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${pwdStrength.color}`}
                    style={{ width: pwdStrength.w }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t("settings.strength", "Strength")}:{" "}
                  <span className="font-medium">{pwdStrength.label}</span>
                </p>
              </div>
            )}
          </InputRow>

          <InputRow
            label={t("settings.confirmPassword", "Confirm New Password")}
            required
          >
            <div className="relative">
              <input
                className={`${inputCls} pr-16 ${pwd.confirmPassword && pwd.newPassword !== pwd.confirmPassword ? "border-red-400 focus:ring-red-400" : pwd.confirmPassword && pwd.newPassword === pwd.confirmPassword ? "border-green-400 focus:ring-green-400" : ""}`}
                type={showPwd.confirm ? "text" : "password"}
                value={pwd.confirmPassword}
                autoComplete="new-password"
                onChange={(e) =>
                  setPwd((p) => ({
                    ...p,
                    confirmPassword: e.target.value,
                  }))
                }
              />
              <button
                type="button"
                onClick={() =>
                  setShowPwd((s) => ({
                    ...s,
                    confirm: !s.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                {showPwd.confirm
                  ? t("settings.hide", "Hide")
                  : t("settings.show", "Show")}
              </button>
            </div>
            {pwd.confirmPassword && pwd.newPassword !== pwd.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {t("settings.passwordMismatch", "Passwords do not match.")}
              </p>
            )}
          </InputRow>

          <div className="flex items-center justify-between pt-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldCheckIcon className="h-4 w-4" />
              {t("settings.passwordHint", "Min 8 characters recommended.")}
            </span>
            <button
              type="submit"
              disabled={pwdSaving}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
            >
              {pwdSaving && <Spinner />}
              {pwdSaving
                ? t("settings.saving", "Saving...")
                : t("settings.changePassword", "Change Password")}
            </button>
          </div>
        </form>
      </SectionCard>

      {/*  Danger Zone  */}
      <SectionCard
        icon={ExclamationTriangleIcon}
        title={t("settings.dangerZone", "Danger Zone")}
        subtitle={t("settings.dangerSubtitle", "Irreversible account actions")}
        accent="bg-red-50"
      >
        <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-red-700">
            {t("settings.deleteAccountTitle", "Request Account Deletion")}
          </h3>
          <p className="text-xs text-red-600 leading-relaxed">
            {t(
              "settings.deleteAccountDesc",
              "Submitting this request will notify an administrator. Your account stays active until the admin reviews and approves the request. Once approved, all your data - enrollments, certificates and progress - will be permanently removed.",
            )}
          </p>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-700">
              <strong>Note :</strong>{" "}
              {t(
                "settings.deleteManualNote",
                "This process is manual. An administrator will review your request and may contact you before proceeding.",
              )}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-red-600 mb-1">
              {t(
                "settings.typeDeleteLabel",
                'Type "DELETE" to enable the button',
              )}
            </label>
            <input
              className="w-full sm:w-64 px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={deleteConfirmText !== "DELETE" || deleting}
            onClick={handleDeleteAccount}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition"
          >
            {deleting && <Spinner />}
            {deleting
              ? t("settings.submitting", "Submitting...")
              : t("settings.deleteAccountBtn", "Request Account Deletion")}
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default UserSettings;
