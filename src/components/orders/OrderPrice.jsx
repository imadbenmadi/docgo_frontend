import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const money = (n, currency) =>
  `${Number(n || 0).toLocaleString("fr-FR")} ${currency || "DZD"}`;

/**
 * What an order cost: the price paid, and when a coupon was used, the price
 * before it and the code.
 */
const OrderPrice = ({ order }) => {
  const { t } = useTranslation();

  if (order.isFree && !order.couponCode) {
    return <span>{t("orders.free", "Free")}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
      {order.couponCode && order.originalPrice != null && (
        <span className="text-gray-400 line-through">
          {money(order.originalPrice, order.currency)}
        </span>
      )}
      <span className="font-medium text-gray-700">
        {Number(order.price) > 0
          ? money(order.price, order.currency)
          : t("orders.free", "Free")}
      </span>
      {order.couponCode && (
        <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-xs text-emerald-700 ring-1 ring-emerald-200">
          {t("orders.coupon", "Coupon")} {order.couponCode}
        </span>
      )}
    </span>
  );
};

OrderPrice.propTypes = {
  order: PropTypes.shape({
    isFree: PropTypes.bool,
    couponCode: PropTypes.string,
    originalPrice: PropTypes.number,
    price: PropTypes.number,
    currency: PropTypes.string,
  }).isRequired,
};

export default OrderPrice;
