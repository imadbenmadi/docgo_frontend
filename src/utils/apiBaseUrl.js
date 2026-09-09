/**
 * API origin, from VITE_API_URL.
 *
 * The localhost fallback is a development convenience only. Components also
 * read import.meta.env.VITE_API_URL directly, so .env must be present at build
 * time or those render "undefined/..." URLs.
 */

const FALLBACK = "http://localhost:3000";

export const getApiBaseUrl = () => {
  const configured = String(import.meta.env?.VITE_API_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (import.meta.env?.PROD) {
    // Shipping a build that quietly calls localhost is worse than shipping one
    // that says why it cannot work.
    console.error(
      "VITE_API_URL is not set. The site has no API to talk to. " +
        "Set it in .env before building for production.",
    );
  }
  return FALLBACK;
};

export const buildApiUrl = (path) => {
  if (!path) return null;

  const value = String(path);
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${base}${normalizedPath}`;
};
