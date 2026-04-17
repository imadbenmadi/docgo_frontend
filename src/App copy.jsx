import { useEffect, useState } from "react";
import "./index.css";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./LandingPage/Layout/Footer";
import Reveal from "./components/Reveal";
import Navigation from "./components/Navbar/Navigation";
import visitService from "./services/VisitTrackerService";
import { useAppContext } from "./AppContext";
import { UserNavigationProvider } from "./context/UserNavigationContext";
import MainLoading from "./MainLoading";
import Seo from "./components/SEO/Seo";
import { useTranslation } from "react-i18next";
import { getApiBaseUrl } from "./utils/apiBaseUrl";
import ScrollToTopOnRouteChange from "./components/Common/ScrollToTopOnRouteChange";

const API_URL_FALLBACK = getApiBaseUrl();

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  // Auth state + pre-fetched site data (fetched in parallel on startup by AppContext)
  const { loading: authLoading, siteSettings, contactInfo } = useAppContext();
  const { i18n } = useTranslation();

  // Keep favicon in sync with the logo saved by the admin
  useEffect(() => {
    if (!siteSettings?.logoUrl) return;
    const base = siteSettings.logoUrl.startsWith("http")
      ? siteSettings.logoUrl
      : `${API_URL_FALLBACK}${siteSettings.logoUrl}`;
    const v = siteSettings.logoUpdatedAt
      ? `?v=${new Date(siteSettings.logoUpdatedAt).getTime()}`
      : "";
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = `${base}${v}`;
  }, [siteSettings?.logoUrl, siteSettings?.logoUpdatedAt]);

  // Check if we're in auth routes that shouldn't have navbar/footer
  const pathname = location.pathname.toLowerCase();
  const isAuthRoute = ["/login", "/register"].includes(pathname);
  const shouldHideNavAndFooter = isAuthRoute;

  const isProtectedArea =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/myapplications") ||
    pathname.startsWith("/my-applications") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/payment") ||
    pathname.includes("/watch") ||
    pathname.includes("/videos") ||
    pathname.includes("/resources") ||
    pathname.includes("/certificate");

  const noIndex = isAuthRoute || isProtectedArea;

  const seoLang = (i18n.language || "en").toLowerCase().startsWith("ar")
    ? "ar"
    : "en";
  const seoLocale = seoLang === "ar" ? "ar_DZ" : "en_US";

  // Dynamic brand name - falls back to "healthpathglobal" until site settings load
  const brand = siteSettings?.brandName || "healthpathglobal";

  const seo = (() => {
    if (pathname === "/") {
      return {
        title: "Home",
        description: `${brand}: explore l'apprentissage et les études à l’étranger, enroll, and learn online.`,
      };
    }

    if (pathname === "/courses") {
      return {
        title: "Apprentissage",
        description: `Parcourez tous les apprentissages disponibles sur ${brand}.`,
      };
    }

    if (pathname.startsWith("/courses/")) {
      return {
        title: pathname.includes("/watch") ? "Watch Course" : "Course",
        description: `Course details and learning content on ${brand}.`,
      };
    }

    if (pathname === "/programs") {
      return {
        title: "Études à l’étranger",
        description: `Parcourez toutes les études à l’étranger disponibles sur ${brand}.`,
      };
    }

    if (pathname.startsWith("/programs/")) {
      return {
        title: "Program",
        description: `Program details and enrollment on ${brand}.`,
      };
    }

    if (pathname === "/faq") {
      return {
        title: "FAQ",
        description: `Frequently asked questions about ${brand}.`,
      };
    }

    if (pathname === "/favorites") {
      return {
        title: "Favorites",
        description: `Vos apprentissages et études à l’étranger enregistrés sur ${brand}.`,
      };
    }

    if (pathname === "/login") {
      return {
        title: "Login",
        description: `Login to your ${brand} account.`,
      };
    }

    if (pathname === "/register") {
      return {
        title: "Register",
        description: `Create your ${brand} account.`,
      };
    }

    if (pathname.startsWith("/dashboard")) {
      return {
        title: "Dashboard",
        description: `Your ${brand} dashboard.`,
      };
    }

    return {
      title: brand,
      description: `${brand}: explore l'apprentissage et les études à l’étranger, enroll, and learn online.`,
    };
  })();

  useEffect(() => {
    // Track page visit whenever location changes
    visitService.registerVisit(location.pathname);

    // Clean up function
    return () => {
      visitService.updateDuration();
    };
  }, [location.pathname]);

  useEffect(() => {
    setLoading(true);

    const fetch_Images = () => {
      return new Promise((resolve) => {
        const Images = [];
        let loadedCount = 0;

        if (Images.length === 0) {
          resolve();
          return;
        }

        Images.forEach((ImageSrc) => {
          const img = new Image();
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === Images.length) {
              resolve();
            }
          };
          img.src = ImageSrc;
        });
      });
    };

    const fetch_fonts = () => {
      return new Promise((resolve) => {
        const fontURL =
          "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap";

        const loadFont = (url) => {
          return new Promise((fontResolve) => {
            const link = document.createElement("link");
            link.href = url;
            link.rel = "stylesheet";
            link.onload = () => {
              document.getElementById("root").style.fontFamily = "Rubik";
              fontResolve();
            };
            link.onerror = () => {
              document.getElementById("root").style.fontFamily = "sans-serif";
              fontResolve();
            };
            document.head.appendChild(link);
          });
        };

        loadFont(fontURL).then(resolve);
      });
    };

    Promise.all([fetch_Images(), fetch_fonts()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Show loading while assets are loading OR authentication is checking
  if (loading || authLoading) {
    return <MainLoading />;
  }

  return (
    <UserNavigationProvider>
      <div className="relative pt-8 lg:pt-0">
        <ScrollToTopOnRouteChange />
        <Seo
          title={seo.title}
          description={seo.description}
          canonicalPath={location.pathname}
          noIndex={noIndex}
          lang={seoLang}
          locale={seoLocale}
          siteName={brand}
        />
        {!shouldHideNavAndFooter && <Navigation branding={siteSettings} />}
        {/* <div className="pt-28 lg:pt-0"> */}
        <div className="pt-28 lg:pt-0">
          <Outlet />
        </div>
        {!shouldHideNavAndFooter && (
          <Reveal>
            <Footer contactInfo={contactInfo} branding={siteSettings} />
          </Reveal>
        )}
      </div>
    </UserNavigationProvider>
  );
}

export default App;
