import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";

const toAbsoluteUrl = (maybeUrl) => {
  if (!maybeUrl) return null;
  try {
    // If it's already absolute, URL() will accept it.
    return new URL(maybeUrl).toString();
  } catch {
    // If relative, resolve against the configured site URL (if any).
    const siteUrl =
      import.meta.env.VITE_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    try {
      return new URL(maybeUrl, siteUrl).toString();
    } catch {
      return null;
    }
  }
};

export default function Seo({
  title,
  description,
  canonicalPath,
  image,
  noIndex = false,
  type = "website",
  lang,
  dir,
  locale,
  robots,
  jsonLd,
  siteName: siteNameProp,
}) {
  const siteName =
    siteNameProp || import.meta.env.VITE_SITE_NAME || "healthpathglobal";

  const canonical = canonicalPath
    ? toAbsoluteUrl(canonicalPath)
    : typeof window !== "undefined"
      ? window.location.href
      : null;

  const resolvedImage = toAbsoluteUrl(image);
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const resolvedLang =
    lang ||
    (typeof document !== "undefined"
      ? document.documentElement.lang
      : undefined);
  const resolvedDir =
    dir ||
    (resolvedLang && resolvedLang.toLowerCase().startsWith("ar")
      ? "rtl"
      : resolvedLang
        ? "ltr"
        : undefined);

  const resolvedRobots = robots
    ? robots
    : noIndex
      ? "noindex,nofollow"
      : undefined;

  const jsonLdItems = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet
      htmlAttributes={
        resolvedLang || resolvedDir
          ? {
              ...(resolvedLang ? { lang: resolvedLang } : {}),
              ...(resolvedDir ? { dir: resolvedDir } : {}),
            }
          : undefined
      }
    >
      <title>{fullTitle}</title>
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {resolvedRobots ? <meta name="robots" content={resolvedRobots} /> : null}

      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      {locale ? <meta property="og:locale" content={locale} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:title" content={fullTitle} />
      {description ? (
        <meta property="og:description" content={description} />
      ) : null}
      {resolvedImage ? (
        <meta property="og:image" content={resolvedImage} />
      ) : null}

      <meta
        name="twitter:card"
        content={resolvedImage ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={fullTitle} />
      {description ? (
        <meta name="twitter:description" content={description} />
      ) : null}
      {resolvedImage ? (
        <meta name="twitter:image" content={resolvedImage} />
      ) : null}

      {jsonLdItems.map((item, index) => (
        <script key={`jsonld-${index}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonicalPath: PropTypes.string,
  image: PropTypes.string,
  noIndex: PropTypes.bool,
  type: PropTypes.string,
  lang: PropTypes.string,
  dir: PropTypes.string,
  locale: PropTypes.string,
  robots: PropTypes.string,
  jsonLd: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
