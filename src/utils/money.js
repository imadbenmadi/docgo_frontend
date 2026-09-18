/**
 * One place that knows how to write a price.
 *
 * Everything on the platform is charged in DZD - CCP is the only way money
 * arrives, and no order stores any other currency.
 */

/** Currencies we know how to write out. Anything else is printed as given. */
const SYMBOLS = { DZD: "DZD", EUR: "€", USD: "$" };

const LOCALES = { fr: "fr-FR", ar: "ar-DZ", en: "en-GB" };

/** A number with thousands separated, in the reader's language. */
export const formatAmount = (amount, language = "fr") => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return null;
    try {
        return new Intl.NumberFormat(LOCALES[language] || "fr-FR", {
            maximumFractionDigits: n % 1 === 0 ? 0 : 2,
        }).format(n);
    } catch {
        return String(Math.round(n));
    }
};

/** "12 000 DZD". Returns null when there is no number to write. */
export const formatPrice = (amount, currency = "DZD", language = "fr") => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return null;
    const written = formatAmount(n, language);
    const code = (currency || "DZD").toUpperCase();
    return code === "EUR"
        ? `${written} ${SYMBOLS.EUR}`
        : `${written} ${SYMBOLS[code] || code}`;
};

export default { formatPrice, formatAmount };
