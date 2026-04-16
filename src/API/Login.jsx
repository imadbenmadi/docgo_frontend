import Swal from "sweetalert2";
import apiClient from "../utils/apiClient";

const handleLogin = async ({ userData, setAuth, setUser, onError = null }) => {
  try {
    const response = await apiClient.post("/Login", userData, {
      validateStatus: () => true,
    });

    if (response.status === 200) {
      const user = response.data.user;
      if (!user) {
        throw new Error("User data not found in response");
      }

      // Update authentication state
      //   if (setAuth) setAuth(true);
      //   if (setUser) setUser(user);

      //   // Store user data in local and session storage
      //   localStorage.setItem("user", JSON.stringify(user));
      //   sessionStorage.setItem("user", JSON.stringify(user));

      //   Swal.fire({
      //     title: "Login Successful",
      //     text: "You have successfully logged in.",
      //     icon: "success",
      //     confirmButtonText: "OK",
      //     timer: 2000,
      //     timerProgressBar: true,
      //   }).then(() => {
      //     window.location.href = "/dashboard";
      //   });

      return {
        success: true,
        message: "Login successful",
        data: response.data,
      };
    } else {
      // Handle error response
      const errorMessage = response.data?.message || "Login failed";

      if (onError) {
        onError({
          message: errorMessage,
          status: response.status,
        });
      }

      return {
        success: false,
        message: errorMessage,
        status: response.status,
        data: response.data,
      };
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Login failed. Please try again.";

    if (onError) {
      onError({
        message: errorMessage,
        error,
      });
    }

    return {
      success: false,
      message: errorMessage,
      error,
    };
  }
};

export default handleLogin;
