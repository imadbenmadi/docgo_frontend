import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const UserNavigationContext = createContext();

export const useUserNavigation = () => {
  const context = useContext(UserNavigationContext);
  if (!context) {
    throw new Error(
      "useUserNavigation must be used within a UserNavigationProvider",
    );
  }
  return context;
};

const BRAND = "healthpathglobal";

export const UserNavigationProvider = ({ children }) => {
  const { t, i18n } = useTranslation("", { keyPrefix: "pageTitles" });
  const [pageTitle, setPageTitle] = useState(BRAND);
  const location = useLocation();

  // Build a "brand - localized title" string
  const pt = useMemo(
    () => (key, en) => `${BRAND} - ${t(key, en)}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  // Route to page title mapping - memoized (re-runs on language change)
  const titleMapping = useMemo(
    () => ({
      "/": pt("home", "Home"),
      "/home": pt("home", "Home"),
      "/programs": pt("programs", "Explore studying abroad"),
      "/courses": pt("courses", "Browse learning"),
      "/other-services": pt("services", "Services"),
      "/other-services/cv": pt("cvService", "CV Service"),
      "/other-services/internships": pt("internships", "Internships"),
      "/other-services/my-applications": pt(
        "myServiceApplications",
        "My Service Applications",
      ),
      "/faq": pt("faq", "Frequently Asked Questions"),
      "/favorites": pt("favorites", "My Favorites"),
      "/notifications": pt("notifications", "Notifications"),
      "/myapplications": pt("myApplications", "My Applications"),
      "/my-applications": pt("myApplications", "My Applications"),
      "/profile": pt("profile", "My Profile"),
      "/profile/edit": pt("editProfile", "Edit Profile"),
      "/dashboard": pt("dashboard", "Dashboard"),
      "/dashboard/my-learning": pt("myLearning", "My Learning"),
      "/dashboard/my-programs": pt("myPrograms", "My studies abroad"),
      "/dashboard/cv": pt("cvService", "CV Service"),
      "/dashboard/internships": pt("internships", "Internships"),
      "/dashboard/service-applications": pt(
        "myServiceApplications",
        "My Service Applications",
      ),
    }),
    [pt],
  );

  // Update page title based on current route
  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();
    const apply = (title) => {
      setPageTitle(title);
      document.title = title;
    };

    // Check for exact route match first
    if (titleMapping[currentPath]) {
      apply(titleMapping[currentPath]);
      return;
    }

    // Handle dynamic routes
    if (currentPath.startsWith("/courses/")) {
      if (currentPath.includes("/watch")) {
        if (currentPath.includes("/quiz")) {
          apply(pt("courseQuiz", "Course Quiz"));
        } else if (currentPath.includes("/certificate")) {
          apply(pt("certificate", "Certificate"));
        } else if (currentPath.includes("/resources")) {
          apply(pt("courseResources", "Course Resources"));
        } else {
          apply(pt("watchingCourse", "Watching Course"));
        }
      } else if (currentPath.includes("/videos")) {
        apply(pt("courseContent", "Course Content"));
      } else {
        apply(pt("courseDetails", "Course Details"));
      }
      return;
    }

    // Handle program details
    if (currentPath.startsWith("/programs/")) {
      apply(pt("programDetails", "Study abroad details"));
      return;
    }

    // Handle dashboard internship details
    if (currentPath.startsWith("/dashboard/internships/")) {
      apply(pt("internshipDetails", "Internship Details"));
      return;
    }

    // Handle payment pages
    if (currentPath.startsWith("/payment/")) {
      if (currentPath.includes("/success")) {
        apply(pt("paymentSuccessful", "Payment Successful"));
      } else {
        apply(pt("payment", "Payment"));
      }
      return;
    }

    // Handle search
    if (currentPath.startsWith("/search")) {
      apply(pt("searchResults", "Search Results"));
      return;
    }

    // Handle dashboard sub-pages
    if (currentPath.startsWith("/dashboard/")) {
      const pathSegment = currentPath.split("/")[2];
      const dashboardTitles = {
        messages: pt("dashMessages", "Dashboard - Messages"),
        applications: pt("dashApplications", "Dashboard - My Applications"),
        certificates: pt("dashCertificates", "Dashboard - My Certificates"),
        favorites: pt("dashFavorites", "Dashboard - My Favorites"),
        notifications: pt("dashNotifications", "Dashboard - Notifications"),
        settings: pt("dashSettings", "Dashboard - Settings"),
        "my-learning": pt("myLearning", "My Learning"),
        "my-programs": pt("myPrograms", "My studies abroad"),
      };
      apply(dashboardTitles[pathSegment] || pt("dashboard", "Dashboard"));
      return;
    }

    // Default
    apply(BRAND);
  }, [location.pathname, titleMapping, pt]);

  // Determine active navigation item based on current route
  const getActiveNavItem = useMemo(() => {
    const currentPath = location.pathname.toLowerCase();

    if (
      currentPath === "/" ||
      currentPath === "/home" ||
      currentPath === "/dashboard"
    ) {
      return "home";
    } else if (currentPath.startsWith("/other-services")) {
      return "services";
    } else if (
      currentPath === "/programs" ||
      currentPath.startsWith("/programs/")
    ) {
      return "programs";
    } else if (
      currentPath === "/courses" ||
      currentPath.startsWith("/courses/")
    ) {
      return "courses";
    } else if (currentPath === "/faq") {
      return "faq";
    } else if (currentPath === "/favorites") {
      return "favorites";
    } else if (
      currentPath === "/myapplications" ||
      currentPath === "/my-applications"
    ) {
      return "applications";
    } else if (currentPath === "/notifications") {
      return "notifications";
    } else if (currentPath === "/profile" || currentPath === "/profile/edit") {
      return "profile";
    } else if (currentPath.startsWith("/dashboard")) {
      return "dashboard";
    } else if (currentPath.startsWith("/payment")) {
      return "payment";
    }

    return null;
  }, [location.pathname]);

  const value = {
    pageTitle,
    getActiveNavItem,
  };

  return (
    <UserNavigationContext.Provider value={value}>
      {children}
    </UserNavigationContext.Provider>
  );
};

UserNavigationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
