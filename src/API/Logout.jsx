import Swal from "sweetalert2";
import i18n from "../i18n";
import apiClient from "../utils/apiClient";

const handleLogout = async ({
  setAuth,
  setUser,
  storeLogout,
  setIsDropdownOpen = null,
}) => {
  const { t } = i18n;

  try {
    // Send a request to the logout endpoint on the server
    await apiClient.post(
      "/Logout",
      {},
      {
        validateStatus: () => true,
      },
    );
  } catch (error) {
  } finally {
    // Close dropdown if function was provided
    if (setIsDropdownOpen) {
      setIsDropdownOpen(false);
    }

    // Clear user data and authentication state
    // storeLogout();
    // setAuth(false);
    // setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    // Show success alert for 2 seconds then redirect
    Swal.fire({
      title: t("alerts.auth.logoutSuccessTitle", "Logged Out"),
      text: t(
        "alerts.auth.logoutSuccessText",
        "You have been successfully logged out",
      ),
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      window.location.href = "/";
    });
  }
};

export default handleLogout;
