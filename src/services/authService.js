import apiClient from "../utils/apiClient";

export const authService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    // fetch to check if user is authenticated from the server
    const response = apiClient.get("/check_Auth");
    return response.status === 200;
  },

  // Get current user
  getCurrentUser: () => {
    const userStr =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Login
  // login: async (credentials) => {
  //     try {
  //         const response = await api.post("/Login", credentials);

  //         if (response.status === 200 && response.data.user) {
  //             const { user, token } = response.data;

  //             // Store user and token
  //             localStorage.setItem("user", JSON.stringify(user));
  //             localStorage.setItem("token", token);

  //             return { user, token };
  //         }

  //         throw new Error("Invalid response from server");
  //     } catch (error) {
  //         throw error;
  //     }
  // },

  // Register
  // register: async (userData) => {
  //     try {
  //         const response = await api.post("/Register", userData);
  //         return response.data;
  //     } catch (error) {
  //         throw error;
  //     }
  // },

  // Logout
  logout: async (options = {}) => {
    const redirectTo =
      typeof options.redirectTo === "string" && options.redirectTo
        ? options.redirectTo
        : "/";
    try {
      await apiClient.post("/Logout");
    } catch (error) {
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      window.location.href = redirectTo;
    }
  },
};

export default authService;
