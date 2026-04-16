import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBars, FaTimes } from "react-icons/fa";
import { BsBell, BsBellFill, BsHeart, BsHeartFill } from "react-icons/bs";
import PropTypes from "prop-types";
import logo from "../../assets/Logo.png";
import LanguageDropdown from "../../components/LanguageDropdown";
import { useAppContext } from "../../AppContext";
import { useFavorites } from "../../hooks/useFavorite";
import { useUserNavigation } from "../../context/UserNavigationContext";
import NavBarDropDown from "./NavBarDropDown";
import { getApiBaseUrl } from "../../utils/apiBaseUrl";
import useScrollLock from "../../hooks/useScrollLock";

function NavigationMobile({ branding = null, unreadNotifications = 0 }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const { user, isAuth } = useAppContext();
  const { getActiveNavItem } = useUserNavigation();
  const location = useLocation();

  const apiBase = getApiBaseUrl();
  const brandName = branding?.brandName || "";
  const brandLogoSrc = (() => {
    const logoUrl = branding?.logoUrl;
    if (!logoUrl) return logo;
    const base = `${apiBase}${logoUrl}`;
    const updatedAt = branding?.logoUpdatedAt;
    if (!updatedAt) return base;
    const version = new Date(updatedAt).getTime();
    return `${base}?v=${version}`;
  })();

  const { totalCount } = useFavorites();

  useScrollLock(isOpen);

  const closeMobileMenu = () => setIsOpen(false);

  return (
    <div className="block lg:hidden sticky top-0 z-[999]">
      <div className="border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="min-w-0 flex-1" onClick={closeMobileMenu}>
            <div className="flex min-w-0 items-center gap-3">
              <img
                className="h-12 w-12 flex-shrink-0 rounded-xl object-cover shadow-sm ring-2 ring-gray-100 transition-transform duration-300 hover:scale-105"
                src={brandLogoSrc}
                alt="Logo"
              />
              {brandName ? (
                <div className="min-w-0">
                  <span className="block max-w-[42vw] truncate text-sm font-extrabold leading-tight tracking-tight text-gray-900 sm:max-w-[52vw] sm:text-base">
                    {brandName}
                  </span>
                </div>
              ) : null}
            </div>
          </Link>
          <div className="flex h-10 w-20 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-all duration-300">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className={` ${
                isOpen
                  ? "rotate-180 bg-red-50 text-red-500"
                  : "text-[#0086C9] hover:bg-blue-50 hover:text-blue-600"
              }`}
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <LanguageDropdown compact menuClassName="left-0" />

            <Link
              to="/favorites"
              className="relative flex h-10 min-w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-gray-600 transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              title={t("Favorites", "Favorites") || "Favorites"}
            >
              {totalCount > 0 ? (
                <BsHeartFill className="h-5 w-5 text-red-500" />
              ) : (
                <BsHeart className="h-5 w-5" />
              )}
              {totalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </Link>

            {isAuth && user && (
              <Link
                to="/notifications"
                className="relative flex h-10 min-w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-gray-600 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500"
                title={t("notifications.title", "Notifications")}
              >
                {unreadNotifications > 0 ? (
                  <BsBellFill className="h-5 w-5 text-blue-500" />
                ) : (
                  <BsBell className="h-5 w-5" />
                )}
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold text-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            {user && isAuth ? (
              <NavBarDropDown
                isDropdownOpen={isAvatarDropdownOpen}
                setIsDropdownOpen={setIsAvatarDropdownOpen}
                buttonClassName="h-10 w-10 flex-shrink-0 shadow-md hover:scale-105"
                menuClassName="top-28"
              />
            ) : (
              <Link
                to="/login"
                className="flex h-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0086C9] px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0077b3]"
              >
                {t("Login", "Login")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 w-full border-t border-gray-100 bg-white/95 shadow-xl backdrop-blur-md z-[999] animate-in slide-in-from-top-3 fade-in duration-300">
          <div className="px-6 py-4 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain">
            <div className="flex flex-col space-y-2">
              {user && isAuth && (
                <Link
                  to="/Profile"
                  className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                        ${
                                          location.pathname === "/Profile"
                                            ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                        }`}
                  onClick={closeMobileMenu}
                >
                  <span className="relative z-10">
                    {t("Profile_nav", "Profile")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              )}

              {/* {user && isAuth && (
                <>
                  <Link
                    to="/dashboard/my-learning"
                    className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                            ${
                                              location.pathname
                                                .toLowerCase()
                                                .startsWith(
                                                  "/dashboard/my-learning",
                                                )
                                                ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                                : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                            }`}
                    onClick={closeMobileMenu}
                  >
                    <span className="relative z-10">
                      {t("MyLearning", "My Learning")}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </Link>
                  <Link
                    to="/dashboard/my-programs"
                    className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                            ${
                                              location.pathname
                                                .toLowerCase()
                                                .startsWith(
                                                  "/dashboard/my-programs",
                                                )
                                                ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                                : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                            }`}
                    onClick={closeMobileMenu}
                  >
                    <span className="relative z-10">
                      {t("MyPrograms", "Mes études à l’étranger")}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </Link>
                </>
              )} */}

              <Link
                to="/"
                className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                    ${
                                      getActiveNavItem === "home"
                                        ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                    }`}
                onClick={closeMobileMenu}
              >
                <span className="relative z-10">{t("Home_nav", "Home")}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              {user && isAuth && (
                <Link
                  to="/dashboard"
                  className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                        ${
                                          location.pathname
                                            .toLowerCase()
                                            .startsWith("/dashboard")
                                            ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                        }`}
                  onClick={closeMobileMenu}
                >
                  <span className="relative z-10">
                    {t("UserDashboard_nav", "My Dashboard")}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              )}

              <Link
                to="/Programs"
                className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                    ${
                                      getActiveNavItem === "programs"
                                        ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                    }`}
                onClick={closeMobileMenu}
              >
                <span className="relative z-10">
                  {t("Programs_nav", "Études à l’étranger")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              <Link
                to="/Courses"
                className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                    ${
                                      getActiveNavItem === "courses"
                                        ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                    }`}
                onClick={closeMobileMenu}
              >
                <span className="relative z-10">
                  {t("Courses_nav", "Apprentissage")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              <Link
                to="/other-services"
                className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                    ${
                                      getActiveNavItem === "services"
                                        ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                    }`}
                onClick={closeMobileMenu}
              >
                <span className="relative z-10">
                  {t("Services_nav", "Services")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              <Link
                to="/favorites"
                className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden flex items-center gap-2
                                    ${
                                      getActiveNavItem === "favorites"
                                        ? "bg-red-50 text-red-600 border-l-4 border-red-500"
                                        : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    }`}
                onClick={closeMobileMenu}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {totalCount > 0 ? (
                    <BsHeartFill className="w-4 h-4 text-red-500" />
                  ) : (
                    <BsHeart className="w-4 h-4" />
                  )}
                  {t("Favorites", "Favorites")}
                  {totalCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-[20px] ml-auto">
                      {totalCount > 99 ? "99+" : totalCount}
                    </span>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              <Link
                to="/faq"
                className={`px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                    ${
                                      getActiveNavItem === "faq"
                                        ? "bg-blue-50 text-[#0086C9] border-l-4 border-[#0086C9]"
                                        : "text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]"
                                    }`}
                onClick={closeMobileMenu}
              >
                <span className="relative z-10">{t("FAQ", "FAQ")}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              {/* {!user && !isAuth && (
                <>
                  <button
                    onClick={() => handleScrollToSection("ourServices")}
                    className="px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                            text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer bg-transparent border-none text-left w-full"
                  >
                    <span className="relative z-10">
                      {t("OurServicesLink", "Our Services")}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </button>
                  <button
                    onClick={() => handleScrollToSection("aboutUs")}
                    className="px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                            text-gray-700 hover:bg-green-50 hover:text-green-600 cursor-pointer bg-transparent border-none text-left w-full"
                  >
                    <span className="relative z-10">{t("AboutUsLink", "About Us")}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </button>
                </>
              )} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

NavigationMobile.propTypes = {
  branding: PropTypes.shape({
    brandName: PropTypes.string,
    logoUrl: PropTypes.string,
    logoUpdatedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
  }),
  unreadNotifications: PropTypes.number,
};

export default NavigationMobile;
