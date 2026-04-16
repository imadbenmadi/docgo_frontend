import handleLogin from "./Login";
import apiClient from "../utils/apiClient";

export const validateFirstStep = async (userData) => {
  const { firstName, lastName, email, password } = userData;

  try {
    const response = await apiClient.post(
      "/Register/validate-step1",
      { firstName, lastName, email, password },
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      },
    );

    return {
      success: response.status === 200,
      message: response.data?.message || "Validation successful",
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Validation failed",
      error,
    };
  }
};

const handleRegister = async ({
  userData,
  setAuth,
  setUser,
  onSuccess = null,
  onError = null,
}) => {
  try {
    const response = await apiClient.post("/Register", userData, {
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    // If registration was successful
    if (response.status === 201 || response.status === 200) {
      // Automatically login after successful registration
      const loginData = {
        email: userData.email,
        password: userData.password,
      };
      // Attempt to login after successful registration
      const loginResult = await handleLogin({
        userData: loginData,
        setAuth,
        setUser,
        onSuccess,
        onError,
      });

      // If login is not successful, redirect to the login page
      if (!loginResult?.success) {
        return {
          status: 410,
          success: false,
          message: "Login failed after registration",
        };
      }

      // Update React context so the user is immediately seen as logged in
      // without needing a page refresh
      if (setAuth) setAuth(true);
      if (setUser) setUser(loginResult?.data?.user || null);

      localStorage.setItem(
        "user",
        JSON.stringify(loginResult?.data?.user || {}),
      );
      sessionStorage.setItem(
        "user",
        JSON.stringify(loginResult?.data?.user || {}),
      );

      return loginResult;
    } else {
      // Handle unsuccessful registration
      const errorMessage = response.data?.message || "Registration failed";

      if (onError) {
        onError({
          message: errorMessage,
          status: response.status,
          data: response.data,
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
      error.response?.data?.message || "Registration failed. Please try again.";

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

export default handleRegister;
