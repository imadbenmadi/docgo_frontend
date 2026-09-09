/**
 * Where the API lives.
 *
 * This used to be a hardcoded `return "http://localhost:3000"`, and there was
 * no .env at all -- only .env.example. So two things were broken at once:
 *
 *   - a production build pointed at localhost, meaning the deployed site
 *     called whatever happened to be running on the visitor's own machine;
 *   - the many components that read `import.meta.env.VITE_API_URL` directly
 *     got undefined, and rendered image sources like
 *     "undefined/Courses_Pictures/x.png".
 *
 * The env variable decides. The localhost fallback applies only when nothing
 * is configured, which is a development convenience and not a deploy target.
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
