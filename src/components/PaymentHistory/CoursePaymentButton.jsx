import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * "View payment" on a course or programme the user owns. Every payment is an
 * order, so this opens the orders page rather than a second copy of it.
 */
const CoursePaymentButton = () => {
  const { t } = useTranslation();
  return (
    <Link
      to="/dashboard/my-orders"
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <Receipt className="h-4 w-4" />
      {t("dashboard.sidebar.payments", "My payments")}
    </Link>
  );
};

CoursePaymentButton.propTypes = {
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  itemType: PropTypes.string,
  itemTitle: PropTypes.string,
};

export default CoursePaymentButton;
