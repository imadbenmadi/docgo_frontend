import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { formatEuro, formatPrice } from "../../utils/money";

/**
 * A price, with the euro indication under it.
 *
 * The dinar figure is the price. The euro is smaller, greyer and prefixed
 * with an approximation sign because it is not what anyone is charged - it is
 * there so a reader outside Algeria knows roughly what they are looking at.
 */
const Price = ({
    amount,
    currency = "DZD",
    free = null,
    className = "",
    amountClassName = "",
    euroClassName = "",
    inline = false,
}) => {
    const { t, i18n } = useTranslation();
    const n = Number(amount);

    if (!Number.isFinite(n) || n <= 0) {
        return (
            <span className={`${className} ${amountClassName}`}>
                {free ?? t("common.free", "Gratuit")}
            </span>
        );
    }

    const main = formatPrice(n, currency, i18n.language);
    const euro = formatEuro(n, currency, i18n.language);

    if (inline) {
        return (
            <span className={className}>
                <span className={amountClassName}>{main}</span>
                {euro && (
                    <span className={`ms-2 text-gray-500 ${euroClassName}`}>
                        ({euro})
                    </span>
                )}
            </span>
        );
    }

    return (
        <span className={`inline-flex flex-col leading-tight ${className}`}>
            <span className={amountClassName}>{main}</span>
            {euro && (
                <span className={`text-xs font-normal text-gray-500 ${euroClassName}`}>
                    {euro}
                </span>
            )}
        </span>
    );
};

Price.propTypes = {
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    currency: PropTypes.string,
    free: PropTypes.node,
    className: PropTypes.string,
    amountClassName: PropTypes.string,
    euroClassName: PropTypes.string,
    inline: PropTypes.bool,
};

export default Price;
