import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BsHeart, BsHeartFill, BsBell, BsBellFill } from "react-icons/bs";
import { useAppContext } from "../../AppContext";
import { useFavorites } from "../../hooks/useFavorite";
import { useUserNavigation } from "../../context/UserNavigationContext";
import logo from "../../assets/Logo.png";
import LanguageDropdown from "../../components/LanguageDropdown";
import LightColoredButton from "../../components/Buttons/LightColoredButton";
import NavigationMobile from "./NavigationMobile";
import NavBarDropDown from "./NavBarDropDown";
import apiClient from "../../services/apiClient";
import { getApiBaseUrl } from "../../utils/apiBaseUrl";

function Navigation({ branding = null }) {
  const { t } = useTranslation();
  const { user, isAuth } = useAppContext();
  const { getActiveNavItem } = useUserNavigation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const lastScrollYRef = useRef(0);

  const isDashboardRoute = location.pathname
    .toLowerCase()
    .startsWith("/dashboard");

  const apiBase = getApiBaseUrl();
  const brandName = branding?.brandName || "";
  const displayBrandName =
    brandName.length > 26 ? `${brandName.slice(0, 26).trim()}...` : brandName;
  const brandLogoSrc = (() => {
    const logoUrl = branding?.logoUrl;
    if (!logoUrl) return logo;
    const base = `${apiBase}${logoUrl}`;
    const updatedAt = branding?.logoUpdatedAt;
    if (!updatedAt) return base;
    const v = new Date(updatedAt).getTime();
    return `${base}?v=${v}`;
  })();

  // Add favorites hook
  const { totalCount } = useFavorites();

  // Unread notification count badge
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  useEffect(() => {
    if (!isAuth || !user) {
      setUnreadNotifications(0);
      return;
    }
    let cancelled = false;
    apiClient
      .get("/notifications/unread-count")
      .then((res) => {
        if (!cancelled && res.data?.success) {
          setUnreadNotifications(res.data.unreadCount || 0);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuth, user]);

  // Scroll detection for navbar background
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      setIsScrolled(currentScrollY > 24);
      setScrollProgress(
        maxScrollableHeight > 0
          ? Math.min((currentScrollY / maxScrollableHeight) * 100, 100)
          : 0,
      );

      if (currentScrollY <= 16) {
        setIsNavVisible(true);
      } else if (
        currentScrollY > lastScrollYRef.current &&
        currentScrollY > 96
      ) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollYRef.current) {
        setIsNavVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section detection
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(location.pathname);
      return;
    }

    const sections = ["ourServices", "aboutUs"];
    const handleScroll = () => {
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      setActiveSection(current || "");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Function to handle scrolling to sections
  const handleScrollToSection = (sectionId) => {
    if (location.pathname === "/") {
      // If already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      // Navigate to home first, then scroll
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };
  const MainContent = () => {
    const activeNavItem = getActiveNavItem;

    const getNavLinkClass = (itemId, sectionId = null) => {
      let isActive = false;

      if (sectionId) {
        // For section buttons (Our Services, About Us)
        isActive = activeSection === sectionId;
      } else {
        // For regular navigation links
        isActive = activeNavItem === itemId;
      }

      return `relative px-2.5 py-2 font-medium text-sm xl:text-base whitespace-nowrap transition-all duration-300 group
                ${
                  isActive
                    ? "text-[#0086C9]"
                    : "text-gray-700 hover:text-[#0086C9]"
                }
                `;
    };

    const ActiveIndicator = ({ isActive }) => (
      <span
        className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#0086C9] to-[#00A6E6] 
                transition-transform duration-300 origin-center
                ${
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
      />
    );

    ActiveIndicator.propTypes = {
      isActive: PropTypes.bool,
    };

    const isHomeActive = activeNavItem === "home";
    const isProgramsActive = activeNavItem === "programs";
    const isCoursesActive = activeNavItem === "courses";
    const isServicesActive = activeNavItem === "services";
    const isFaqActive = activeNavItem === "faq";
    const isDashboardActive = location.pathname
      .toLowerCase()
      .startsWith("/dashboard");

    return (
      <div className="flex w-full items-center justify-center gap-1.5 overflow-x-auto whitespace-nowrap px-1 xl:gap-3 [&::-webkit-scrollbar]:hidden mb-32 lg:mb-0">
        <Link to="/" className={getNavLinkClass("home")}>
          {t("Home_nav", "Home")}
          <ActiveIndicator isActive={isHomeActive} />
        </Link>
        {isAuth && (
          <Link to="/dashboard" className={getNavLinkClass("dashboard")}>
            {t("UserDashboard_nav", "My Dashboard")}
            <ActiveIndicator isActive={isDashboardActive} />
          </Link>
        )}
        <Link to="/programs" className={getNavLinkClass("programs")}>
          {t("Programs_nav", "Études à l’étranger")}
          <ActiveIndicator isActive={isProgramsActive} />
        </Link>
        <Link to="/courses" className={getNavLinkClass("courses")}>
          {t("Courses_nav", "Apprentissage")}
          <ActiveIndicator isActive={isCoursesActive} />
        </Link>
        <Link to="/other-services" className={getNavLinkClass("services")}>
          {t("Services_nav", "Services")}
          <ActiveIndicator isActive={isServicesActive} />
        </Link>
        {/* {isAuth && (
                    <>
                        <Link
                            to="/dashboard/my-learning"
                            className={getNavLinkClass("dashboard")}
                        >
                            {t("MyLearning", "My Learning")}
                            <ActiveIndicator isActive={isDashboardActive} />
                        </Link>
                        <Link
                            to="/dashboard/my-programs"
                            className={getNavLinkClass("dashboard")}
                        >
                            {t("MyPrograms", "My Programs")}
                            <ActiveIndicator isActive={isDashboardActive} />
                        </Link>
                    </>
                )} */}
        <Link
          to="/faq"
          className={`${getNavLinkClass("faq")} flex items-center gap-1`}
        >
          {t("FAQ", "FAQ")}
          <ActiveIndicator isActive={isFaqActive} />
        </Link>
        {/* <Link
                    to="/favorites"
                    className="hover:text-[#0086C9] hover:text-[16px] font-medium transition-all duration-300 lg:max-3xl:text-sm md:max-lg:text-[12px] flex items-center gap-1"
                >
                    <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {t("Favorites", "Favorites")}
                </Link> */}
        {/* {!isAuth && (
          <>
            <button
              onClick={() => handleScrollToSection("ourServices")}
              className={`${getNavLinkClass(
                "",
                "ourServices",
              )} bg-transparent border-none cursor-pointer`}
            >
              {t("OurServicesLink", "Our Services")}
              <ActiveIndicator isActive={activeSection === "ourServices"} />
            </button>
            <button
              onClick={() => handleScrollToSection("aboutUs")}
              className={`${getNavLinkClass(
                "",
                "aboutUs",
              )} bg-transparent border-none cursor-pointer`}
            >
              {t("AboutUsLink", "About Us")}
              <ActiveIndicator isActive={activeSection === "aboutUs"} />
            </button>
          </>
        )} */}
      </div>
    );
  };

  return (
    <>
      <div className="lg:h-[132px]" />
      {/* <div className="h-20 sm:h-24 md:h-28 " /> */}

      <div
        className={`fixed inset-x-0 top-0 z-50 w-full transform transition-transform duration-300 ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        {/* Progress indicator */}
        <div
          className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#0086C9] to-transparent opacity-70"
          style={{
            background: `linear-gradient(90deg, 
                        transparent 0%, 
                        #0086C9 ${scrollProgress}%, 
                        transparent 100%)`,
          }}
        />

        <nav
          className={`mx-auto hidden max-w-screen-2xl px-4 sm:px-6 lg:block lg:px-8 transition-all duration-300 ${
            isScrolled ? "py-2" : "py-3"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="min-w-0 max-w-[54%] shrink-0">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  className={`rounded-xl object-cover transition-all duration-300 hover:scale-105 shadow-sm ring-2 ring-white ${
                    isScrolled
                      ? "h-12 w-12 xl:h-14 xl:w-14"
                      : "h-14 w-14 xl:h-16 xl:w-16"
                  }`}
                  src={brandLogoSrc}
                  alt="Logo"
                />
                {brandName ? (
                  <div className="min-w-0 max-w-[300px] xl:max-w-[420px]">
                    <span className="block truncate text-lg font-extrabold leading-tight tracking-tight text-gray-900 xl:text-xl">
                      {displayBrandName}
                    </span>
                  </div>
                ) : null}
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2 xl:gap-3 font-medium text-sm lg:text-base">
              <LanguageDropdown compact menuClassName="left-0" />

              <Link
                to="/favorites"
                className={`relative rounded-xl p-2.5 transition-all duration-300 group ${
                  location.pathname === "/favorites" ||
                  location.pathname.startsWith("/favorites/")
                    ? "bg-red-100 text-red-600"
                    : "text-gray-600 hover:text-red-500 hover:bg-red-50"
                }`}
                title={t("Favorites", "Favorites") || "Favorites"}
              >
                <div className="relative">
                  {totalCount > 0 ? (
                    <BsHeartFill className="h-5 w-5 text-red-500" />
                  ) : (
                    <BsHeart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  {totalCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1 text-xs font-bold text-white ring-2 ring-white">
                      {totalCount > 99 ? "99+" : totalCount}
                    </span>
                  )}
                </div>
              </Link>

              {isAuth && user && (
                <Link
                  to="/notifications"
                  className={`relative rounded-xl p-2.5 transition-all duration-300 group ${
                    location.pathname === "/notifications" ||
                    location.pathname.startsWith("/dashboard/notifications")
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:text-blue-500 hover:bg-blue-50"
                  }`}
                  title={t("notifications.title", "Notifications")}
                >
                  <div className="relative">
                    {unreadNotifications > 0 ? (
                      <BsBellFill className="h-5 w-5 text-blue-500" />
                    ) : (
                      <BsBell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    )}
                    {unreadNotifications > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-1 text-xs font-bold text-white ring-2 ring-white">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              {isAuth && user ? (
                <NavBarDropDown
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                  buttonClassName="h-10 w-10"
                />
              ) : (
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0086C9] px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0077b3]"
                >
                  {t("Login", "Login")}
                </Link>
              )}
            </div>
          </div>
          <div className="mt-2 border-t border-gray-100 pt-2">
            <MainContent />
          </div>
        </nav>

        {/* Pass the isDropdownOpen and setIsDropdownOpen states to NavigationMobile */}
        {!isDashboardRoute ? (
          <NavigationMobile
            branding={branding}
            unreadNotifications={unreadNotifications}
          />
        ) : null}
      </div>
    </>
  );
}

Navigation.propTypes = {
  branding: PropTypes.shape({
    brandName: PropTypes.string,
    logoUrl: PropTypes.string,
    logoUpdatedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
  }),
};

export default Navigation;
