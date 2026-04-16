import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
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

export const UserNavigationProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("healthpathglobal");
  const location = useLocation();

  // Route to page title mapping - memoized
  const titleMapping = useMemo(
    () => ({
      "/": "healthpathglobal - Home",
      "/home": "healthpathglobal - Home",
      "/programs": "healthpathglobal - Explorer les études à l’étranger",
      "/courses": "healthpathglobal - Parcourir l'apprentissage",
      "/other-services": "healthpathglobal - Services",
      "/other-services/cv": "healthpathglobal - CV Service",
      "/other-services/internships": "healthpathglobal - Internships",
      "/other-services/my-applications":
        "healthpathglobal - My Service Applications",
      "/faq": "healthpathglobal - Frequently Asked Questions",
      "/favorites": "healthpathglobal - My Favorites",
      "/notifications": "healthpathglobal - Notifications",
      "/myapplications": "healthpathglobal - My Applications",
      "/my-applications": "healthpathglobal - My Applications",
      "/profile": "healthpathglobal - My Profile",
      "/profile/edit": "healthpathglobal - Edit Profile",
      "/dashboard": "healthpathglobal - Dashboard",
      "/dashboard/my-learning": "healthpathglobal - My Learning",
      "/dashboard/my-programs": "healthpathglobal - Mes études à l’étranger",
      "/dashboard/cv": "healthpathglobal - CV Service",
      "/dashboard/internships": "healthpathglobal - Internships",
      "/dashboard/service-applications":
        "healthpathglobal - My Service Applications",
    }),
    [],
  );

  // Update page title based on current route
  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();

    // Check for exact route match first
    if (titleMapping[currentPath]) {
      const title = titleMapping[currentPath];
      setPageTitle(title);
      document.title = title;
      return;
    }

    // Handle dynamic routes
    if (currentPath.startsWith("/courses/")) {
      if (currentPath.includes("/watch")) {
        if (currentPath.includes("/quiz")) {
          const title = "healthpathglobal - Course Quiz";
          setPageTitle(title);
          document.title = title;
        } else if (currentPath.includes("/certificate")) {
          const title = "healthpathglobal - Certificate";
          setPageTitle(title);
          document.title = title;
        } else if (currentPath.includes("/resources")) {
          const title = "healthpathglobal - Course Resources";
          setPageTitle(title);
          document.title = title;
        } else {
          const title = "healthpathglobal - Watching Course";
          setPageTitle(title);
          document.title = title;
        }
      } else if (currentPath.includes("/videos")) {
        const title = "healthpathglobal - Course Content";
        setPageTitle(title);
        document.title = title;
      } else {
        const title = "healthpathglobal - Course Details";
        setPageTitle(title);
        document.title = title;
      }
      return;
    }

    // Handle program details
    if (currentPath.startsWith("/programs/")) {
      const title = "healthpathglobal - Détails des études à l’étranger";
      setPageTitle(title);
      document.title = title;
      return;
    }

    // Handle dashboard internship details
    if (currentPath.startsWith("/dashboard/internships/")) {
      const title = "healthpathglobal - Internship Details";
      setPageTitle(title);
      document.title = title;
      return;
    }

    // Handle payment pages
    if (currentPath.startsWith("/payment/")) {
      if (currentPath.includes("/success")) {
        const title = "healthpathglobal - Payment Successful";
        setPageTitle(title);
        document.title = title;
      } else {
        const title = "healthpathglobal - Payment";
        setPageTitle(title);
        document.title = title;
      }
      return;
    }

    // Handle search
    if (currentPath.startsWith("/search")) {
      const title = "healthpathglobal - Search Results";
      setPageTitle(title);
      document.title = title;
      return;
    }

    // Handle dashboard sub-pages
    if (currentPath.startsWith("/dashboard/")) {
      const pathSegment = currentPath.split("/")[2];
      const dashboardTitles = {
        messages: "healthpathglobal - Dashboard - Messages",
        applications: "healthpathglobal - Dashboard - My Applications",
        certificates: "healthpathglobal - Dashboard - My Certificates",
        favorites: "healthpathglobal - Dashboard - My Favorites",
        notifications: "healthpathglobal - Dashboard - Notifications",
        settings: "healthpathglobal - Dashboard - Settings",
        "my-learning": "healthpathglobal - My Learning",
        "my-programs": "healthpathglobal - Mes études à l’étranger",
      };
      const title =
        dashboardTitles[pathSegment] || "healthpathglobal - Dashboard";
      setPageTitle(title);
      document.title = title;
      return;
    }

    // Default
    setPageTitle("healthpathglobal");
    document.title = "healthpathglobal";
  }, [location.pathname, titleMapping]);

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
