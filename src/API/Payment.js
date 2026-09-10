import apiClient from "../services/apiClient";
import OrdersAPI from "./Orders";

// Payment API (CCP screenshot payments only for now)
export const PaymentAPI = {
  // =================================================================
  // CHECK PAYMENT APPLICATION
  // =================================================================

  // Check if user has an existing payment application for an item
  checkPaymentApplication: async (itemType, itemId) => {
    try {
      const response = await apiClient.get(
        `/user-payments/check-application/${itemType}/${itemId}`,
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to check payment application",
      };
    }
  },

  // Get all user's payments
  getMyPayments: async () => {
    try {
      const response = await apiClient.get("/user-payments/my-payments");

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch payments",
      };
    }
  },

  // =================================================================
  // ONLINE PAYMENT METHODS (DISABLED)
  // =================================================================

  // Create online payment order
  createPayPalPayment: async (itemData) => {
    return {
      success: false,
      message:
        "Online payments are disabled. Please use CCP screenshot payment.",
      error: "PAYPAL_DISABLED",
    };
  },

  // Capture online payment after approval
  capturePayPalPayment: async (orderId) => {
    return {
      success: false,
      message:
        "Online payments are disabled. Please use CCP screenshot payment.",
      error: "PAYPAL_DISABLED",
    };
  },

  // =================================================================
  // COUPON VALIDATION
  // =================================================================

  validateCoupon: async (code, itemType) => {
    try {
      const response = await apiClient.post("/coupons/validate", {
        code,
        itemType,
      });
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Coupon invalide ou expiré",
      };
    }
  },

  // =================================================================
  // CCP PAYMENT METHODS
  // =================================================================

  // Create CCP payment with screenshot upload
  /**
   * Pay for something by CCP.
   *
   * Two steps against one pipeline: place the order, then send the receipt.
   * This used to be a three-way branch - /upload/Payment/Courses/:id for a
   * course, /upload/Payment/Programs/:id for a program and
   * /payments/ccp/create for the other two - and the three did different
   * things, which is most of why the four products behaved differently.
   *
   * If an order is already waiting on this item, the receipt goes onto that
   * one rather than failing with "you already have an order open", which is
   * what somebody who reloaded the page and tried again expects.
   */
  createCCPPayment: async (itemData, paymentForm, screenshotFile) => {
    if (!paymentForm.ccpNumber) {
      return { success: false, message: "CCP number is required" };
    }
    if (!screenshotFile) {
      return { success: false, message: "Screenshot is required" };
    }

    const { itemType, itemId } = itemData;

    const existing = await OrdersAPI.access(itemType, itemId);
    if (existing.success && existing.hasAccess) {
      return { success: false, message: "You already have this" };
    }

    let order = existing.success ? existing.order : null;
    const reusable =
      order && (order.status === "pending" || order.status === "rejected");

    if (!reusable) {
      const placed = await OrdersAPI.place({
        itemType,
        itemId,
        couponCode: paymentForm.couponCode,
        discountedPrice: paymentForm.discountedPrice,
      });
      if (!placed.success) return placed;
      order = placed.order;
    }

    // Sending against a rejected order starts a new attempt on the server and
    // returns the new order, so nothing here has to know the difference.
    const sent = await OrdersAPI.sendReceipt(order.id, {
      file: screenshotFile,
      ccpNumber: paymentForm.ccpNumber,
      phoneNumber: paymentForm.phoneNumber,
    });
    if (!sent.success) return sent;

    return {
      success: true,
      message: sent.message,
      data: {
        paymentId: sent.order.id,
        reference: sent.order.reference,
        amount: sent.order.price,
        currency: sent.order.currency,
        status: "pending_verification",
        attemptNumber: sent.order.attemptNumber,
      },
    };
  },

  // =================================================================
  // CCP PAYMENT CLEANUP (Error/Cancellation Handling)
  // =================================================================

  // Clean up CCP payment screenshot after error or cancellation
  /**
   * Nothing to clean up any more, and that is deliberate.
   *
   * This used to DELETE /upload/Payment/Courses/:id when a payment attempt
   * was abandoned - a route that removed the payment row and its screenshot.
   * On this platform a payment record is never destroyed, and an order
   * somebody started and walked away from is a real record of what they were
   * trying to do, not litter.
   *
   * The order stays pending. If they come back, the receipt attaches to it;
   * if they never do, an admin can see they tried. Kept as a function because
   * PaymentPage calls it on the error and unload paths.
   */
  cleanupCCPPayment: async () => ({
    success: true,
    message: "Nothing is cleaned up - the order is kept.",
  }),

  // =================================================================
  // PAYMENT HISTORY AND STATUS
  // =================================================================

  // Get user payment history
  getUserPayments: async (params = {}) => {
    try {
      const response = await apiClient.get("/payment/my-payments", {
        params,
      });

      return {
        success: true,
        data: response.data.data,
        message: "Payment history fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch payment history",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get specific payment details
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payment/${paymentId}`);

      return {
        success: true,
        data: response.data.data,
        message: "Payment details fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch payment details",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Cancel payment
  cancelPayment: async (paymentId) => {
    try {
      const response = await apiClient.post(`/payment/${paymentId}/cancel`);

      return {
        success: true,
        data: response.data.data,
        message: "Payment cancelled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to cancel payment",
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

export default PaymentAPI;
