import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../utils/money";

/** A price, in the currency it is charged in. */
const Price = ({
    amount,
    currency = "DZD",
    free = null,
    className = "",
    amountClassName = "",
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

    if (inline) {
        return (
            <span className={className}>
                <span className={amountClassName}>{main}</span>
            </span>
        );
    }

    return (
        <span className={`inline-flex flex-col leading-tight ${className}`}>
            <span className={amountClassName}>{main}</span>
        </span>
    );
};

Price.propTypes = {
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    currency: PropTypes.string,
    free: PropTypes.node,
    className: PropTypes.string,
    amountClassName: PropTypes.string,
    inline: PropTypes.bool,
};

export default Price;
