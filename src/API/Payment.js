import apiClient from "../services/apiClient";
import OrdersAPI from "./Orders";

// Payment API (CCP screenshot payments only for now)
export const PaymentAPI = {
  /**
   * Where this user stands on one item, in the shape the payment screens read.
   *
   * An order still waiting for its receipt is not reported: the user is on
   * the way to paying it, and the payment step reuses that order.
   */
  checkPaymentApplication: async (itemType, itemId) => {
    const res = await OrdersAPI.access(itemType, itemId);
    if (!res.success) return res;
    if (res.hasAccess) {
      return {
        success: true,
        data: {
          success: true,
          hasApplication: true,
          canSubmitNew: false,
          application: { status: "approved" },
        },
      };
    }
    const order = res.order;
    if (!order || order.nextStep === "send_receipt") {
      return { success: true, data: { success: true, hasApplication: false } };
    }
    return {
      success: true,
      data: {
        success: true,
        hasApplication: true,
        canSubmitNew: order.status !== "pending",
        application: {
          id: order.id,
          status: order.status,
          rejectionReason: order.rejectionReason,
          transactionId: order.reference,
          amount: order.price,
          currency: order.currency,
          createdAt: order.placedAt,
        },
      },
    };
  },

  /** Every order this user has placed. */
  getMyPayments: async () => {
    const res = await OrdersAPI.mine();
    return res.success ? { success: true, data: res.orders } : res;
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
      // An order placed before this page gets the coupon here.
      couponCode: order.status === "pending" ? paymentForm.couponCode : undefined,
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

};

export default PaymentAPI;
