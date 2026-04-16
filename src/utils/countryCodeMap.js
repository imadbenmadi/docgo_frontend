/**
 * Maps French country names to ISO 2-letter country codes
 * Used by react-flags-select library
 */
export const COUNTRY_CODE_MAP = {
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

/**
 * Get ISO code from French country name
 */
export const getCountryCode = (countryName) => {
  return COUNTRY_CODE_MAP[countryName] || countryName;
};

/**
 * Get French country name from ISO code
 */
export const getCountryName = (isoCode) => {
  return (
    Object.entries(COUNTRY_CODE_MAP).find(
      ([_, code]) => code === isoCode,
    )?.[0] || isoCode
  );
};

/**
 * Bilingual country names mapping (French and Arabic)
 */
export const BILINGUAL_COUNTRIES = {
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

/**
 * Get display name for country in current language
 */
export const getCountryDisplayName = (countryName, language = "fr") => {
  const country = BILINGUAL_COUNTRIES[countryName];
  if (!country) return countryName;
  return language === "ar" ? country.ar : country.fr;
};
