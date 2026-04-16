import React, { useMemo } from "react";
import ReactFlagsSelect from "react-flags-select";
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
  ...props
}) => {
  const { i18n } = useTranslation();

  // Convert French country names to ISO codes for the component
  const countryCodesArray = useMemo(() => {
    if (!countries || countries.length === 0) return [];
    return countries
      .filter((c) => COUNTRY_CODE_MAP[c])
      .map((c) => COUNTRY_CODE_MAP[c]);
  }, [countries]);

  // Get current ISO code from French name
  const currentCode = value ? getCountryCode(value) : "";

  // Handle change - convert ISO code back to French name
  const handleChange = (code) => {
    const frenchName = getCountryName(code);
    onChange(frenchName);
  };

  // Get display text in current language
  const displayName = value
    ? getCountryDisplayName(value, i18n.language?.split("-")[0] || "fr")
    : placeholder;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {/* {label} */}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="react-flags-select-wrapper">
        <ReactFlagsSelect
          selected={currentCode}
          onSelect={handleChange}
          countries={countryCodesArray}
          customLabels={{
            ...Object.entries(COUNTRY_CODE_MAP).reduce((acc, [name, code]) => {
              const displayText = getCountryDisplayName(
                name,
                i18n.language?.split("-")[0] || "fr",
              );
              acc[code] = displayText;
              return acc;
            }, {}),
          }}
          placeholder={displayName}
          disabled={disabled}
          showOptionLabel={true}
          showSelectedLabel={true}
          {...props}
        />
      </div>
      <style>{`
        .react-flags-select-wrapper {
          width: 100%;
        }

        .react-flags-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          color: #111827;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .react-flags-select:hover:not(:disabled) {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .react-flags-select:focus-visible {
          outline: 2px solid transparent;
          outline-offset: 2px;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .react-flags-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f3f4f6;
        }

        .react-flags-select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          max-height: 300px;
          overflow-y: auto;
          z-index: 50;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-top: 0.25rem;
        }

        .react-flags-select-dropdown-item {
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.15s ease;
        }

        .react-flags-select-dropdown-item:hover {
          background-color: #f3f4f6;
        }

        .react-flags-select-dropdown-item.selected {
          background-color: #eff6ff;
          color: #1e40af;
          font-weight: 500;
        }

        .react-flags-select .flag {
          width: 1.25rem;
          height: 0.75rem;
          margin-right: 0.5rem;
          border-radius: 0.125rem;
        }
      `}</style>
    </div>
  );
};

export default CountryFlagSelector;
