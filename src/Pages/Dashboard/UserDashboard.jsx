import { Bars3Icon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import DashboardOverview from "../../components/dashboard/DashboardOverview";
import Sidebar from "../../components/dashboard/Sidebar";
import MainLoading from "../../MainLoading";
import apiClient from "../../services/apiClient";
import { getApiErrorMessage } from "../../utils/apiErrorTranslate";

const UserDashboard = () => {
  const { user, checkAuthStatus } = useAppContext();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isRTL = i18n.language === "ar";

  // Check if we're on the dashboard root path
  const isRootDashboard =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setError("Not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/Users/${user.id}/Profile`);

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch dashboard data",
        );
      }
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          t,
          t("dashboard.loadError", "Failed to load dashboard data"),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    } else {
      // Try to recover if user exists in storage but missing id
      checkAuthStatus?.().catch(() => {
        // ignore
      });
    }
  }, [user?.id, fetchDashboardData, checkAuthStatus]);

  if (loading) return <MainLoading />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {t("error", "Error")}
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t("retry", "Retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            {t("no_data", "No data available")}
          </h2>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t("browseCourses", "Browse Courses")}
          </button>
        </div>
      </div>
    );
  }

  const {
    applications = { programs: [], courses: [] },
    enrollments = { courses: [], programs: [] },
    certificates = { courses: [] },
    favorites = { courses: [], programs: [], all: [] },
    statistics = {},
    recentActivity = {
      applications: [],
      progress: [],
      certificates: [],
      enrollments: [],
    },
  } = dashboardData;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Dashboard with Sidebar Layout */}
      <div className="flex relative">
        {/* Fixed Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content with proper spacing for fixed sidebar */}
        <div className={`flex-1 w-full ${isRTL ? "lg:me-64" : "lg:ms-64"}`}>
          {/* <Navigation /> */}
          {/* Mobile header with menu button */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-[999] flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Dashboard Content */}
          <div className="min-h-screen w-full">
            {isRootDashboard ? (
              <DashboardOverview
                user={user}
                t={t}
                isRTL={isRTL}
                dashboardData={dashboardData}
                applications={applications}
                enrollments={enrollments}
                certificates={certificates}
                favorites={favorites}
                statistics={statistics}
                recentActivity={recentActivity}
              />
            ) : (
              <Outlet />
            )}
          </div>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
