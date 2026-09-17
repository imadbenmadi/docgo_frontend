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

};

export default PaymentAPI;
