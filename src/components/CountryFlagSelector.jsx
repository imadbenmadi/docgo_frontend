import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// Inline imports to work around Rollup resolution issue
// TODO: Move back to separate utils file when Rollup resolution is fixed
const COUNTRY_CODE_MAP = {
  France: "FR",
  Canada: "CA",
  Belgique: "BE",
  Suisse: "CH",
  Maroc: "MA",
  Algérie: "DZ",
  Tunisie: "TN",
  Sénégal: "SN",
  "Côte d'Ivoire": "CI",
  Luxembourg: "LU",
  "États-Unis": "US",
  "Royaume-Uni": "GB",
  Allemagne: "DE",
  Espagne: "ES",
  Italie: "IT",
  "Pays-Bas": "NL",
  Autriche: "AT",
  Portugal: "PT",
  Grèce: "GR",
  Suède: "SE",
  Norvège: "NO",
  Danemark: "DK",
  Finlande: "FI",
  Pologne: "PL",
  Turquie: "TR",
  Japon: "JP",
  Chine: "CN",
  Inde: "IN",
  Brésil: "BR",
  Mexique: "MX",
  "Afrique du Sud": "ZA",
  Australie: "AU",
};

const BILINGUAL_COUNTRIES = {
  France: { fr: "France", ar: "فرنسا" },
  Canada: { fr: "Canada", ar: "كندا" },
  Belgique: { fr: "Belgique", ar: "بلجيكا" },
  Suisse: { fr: "Suisse", ar: "سويسرا" },
  Maroc: { fr: "Maroc", ar: "المغرب" },
  Algérie: { fr: "Algérie", ar: "الجزائر" },
  Tunisie: { fr: "Tunisie", ar: "تونس" },
  Sénégal: { fr: "Sénégal", ar: "السنغال" },
  "Côte d'Ivoire": { fr: "Côte d'Ivoire", ar: "ساحل العاج" },
  Luxembourg: { fr: "Luxembourg", ar: "لوكسمبرغ" },
  "États-Unis": { fr: "États-Unis", ar: "الولايات المتحدة" },
  "Royaume-Uni": { fr: "Royaume-Uni", ar: "المملكة المتحدة" },
  Allemagne: { fr: "Allemagne", ar: "ألمانيا" },
  Espagne: { fr: "Espagne", ar: "إسبانيا" },
  Italie: { fr: "Italie", ar: "إيطاليا" },
  "Pays-Bas": { fr: "Pays-Bas", ar: "هولندا" },
  Autriche: { fr: "Autriche", ar: "النمسا" },
  Portugal: { fr: "Portugal", ar: "البرتغال" },
  Grèce: { fr: "Grèce", ar: "اليونان" },
  Suède: { fr: "Suède", ar: "السويد" },
  Norvège: { fr: "Norvège", ar: "النرويج" },
  Danemark: { fr: "Danemark", ar: "الدنمارك" },
  Finlande: { fr: "Finlande", ar: "فنلندا" },
  Pologne: { fr: "Pologne", ar: "بولندا" },
  Turquie: { fr: "Turquie", ar: "تركيا" },
  Japon: { fr: "Japon", ar: "اليابان" },
  Chine: { fr: "Chine", ar: "الصين" },
  Inde: { fr: "Inde", ar: "الهند" },
  Brésil: { fr: "Brésil", ar: "البرازيل" },
  Mexique: { fr: "Mexique", ar: "المكسيك" },
  "Afrique du Sud": { fr: "Afrique du Sud", ar: "جنوب أفريقيا" },
  Australie: { fr: "Australie", ar: "أستراليا" },
};

const getCountryCode = (countryName) =>
  COUNTRY_CODE_MAP[countryName] || countryName;

const getCountryName = (isoCode) => {
  return (
    Object.entries(COUNTRY_CODE_MAP).find(
      ([_, code]) => code === isoCode,
    )?.[0] || isoCode
  );
};

const getCountryDisplayName = (countryName, language = "fr") => {
  const country = BILINGUAL_COUNTRIES[countryName];
  if (!country) return countryName;
  return language === "ar" ? country.ar : country.fr;
};
// CSS is bundled with the component in newer versions
// import "react-flags-select/css/react-flags-select.css";

/**
 * Reusable Country Flag Selector Component
 * Replaces emoji flags with professional flag icons
 *
 * @param {string} value - French country name (e.g., "France")
 * @param {function} onChange - Callback when country is selected
 * @param {string[]} countries - Array of French country names to show
 * @param {object} props - Additional props to pass to ReactFlagsSelect
 */
/**
 * Pick one country from the list the admin chose.
 *
 * This used to hand the names to react-flags-select after filtering them
 * through COUNTRY_CODE_MAP - a table of 32 countries. The admin can select
 * around 200, so everything outside those 32 was dropped on the way to the
 * page and the dropdown came up empty. A country the admin offers is now
 * always listed; the flag is a nicety, and its absence hides nothing.
 */
const flagOf = (code) =>
  code && code.length === 2
    ? String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
      )
    : "\u{1F3F3}";

// A stored name can be bilingual ("Algérie / الجزائر"); the code table is
// keyed on the French half.
const codeOf = (country) =>
  COUNTRY_CODE_MAP[String(country || "").split("/")[0].trim()];

const fold = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const CountryFlagSelector = ({
  value,
  onChange,
  countries = [],
  placeholder = "Select Country",
  disabled = false,
  className = "",
  showLabel = true,
  label = "Country",
  required = false,
}) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const lang = i18n.language?.split("-")[0] || "fr";
  const shown = useMemo(() => {
    const list = countries || [];
    if (!query) return list;
    return list.filter(
      (c) =>
        fold(c).includes(fold(query)) ||
        fold(getCountryDisplayName(c, lang)).includes(fold(query)),
    );
  }, [countries, query, lang]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-900 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        <span className={value ? "" : "text-gray-400"}>
          {value ? (
            <>
              <span className="mr-2">{flagOf(codeOf(value))}</span>
              {getCountryDisplayName(value, lang)}
            </>
          ) : (
            placeholder
          )}
        </span>
        <span className="ml-2 text-gray-400">&#9662;</span>
      </button>

      {open && (
        <>
          {/* Clicking anywhere else closes it, without a document listener. */}
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("register.searchCountry", "Rechercher un pays…")}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {!shown.length && (
                <p className="px-4 py-6 text-center text-sm text-gray-400">
                  {t("register.noCountryMatch", "Aucun pays ne correspond.")}
                </p>
              )}
              {shown.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => {
                    onChange(country);
                    close();
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                    country === value ? "bg-blue-50 font-medium" : ""
                  }`}
                >
                  <span className="text-lg leading-none">
                    {flagOf(codeOf(country))}
                  </span>
                  <span>{getCountryDisplayName(country, lang)}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountryFlagSelector;
