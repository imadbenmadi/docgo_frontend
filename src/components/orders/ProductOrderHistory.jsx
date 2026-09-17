import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import OrdersAPI from "../../API/Orders";
import { useAppContext } from "../../AppContext";
import OrderPrice from "./OrderPrice";

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-800",
  rejected: "bg-rose-50 text-rose-800",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-violet-50 text-violet-800",
};

/**
 * Every order this user placed for one item - approved, waiting, rejected or
 * cancelled - shown on the item's own page. Renders nothing for a visitor or
 * for someone who has never ordered it.
 *
 * `refreshKey` lets the page ask for a reload after it places an order.
 */
const ProductOrderHistory = ({ itemType, itemId, refreshKey = 0 }) => {
  const { t } = useTranslation();
  const { isAuth } = useAppContext();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!isAuth || !itemId) {
      setOrders([]);
      return undefined;
    }
    OrdersAPI.mine({ itemType, itemId: String(itemId) }).then((r) => {
      if (!cancelled && r.success) setOrders(r.orders);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuth, itemType, itemId, refreshKey]);

  if (!orders.length) return null;

  return (
    <section className="mx-auto my-8 w-full max-w-5xl px-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("orders.historyTitle", "Your orders for this")}
          </h3>
          <Link
            to="/my-orders"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {t("orders.manage", "Manage in My orders")}
          </Link>
        </div>

        <ul className="divide-y divide-gray-100">
          {orders.map((o) => (
            <li key={o.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 text-sm">
                  <span className="font-mono text-xs text-gray-400">
                    {o.reference}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {new Date(o.placedAt).toLocaleDateString()}
                  </span>
                  <div className="mt-1">
                    <OrderPrice order={o} />
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    STATUS_STYLE[o.status] || STATUS_STYLE.pending
                  }`}
                >
                  {t(`orders.status.${o.status}`, o.status)}
                </span>
              </div>
              {o.rejectionReason && (
                <p className="mt-2 flex items-start gap-2 rounded-lg bg-rose-50 p-2 text-sm text-rose-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {o.rejectionReason}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

ProductOrderHistory.propTypes = {
  itemType: PropTypes.oneOf(["course", "program", "cv", "internship"]).isRequired,
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refreshKey: PropTypes.number,
};

export default ProductOrderHistory;
