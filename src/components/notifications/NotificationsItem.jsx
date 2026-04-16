import { AlertCircle, Check, Mail, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}) => {
  const { t } = useTranslation("", { keyPrefix: "notifications" });
  const [showActions, setShowActions] = useState(false);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));

    if (diffInHours < 1) return t("timeAgo.justNow", "Just now");
    if (diffInHours < 24)
      return t("timeAgo.hoursAgo", `${diffInHours}h ago`, {
        hours: diffInHours,
      });
    if (diffInHours < 48) return t("timeAgo.yesterday", "Yesterday");
    const days = Math.floor(diffInHours / 24);
    return t("timeAgo.daysAgo", `${days}d ago`, { days });
  };

  const colorClasses = {
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    red: "bg-red-50 border-red-200 text-red-800",
    gray: "bg-gray-50 border-gray-200 text-gray-800",
  };

  const iconColorClasses = {
    green: "text-green-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
    red: "text-red-600",
    gray: "text-gray-600",
  };

  const Icon = notification.icon;

  return (
    <div
      className={`relative group p-4 border rounded-xl transition-all duration-200 hover:shadow-md ${
        notification.read
          ? "bg-white border-gray-200"
          : "bg-blue-50/50 border-blue-200 shadow-sm"
      }`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full"></div>
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 p-2 rounded-lg border ${
            colorClasses[notification.color]
          }`}
        >
          <Icon size={20} className={iconColorClasses[notification.color]} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-gray-900 ${
                  !notification.read ? "text-blue-900" : ""
                }`}
              >
                {notification.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {notification.message}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-gray-500">
                  {getTimeAgo(notification.timestamp)}
                </span>
                {notification.actionRequired && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    <AlertCircle size={12} />
                    {t("actionRequired", "Action Required")}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical size={16} className="text-gray-500" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-32">
                  {!notification.read && (
                    <button
                      onClick={() => {
                        onMarkAsRead(notification.id);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Check size={14} />
                      {t("markAsRead", "Mark as read")}
                    </button>
                  )}
                  {notification.read && (
                    <button
                      onClick={() => {
                        onMarkAsRead(notification.id);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Mail size={14} />
                      {t("markAsUnread", "Mark as unread")}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(notification.id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 size={14} />
                    {t("delete", "Delete")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {notification.actionRequired && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onAction(notification.id)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("takeAction", "Take Action")}
              </button>
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("dismiss", "Dismiss")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
