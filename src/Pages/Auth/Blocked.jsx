import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaRedo,
  FaSignInAlt,
  FaHome,
} from "react-icons/fa";
import apiClient from "../../utils/apiClient";
import { useAppContext } from "../../AppContext";

const RECHECK_INTERVAL = 10;

const Blocked = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { contactInfo } = useAppContext();

  const [countdown, setCountdown] = useState(RECHECK_INTERVAL);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await apiClient.get("/check_Auth", {
        withCredentials: true,
        validateStatus: () => true,
      });
      if (res.status === 200 && res.data?.user) {
        navigate("/", { replace: true });
      }
    } catch {
      // ignore network errors
    } finally {
      setChecking(false);
    }
  }, [navigate, checking]);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          checkStatus();
          return RECHECK_INTERVAL;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [checkStatus]);

  const circumference = 2 * Math.PI * 24;
  const progress = circumference * (countdown / RECHECK_INTERVAL);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-white p-6">
      <div className="max-w-md w-full space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-5">
            <FaShieldAlt className="text-red-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("blocked.title", "Account Blocked")}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t(
              "blocked.message",
              "Your account has been temporarily suspended by an administrator. If you believe this is a mistake, please contact support.",
            )}
          </p>
        </div>

        {/* What to do */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">
            {t("blocked.whatToDo", "What you can do")}
          </p>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li className="flex items-start gap-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {t(
                "blocked.step1",
                "Contact our support team to understand the reason for the suspension.",
              )}
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {t(
                "blocked.step2",
                "If you believe this is a mistake, provide any relevant information to help resolve it.",
              )}
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {t(
                "blocked.step3",
                "This page will automatically check your account status every 10 seconds.",
              )}
            </li>
          </ul>
        </div>

        {/* Auto-check countdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke={checking ? "#f97316" : "#ef4444"}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
              {checking ? (
                <FaRedo className="text-orange-500 animate-spin text-xs" />
              ) : (
                countdown
              )}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">
              {t("blocked.autoCheck", "Auto-checking your status")}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {checking
                ? t("blocked.checking", "Verifying your account...")
                : t("blocked.nextCheck", "Next check in {{count}}s", {
                    count: countdown,
                  })}
            </p>
          </div>
          <button
            onClick={() => {
              setCountdown(RECHECK_INTERVAL);
              checkStatus();
            }}
            disabled={checking}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 transition-colors"
          >
            {t("blocked.checkNow", "Check now")}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {contactInfo?.email ? (
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors"
            >
              <FaEnvelope />
              {t("blocked.contactSupport", "Contact Support")}
            </a>
          ) : null}
          <Link
            to="/login"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
          >
            <FaSignInAlt />
            {t("blocked.backToLogin", "Back to Login")}
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
            title={t("blocked.goHome", "Go Home")}
          >
            <FaHome />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blocked;
