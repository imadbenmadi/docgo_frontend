import apiClient from "../utils/apiClient";

// API for payment configuration
export const PaymentAPI = {
  // Get payment configuration (public)
  getPaymentInfo: async () => {
    try {
      const response = await apiClient.get("/payment/info");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin only: Get full payment configuration
  getAdminPaymentInfo: async () => {
    try {
      const response = await apiClient.get("/payment/admin/info");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin only: Update payment configuration
  updatePaymentInfo: async (configData) => {
    try {
      const response = await apiClient.put("/payment/admin/info", configData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default PaymentAPI;
