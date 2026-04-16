import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle,
  Filter,
  Info,
  Settings,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationItem from "../components/notifications/NotificationsItem";
import { useEffect } from "react";
// Mock notifications data
const notificationsData = [];

  
const NotificationsPage = () => {
  const { t } = useTranslation("", { keyPrefix: "notifications" });
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.read) ||
      (filter === "read" && notification.read) ||
      notification.type === filter;

    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: !notification.read }
          : notification,
      ),
    );
  };

  const handleDelete = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id),
    );
  };

  const handleAction = (id) => {
    // Handle action required notifications
    handleMarkAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true })),
    );
  };

  const filterOptions = [
    {
      value: "all",
      label: t("filter.all", "All"),
      count: notifications.length,
    },
    {
      value: "unread",
      label: t("filter.unread", "Unread"),
      count: unreadCount,
    },
    {
      value: "read",
      label: t("filter.read", "Read"),
      count: notifications.length - unreadCount,
    },
    {
      value: "application",
      label: t("filter.applications", "Applications"),
      count: notifications.filter((n) => n.type === "application").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Bell size={32} className="text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("title", "Title")}</h1>
              <p className="text-gray-600">{t("description", "Description")}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check size={16} />
                  {t("markAllAsRead", "Mark All As Read")}
                </button>
              )}
              <span className="text-sm text-gray-600">
                {t("unreadCount", {
                  unread: unreadCount,
                  total: notifications.length,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {t("filterBy", "Filter By")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {option.label}
                <span className="ml-2 text-xs opacity-75">
                  ({option.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("noNotificationsFound", "No Notifications Found")}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? t("tryAdjustingSearch", "Try Adjusting Search") : t("allCaughtUp", "All Caught Up")}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onAction={handleAction}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
