import {
  ArrowTopRightOnSquareIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  InformationCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../AppContext";
import notificationService from "../../services/notificationService";

const tryParseLocalizedJson = (value) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (
      parsed &&
      typeof parsed === "object" &&
      (typeof parsed.en === "string" ||
        typeof parsed.fr === "string" ||
        typeof parsed.ar === "string")
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const pickLocalized = (value, lang) => {
  const localized = tryParseLocalizedJson(value);
  if (!localized) return value || "";
  return localized[lang] || localized.en || localized.fr || localized.ar || "";
};

const inferType = (title, message) => {
  const raw = `${title || ""} ${message || ""}`.toLowerCase();
  if (
    raw.includes("approved") ||
    raw.includes("approuvé") ||
    raw.includes("approuve") ||
    raw.includes("approbation")
  ) {
    return "success";
  }
  if (raw.includes("rejected") || raw.includes("rejet")) {
    return "error";
  }
  if (
    raw.includes("action required") ||
    raw.includes("requise") ||
    raw.includes("requise")
  ) {
    return "warning";
  }
  return "info";
};

const UserNotifications = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
    // eslint-disable-next-line
  }, [user?.id, filter]);
useEffect(() => {
}, [notifications]);
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const statusQuery =
        filter === "unread" ? "Unread" : filter === "read" ? "Read" : "all";

      const response = await notificationService.getNotifications({
        page: 1,
        limit: 100,
        status: statusQuery,
      });

      const rows = Array.isArray(response?.notifications)
        ? response.notifications
        : [];

      const normalized = rows.map((n) => {
        const title = pickLocalized(n.title, i18n.language);
        const message = pickLocalized(n.text, i18n.language);
        return {
          id: n.id,
          title,
          message,
          read: n.status === "Read",
          createdAt: n.createdAt,
          link: n.link,
          type: inferType(title, message),
          raw: n,
        };
      });

      setNotifications(normalized);
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (error) {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {}
  };

  // Click a notification: mark as read then follow its link or show popup
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.link) {
      if (notification.link.startsWith("/")) {
        navigate(notification.link);
      } else {
        window.open(notification.link, "_blank", "noopener,noreferrer");
      }
      return;
    }

    // No link  show a detail popup
    const formattedDate = notification.createdAt
      ? new Date(notification.createdAt).toLocaleString(i18n.language, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "";

    const iconMap = {
      success: "success",
      error: "error",
      warning: "warning",
      info: "info",
    };

    await Swal.fire({
      title: notification.title,
      html: `
                <p style="text-align:start;color:#374151;line-height:1.6;margin-bottom:12px">
                    ${notification.message}
                </p>
                ${formattedDate ? `<p style="font-size:0.75rem;color:#9ca3af;text-align:start">${formattedDate}</p>` : ""}
            `,
      icon: iconMap[notification.type] || "info",
      confirmButtonText: t("common.close", "Close"),
      confirmButtonColor: "#2563eb",
      customClass: {
        htmlContainer: "text-left",
      },
    });
  };

  const handleDelete = async (notificationId) => {
    const result = await Swal.fire({
      title: t("notifications.confirmDeleteTitle", "Delete notification?"),
      text: t(
        "notifications.confirmDelete",
        "This notification will be permanently removed.",
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("common.delete", "Delete"),
      cancelButtonText: t("common.cancel", "Cancel"),
    });
    if (result.isConfirmed) {
      try {
        await notificationService.deleteNotification(notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } catch (error) {}
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      case "info":
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BellIcon className="h-7 w-7 text-blue-600 mr-3" />
              {t("notifications.title", "Notifications")}
            </h1>
            <p className="mt-1 text-gray-600">
              {t(
                "notifications.subtitle",
                "Stay updated with your latest activities",
              )}
            </p>
          </div>

          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {t("notifications.markAllRead", "Mark All as Read")}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {["all", "unread", "read"].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === filterType
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t(
                  `notifications.filter.${filterType}`,
                  filterType.charAt(0).toUpperCase() + filterType.slice(1),
                )}
                {filterType === "unread" &&
                  notifications.filter((n) => !n.read).length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              {t("notifications.loading", "Loading notifications...")}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("notifications.noNotifications", "No notifications")}
            </h3>
            <p className="text-gray-600">
              {t(
                "notifications.noNotificationsText",
                "You're all caught up! No new notifications to show.",
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-l-4 transition-colors cursor-pointer ${
                  !notification.read
                    ? getTypeColor(notification.type)
                    : "border-l-gray-300"
                } hover:bg-blue-50/40`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3
                          className={`text-sm font-medium flex items-center gap-1 ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          } ${
                            notification.link ? "group-hover:text-blue-600" : ""
                          }`}
                        >
                          {notification.title}
                          {notification.link && (
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 inline-block" />
                          )}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          !notification.read ? "text-gray-800" : "text-gray-600"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title={t("notifications.markAsRead", "Mark as read")}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title={t("notifications.delete", "Delete")}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
