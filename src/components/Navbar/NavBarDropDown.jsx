import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import handleLogout from "../../API/Logout";
import { useAppContext } from "../../AppContext";
import { ProfilePictureAvatar } from "../../utils/profilePictureHelper";

const NavBarDropDown = ({
  isDropdownOpen,
  setIsDropdownOpen,
  buttonClassName = "",
  menuClassName = "",
}) => {
  const { t } = useTranslation();
  const { user, set_Auth, set_user, store_logout } = useAppContext();
  const avatarDropdownRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showImageFallback, setShowImageFallback] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({});

  const { i18n } = useTranslation();
  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        avatarDropdownRef.current &&
        !avatarDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsDropdownOpen]);

  // Calculate dropdown position to keep it in view
  useEffect(() => {
    if (isDropdownOpen && avatarDropdownRef.current && dropdownRef.current) {
      const buttonRect = avatarDropdownRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      let left = buttonRect.left + buttonRect.width / 2;
      let adjustedLeft = left - dropdownRect.width / 2;

      // Check if dropdown goes off the right edge
      if (adjustedLeft + dropdownRect.width > viewportWidth - 8) {
        adjustedLeft = viewportWidth - dropdownRect.width - 8;
      }

      // Check if dropdown goes off the left edge
      if (adjustedLeft < 8) {
        adjustedLeft = 8;
      }

      setDropdownPosition({
        left: adjustedLeft,
        top: buttonRect.bottom + 8,
      });
    }
  }, [isDropdownOpen]);
  const logout = () => {
    handleLogout({
      setAuth: set_Auth,
      setUser: set_user,
      storeLogout: store_logout,
      setIsDropdownOpen: setIsDropdownOpen,
    });
  };

  return (
    <div className="relative" ref={avatarDropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg hover:shadow-xl
                transition-all duration-300 transform hover:scale-110 relative flex items-center justify-center ${buttonClassName}`}
      >
        {showImageFallback || !user?.profile_pic_link ? (
          // Fallback: Show FaUser icon
          <FaUser className="w-5 h-5 text-white bg-gradient-to-br from-blue-400 to-blue-600 p-2.5 rounded-full" />
        ) : (
          // Show profile picture
          <ProfilePictureAvatar
            user={user}
            size="md"
            showBorder={isDropdownOpen}
            borderColor="border-[#0086C9]"
            className="w-full h-full"
            onImageError={() => setShowImageFallback(true)}
          />
        )}
        {/* Visual indicator ring for when dropdown is open */}
        <div
          className={`absolute inset-0 rounded-full border-2 pointer-events-none transition-all duration-300
                    ${
                      isDropdownOpen
                        ? "border-[#0086C9] scale-125"
                        : "border-transparent scale-100"
                    }`}
        />
      </button>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className={`fixed w-40 sm:w-48 md:w-56 z-50
                    animate-in slide-in-from-top-2 fade-in duration-200 ${menuClassName}`}
          style={{
            left: `${dropdownPosition.left}px`,
            top: `${dropdownPosition.top}px`,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            border: "1px solid rgba(0,0,0,0.1)",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          }}
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-blue-200">
                <ProfilePictureAvatar
                  user={user}
                  size="sm"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {user?.firstName
                    ? user.firstName.length > 12
                      ? user.firstName.slice(0, 12) + "..."
                      : user.firstName
                    : t("guest", "Guest")}
                </p>
                <p className="text-xs text-gray-500">
                  {t("welcomeBack", "Welcome Back")}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/Profile"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]
                            transition-all duration-200 relative overflow-hidden"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#0086C9] scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
              <span className="ml-2">{t("Profile", "Profile")}</span>
            </Link>
            <Link
              to="/"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]
                            transition-all duration-200 relative overflow-hidden"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#0086C9] scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
              <span className="ml-2">{t("home", "Home")}</span>
            </Link>

            <Link
              to="/dashboard/my-learning"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]
                            transition-all duration-200 relative overflow-hidden"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#0086C9] scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
              <span className="ml-2">{t("MyLearning", "My Learning")}</span>
            </Link>
            <Link
              to="/dashboard/my-programs"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]
                            transition-all duration-200 relative overflow-hidden"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#0086C9] scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
              <span className="ml-2">
                {t("MyPrograms", "Mes études à l’étranger")}
              </span>
            </Link>

            <Link
              to="/myApplications"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0086C9]
                            transition-all duration-200 relative overflow-hidden"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-[#0086C9] scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
              <span className="ml-2">
                {t("MyApplications", "My Applications")}
              </span>
            </Link>

            {/* Notifications link removed from profile dropdown */}
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              className="group flex items-center w-full px-4 py-2 text-sm text-red-600
                            hover:bg-red-50 transition-all duration-200 relative overflow-hidden"
              onClick={logout}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-red-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
              <span className="ml-2">{t("Logout", "Logout")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBarDropDown;
