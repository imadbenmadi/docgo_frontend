import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileUp,
  Loader2,
  Receipt,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import OrdersAPI from "../API/Orders";

/**
 * Everything this person has ordered, and what to do about each one.
 *
 * The platform had four separate "my applications" screens, one per product,
 * and a payments page that nothing rendered. Somebody whose receipt had been
 * rejected had nowhere to find that out and no way to send another - the
 * rejection lived on a row nothing showed them.
 *
 * Every order is here, whatever it was for, and each one says what happens
 * next in a sentence rather than a status code.
 */

const TYPE_PATH = {
  course: "/Courses",
  program: "/Programs",
  cv: "/other-services/cv",
  internship: "/other-services/internships",
};

const STATUS_LOOK = {
  pending: {
    ring: "ring-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-800",
    Icon: Clock,
  },
  approved: {
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    Icon: CheckCircle2,
  },
  rejected: {
    ring: "ring-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-800",
    Icon: XCircle,
  },
  cancelled: {
    ring: "ring-gray-200",
    bg: "bg-gray-50",
    text: "text-gray-600",
    Icon: XCircle,
  },
  refunded: {
    ring: "ring-violet-200",
    bg: "bg-violet-50",
    text: "text-violet-800",
    Icon: RotateCcw,
  },
};

const MyOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(null);
  const fileInput = useRef(null);
  const pendingUpload = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await OrdersAPI.mine(filter ? { status: filter } : {});
    if (r.success) {
      setOrders(r.orders);
      setCounts(r.countsByStatus);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Sending a receipt against a rejected order starts a new attempt on the
   * server, so the same button covers "send it" and "send another".
   */
  const chooseFile = (order) => {
    pendingUpload.current = order;
    fileInput.current?.click();
  };

  const onFilePicked = async (e) => {
    const file = e.target.files?.[0];
    const order = pendingUpload.current;
    e.target.value = "";
    if (!file || !order) return;

    const { value: ccpNumber } = await Swal.fire({
      title: t("orders.ccpTitle", "Your CCP number"),
      input: "text",
      inputPlaceholder: "0079999900...",
      confirmButtonText: t("orders.send", "Send"),
      showCancelButton: true,
      inputValidator: (v) =>
        !v?.trim() &&
        t("orders.ccpRequired", "We need the CCP number the payment came from"),
    });
    if (!ccpNumber) return;

    setBusy(order.id);
    const r = await OrdersAPI.sendReceipt(order.id, { file, ccpNumber });
    setBusy(null);

    if (r.success) {
      await Swal.fire({
        icon: "success",
        title: t("orders.sent", "Receipt sent"),
        text: r.message,
      });
      load();
    } else {
      Swal.fire({ icon: "error", title: t("common.error", "Error"), text: r.message });
    }
  };

  const cancel = async (order) => {
    const ok = await Swal.fire({
      icon: "question",
      title: t("orders.cancelTitle", "Cancel this order?"),
      text: order.reference,
      showCancelButton: true,
      confirmButtonText: t("orders.cancelYes", "Cancel it"),
    });
    if (!ok.isConfirmed) return;

    setBusy(order.id);
    const r = await OrdersAPI.cancel(order.id);
    setBusy(null);
    if (r.success) load();
  };

  const tabs = [
    { value: "", label: t("orders.all", "All") },
    { value: "pending", label: t("orders.pending", "Being checked") },
    { value: "approved", label: t("orders.approved", "Yours") },
    { value: "rejected", label: t("orders.rejected", "Needs a new receipt") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <input
        ref={fileInput}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onFilePicked}
      />

      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("orders.title", "My orders")}
          </h1>
          <p className="mt-2 text-gray-600">
            {t(
              "orders.subtitle",
              "Everything you have asked for, and where each one has got to.",
            )}
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value || "all"}
              onClick={() => setFilter(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === tab.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {counts[tab.value] ? (
                <span className="ml-1.5 tabular-nums opacity-60">
                  {counts[tab.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-gray-200">
            <Receipt className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="text-gray-600">
              {t("orders.empty", "You have not ordered anything yet.")}
            </p>
            <Link
              to="/Courses"
              className="mt-4 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              {t("orders.browse", "Have a look around")}
            </Link>
          </div>
        )}

        <ul className="space-y-4">
          {!loading &&
            orders.map((o) => {
              const look = STATUS_LOOK[o.status] || STATUS_LOOK.pending;
              const { Icon } = look;

              return (
                <li
                  key={o.id}
                  className={`rounded-2xl bg-white p-5 ring-1 ${look.ring}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-gray-400">
                        {o.reference}
                        {o.attemptNumber > 1 && (
                          <span className="ml-2">
                            {t("orders.attempt", "attempt")} {o.attemptNumber}
                          </span>
                        )}
                      </p>
                      <h2 className="mt-1 truncate text-lg font-semibold text-gray-900">
                        {o.itemTitle || t("orders.itemGone", "This item")}
                      </h2>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {o.isFree
                          ? t("orders.free", "Free")
                          : `${Number(o.price).toLocaleString("fr-FR")} ${o.currency}`}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${look.bg} ${look.text}`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(`orders.status.${o.status}`, o.status)}
                    </span>
                  </div>

                  {o.rejectionReason && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {o.rejectionReason}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {o.nextStep === "open_it" && (
                      <Link
                        to={`${TYPE_PATH[o.itemType]}/${o.itemId}`}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                      >
                        {t("orders.open", "Open it")}
                      </Link>
                    )}

                    {(o.nextStep === "send_receipt" ||
                      o.nextStep === "send_a_new_receipt") && (
                      <button
                        disabled={busy === o.id}
                        onClick={() => chooseFile(o)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                      >
                        {busy === o.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileUp className="h-4 w-4" />
                        )}
                        {o.nextStep === "send_a_new_receipt"
                          ? t("orders.sendAnother", "Send a new receipt")
                          : t("orders.sendReceipt", "Send your receipt")}
                      </button>
                    )}

                    {o.nextStep === "wait_for_review" && (
                      <p className="text-sm text-gray-500">
                        {t(
                          "orders.waiting",
                          "We have your receipt. You will hear from us either way.",
                        )}
                      </p>
                    )}

                    {o.status === "pending" && (
                      <button
                        disabled={busy === o.id}
                        onClick={() => cancel(o)}
                        className="ml-auto text-sm text-gray-400 underline hover:text-gray-600"
                      >
                        {t("orders.cancel", "Cancel")}
                      </button>
                    )}
                  </div>

                  {o.refundedAt && (
                    <p className="mt-3 text-sm text-violet-700">
                      {t("orders.refunded", "Refunded")}:{" "}
                      {Number(o.refundAmount).toLocaleString("fr-FR")}{" "}
                      {o.currency}
                    </p>
                  )}
                </li>
              );
            })}
        </ul>

        {!loading && orders.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-400">
            {t(
              "orders.keptNote",
              "Nothing here is ever deleted. A rejected order keeps its receipt and its reason, and sending a new one starts a new attempt rather than replacing it.",
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
