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

/**
 * The URL of a product's introductory video or image.
 *
 * Addressed by product and id, never by the stored filename. The stored path
 * says where the file was put, which is not the same question as where it can
 * be read from: a video uploaded while the platform was storing to Bunny lives
 * on the CDN behind a signed URL, and one uploaded before that is on the
 * server's disk. The server answers this route by asking the row, so the page
 * does not have to know or care which.
 *
 * It also sidesteps a second problem: the old URLs pointed into /storage,
 * which Apache refuses outright in production.
 *
 * @param {"course"|"program"|"cv"|"internship"} product
 * @param {string|number} id
 * @param {"video"|"image"} kind
 */
export const introMediaUrl = (product, id, kind = "video") => {
  if (!product || id === undefined || id === null || id === "") return null;
  return buildApiUrl(`/public/intro/${product}/${encodeURIComponent(id)}/${kind}`);
};
