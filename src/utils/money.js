/**
 * One place that knows how to write a price.
 *
 * Everything on the platform is charged in DZD - CCP is the only way money
 * arrives. The euro shown beside it is an indication for people reading from
 * outside Algeria, not a second price: nothing is ever charged in euros, and
 * no order stores one.
 *
 * The rate is a setting rather than a lookup on purpose. A live rate would
 * make the same course cost a different euro figure every time the page is
 * opened, and Algeria has two rates in daily use anyway, so a number the
 * office picked and can change is the honest version.
 *
 * Change it with VITE_DZD_PER_EUR in the frontend .env - no code change and
 * no rebuild of anything but the bundle.
 */

/** How many dinars to a euro. */
export const DZD_PER_EUR = Number(import.meta.env?.VITE_DZD_PER_EUR) || 150;

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

/**
 * The euro indication for a dinar price, or null when there isn't one -
 * a free item, a price already in euros, or a rate that has been switched off
 * by setting VITE_DZD_PER_EUR to 0.
 */
export const toEuro = (amount, currency = "DZD") => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return null;
    if ((currency || "DZD").toUpperCase() !== "DZD") return null;
    if (!DZD_PER_EUR || DZD_PER_EUR <= 0) return null;
    return n / DZD_PER_EUR;
};

/** "≈ 80 €", or null. Rounded to whole euros - it is an indication. */
export const formatEuro = (amount, currency = "DZD", language = "fr") => {
    const eur = toEuro(amount, currency);
    if (eur === null) return null;
    return `≈ ${formatAmount(Math.round(eur), language)} €`;
};

export default { formatPrice, formatEuro, formatAmount, toEuro, DZD_PER_EUR };
