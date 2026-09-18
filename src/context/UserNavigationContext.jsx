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
      "/": "healthpathglobal - Accueil",
      "/home": "healthpathglobal - Accueil",
      "/programs": "healthpathglobal - Explorer les études à l’étranger",
      "/courses": "healthpathglobal - Parcourir l'apprentissage",
      "/other-services": "healthpathglobal - Services",
      "/other-services/cv": "healthpathglobal - Service CV",
      "/other-services/internships": "healthpathglobal - Stages",
      "/other-services/my-applications":
        "healthpathglobal - Mes demandes de services",
      "/faq": "healthpathglobal - Questions fréquentes",
      "/favorites": "healthpathglobal - Mes favoris",
      "/dashboard/favorites": "healthpathglobal - Mes favoris",
      "/dashboard/meetings": "healthpathglobal - Réunions",
      "/notifications": "healthpathglobal - Notifications",
      "/myapplications": "healthpathglobal - Mes demandes",
      "/my-applications": "healthpathglobal - Mes demandes",
      "/profile": "healthpathglobal - Mon profil",
      "/profile/edit": "healthpathglobal - Modifier mon profil",
      "/dashboard": "healthpathglobal - Mon espace",
      "/dashboard/my-learning": "healthpathglobal - Mon apprentissage",
      "/dashboard/my-programs": "healthpathglobal - Mes études à l’étranger",
      "/dashboard/cv": "healthpathglobal - Service CV",
      "/dashboard/internships": "healthpathglobal - Stages",
      "/dashboard/my-orders": "healthpathglobal - Mes commandes",
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
          const title = "healthpathglobal - Quiz du cours";
          setPageTitle(title);
          document.title = title;
        } else if (currentPath.includes("/certificate")) {
          const title = "healthpathglobal - Certificat";
          setPageTitle(title);
          document.title = title;
        } else if (currentPath.includes("/resources")) {
          const title = "healthpathglobal - Ressources du cours";
          setPageTitle(title);
          document.title = title;
        } else {
          const title = "healthpathglobal - Cours en cours";
          setPageTitle(title);
          document.title = title;
        }
      } else if (currentPath.includes("/videos")) {
        const title = "healthpathglobal - Contenu du cours";
        setPageTitle(title);
        document.title = title;
      } else {
        const title = "healthpathglobal - Détails du cours";
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
      const title = "healthpathglobal - Détails du stage";
      setPageTitle(title);
      document.title = title;
      return;
    }

    // Handle payment pages
    if (currentPath.startsWith("/payment/")) {
      if (currentPath.includes("/success")) {
        const title = "healthpathglobal - Paiement réussi";
        setPageTitle(title);
        document.title = title;
      } else {
        const title = "healthpathglobal - Paiement";
        setPageTitle(title);
        document.title = title;
      }
      return;
    }

    // Handle search
    if (currentPath.startsWith("/search")) {
      const title = "healthpathglobal - Résultats de recherche";
      setPageTitle(title);
      document.title = title;
      return;
    }

    // Handle dashboard sub-pages
    if (currentPath.startsWith("/dashboard/")) {
      const pathSegment = currentPath.split("/")[2];
      const dashboardTitles = {
        messages: "healthpathglobal - Espace - Messages",
        applications: "healthpathglobal - Espace - Mes demandes",
        certificates: "healthpathglobal - Espace - Mes certificats",
        favorites: "healthpathglobal - Espace - Mes favoris",
        notifications: "healthpathglobal - Espace - Notifications",
        settings: "healthpathglobal - Espace - Paramètres",
        "my-learning": "healthpathglobal - Mon apprentissage",
        "my-programs": "healthpathglobal - Mes études à l’étranger",
        meetings: "healthpathglobal - Réunions",
        "my-orders": "healthpathglobal - Mes commandes",
      };
      const title =
        dashboardTitles[pathSegment] || "healthpathglobal - Mon espace";
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
