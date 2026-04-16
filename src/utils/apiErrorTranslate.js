/**
 * Maps raw server error message strings to i18n translation keys.
 * Keys must match `apiErrors.*` in all locale files.
 *
 * Usage:
 *   import { translateApiError } from "../utils/apiErrorTranslate";
 *   toast.error(translateApiError(error.response?.data?.message, t));
 */

import i18next from "i18next";

// Maps server message (lowercase) translation key
const ERROR_KEY_MAP = {
  // Generic
  "server error": "apiErrors.serverError",
  "internal server error": "apiErrors.serverError",
  "an error occurred": "apiErrors.serverError",

  // Not found
  "not found": "apiErrors.notFound",
  "course not found": "apiErrors.courseNotFound",
  "program not found": "apiErrors.programNotFound",
  "user not found": "apiErrors.userNotFound",
  "login attempt not found": "apiErrors.notFound",
  "resource not found": "apiErrors.notFound",

  // Auth / access
  unauthorized: "apiErrors.unauthorized",
  "you are not authorized": "apiErrors.unauthorized",
  forbidden: "apiErrors.forbidden",
  "access denied": "apiErrors.forbidden",
  blocked: "apiErrors.blocked",
  "your account is blocked": "apiErrors.blocked",

  // Enrollment
  "already enrolled": "apiErrors.alreadyEnrolled",
  "already applied": "apiErrors.alreadyApplied",
  "not enrolled": "apiErrors.notEnrolled",

  // Payment
  "payment failed": "apiErrors.paymentFailed",
  "unable to process your payment": "apiErrors.paymentFailed",
  "payment not found": "apiErrors.paymentNotFound",
  "invalid payment": "apiErrors.paymentFailed",

  // Profile / upload
  "failed to upload": "apiErrors.failedToUpload",
  "failed to upload image": "apiErrors.failedToUpload",
  "failed to update profile": "apiErrors.failedToUpdate",
  "failed to update": "apiErrors.failedToUpdate",
  "failed to fetch profile data": "apiErrors.failedToLoad",
  "failed to save": "apiErrors.failedToUpdate",

  // Generic load
  "failed to load": "apiErrors.failedToLoad",
  "failed to load programs": "apiErrors.failedToLoad",
  "failed to load courses": "apiErrors.failedToLoad",

  // Network
  "network error": "apiErrors.networkError",
  "network error. please try again": "apiErrors.networkError",
  "please check your connection": "apiErrors.networkError",

  // Validation
  "no valid arrays provided": "apiErrors.validationError",
  "invalid login ids provided": "apiErrors.validationError",
  "validation error": "apiErrors.validationError",
  "no file uploaded": "apiErrors.noFileUploaded",
};

const looksInternal = (message) => {
  const m = String(message || "").toLowerCase();
  if (!m) return false;

  // Obvious stack traces / SQL / ORM leaks
  if (m.includes("sequelize")) return true;
  if (m.includes("sqlstate")) return true;
  if (m.includes("er_")) return true;
  if (m.includes("syntaxerror")) return true;
  if (m.includes("stack")) return true;
  if (m.includes(" at ") && m.includes(".js")) return true;
  if (m.includes("getaddrinfo")) return true;
  if (m.includes("econn")) return true;
  if (m.includes("etimedout")) return true;
  if (m.includes("enoent")) return true;
  if (m.includes("cannot ") && m.includes("undefined")) return true;

  // Too verbose / structured output usually means internal
  if (m.includes('{"')) return true;
  if (m.includes("\n")) return true;
  return false;
};

const isSafeToShowRaw = (rawMessage) => {
  if (!rawMessage) return false;
  const msg = String(rawMessage).trim();
  if (!msg) return false;

  // Keep it short and non-technical
  if (msg.length > 180) return false;
  if (looksInternal(msg)) return false;
  return true;
};

/**
 * Returns a translated error message from a raw server message string.
 * Falls back to the original message if no mapping is found,
 * or to a generic "unknown error" key if the message is empty.
 *
 * @param {string|undefined} rawMessage - The raw `error.response.data.message`
 * @param {Function} t - The react-i18next `t` function
 * @returns {string}
 */
export function translateApiError(rawMessage, t) {
  const tt = typeof t === "function" ? t : i18next.t.bind(i18next);
  if (!rawMessage)
    return tt(
      "apiErrors.unknown",
      "An unexpected error occurred. Please try again.",
    );

  const lower = rawMessage.toLowerCase().trim();

  // Exact match first
  if (ERROR_KEY_MAP[lower]) {
    return tt(ERROR_KEY_MAP[lower]);
  }

  // Partial match - check if any known phrase is contained in the message
  for (const [phrase, key] of Object.entries(ERROR_KEY_MAP)) {
    if (lower.includes(phrase)) {
      return tt(key);
    }
  }

  // No match - only show raw message if it's clearly safe for end-users.
  if (isSafeToShowRaw(rawMessage)) {
    return String(rawMessage);
  }

  return tt(
    "apiErrors.unknown",
    "An unexpected error occurred. Please try again.",
  );
}

/**
 * Extracts the best error message string from an axios error object.
 * Checks response.data.message response.data.error error.message generic key.
 *
 * @param {Error} error - The caught axios error
 * @param {Function} t - The react-i18next `t` function
 * @returns {string}
 */
export function getApiErrorMessage(error, t) {
  const raw =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    null;

  return translateApiError(raw, t);
}
