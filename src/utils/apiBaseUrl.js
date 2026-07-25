export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || "https://backend.healthpathglobal.com";
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
