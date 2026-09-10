import apiClient from "../utils/apiClient";

/**
 * Ordering something, paying for it, and seeing where it stands.
 *
 * All four products go through the same two calls: place the order, then send
 * the receipt if there is anything to pay. There used to be four different
 * routes doing four different things, which is why a free CV service left you
 * in a state with no way forward and a paid internship sat pending forever.
 */

const fail = (error, fallback) => ({
  success: false,
  status: error?.response?.status ?? null,
  message: error?.response?.data?.message || fallback,
  code: error?.response?.data?.code || null,
});

const OrdersAPI = {
  /**
   * Order any of the four.
   *
   * A free item comes back approved with the enrolment already made. A paid
   * one comes back pending, waiting for a receipt.
   */
  place: async ({ itemType, itemId, content, couponCode, discountedPrice }) => {
    try {
      const { data } = await apiClient.post("/orders", {
        itemType,
        itemId,
        content,
        couponCode,
        discountedPrice,
      });
      return {
        success: true,
        message: data.message,
        order: data.data.order,
        enrollment: data.data.enrollment,
      };
    } catch (error) {
      return fail(error, "Could not place that order");
    }
  },

  /**
   * Send the proof of payment.
   *
   * Sending one against a REJECTED order starts a new attempt rather than
   * reviving the old one, so the rejection and the receipt that was refused
   * both survive - and the response carries the new order.
   */
  sendReceipt: async (orderId, { file, ccpNumber, phoneNumber, transactionId }) => {
    try {
      const form = new FormData();
      form.append("screenShot", file);
      if (ccpNumber) form.append("CCP_number", ccpNumber);
      if (phoneNumber) form.append("phoneNumber", phoneNumber);
      if (transactionId) form.append("transactionId", transactionId);

      const { data } = await apiClient.post(
        `/orders/${orderId}/receipt`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return { success: true, message: data.message, order: data.data.order };
    } catch (error) {
      return fail(error, "Could not send that receipt");
    }
  },

  /** Everything this person has ordered. */
  mine: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v) params.append(k, v);
      }
      const { data } = await apiClient.get(`/orders/mine?${params}`);
      return {
        success: true,
        orders: data.data || [],
        count: data.count,
        countsByStatus: data.countsByStatus || {},
      };
    } catch (error) {
      return fail(error, "Could not load your orders");
    }
  },

  /** One order, with every earlier attempt at the same thing. */
  get: async (id) => {
    try {
      const { data } = await apiClient.get(`/orders/${id}`);
      return {
        success: true,
        order: data.data.order,
        attempts: data.data.attempts || [],
      };
    } catch (error) {
      return fail(error, "Could not load that order");
    }
  },

  cancel: async (id, reason) => {
    try {
      const { data } = await apiClient.post(`/orders/${id}/cancel`, { reason });
      return { success: true, message: data.message, order: data.data.order };
    } catch (error) {
      return fail(error, "Could not cancel that order");
    }
  },

  /** Everything this person actually has. */
  myEnrollments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v) params.append(k, v);
      }
      const { data } = await apiClient.get(`/enrollments/mine?${params}`);
      return { success: true, enrollments: data.data || [], count: data.count };
    } catch (error) {
      return fail(error, "Could not load what you have");
    }
  },

  /**
   * Do I have this, and if not, where did my last attempt get to?
   *
   * One call for the whole question, so a product page does not have to guess
   * from three separate lookups whether to show "Open it", "Waiting on us" or
   * "Send a new receipt".
   */
  access: async (itemType, itemId) => {
    try {
      const { data } = await apiClient.get(
        `/enrollments/access/${itemType}/${itemId}`,
      );
      return {
        success: true,
        hasAccess: data.data.hasAccess,
        order: data.data.order,
      };
    } catch (error) {
      return fail(error, "Could not check that");
    }
  },
};

/** What the user should do next, in words rather than a status code. */
export const NEXT_STEP_LABEL = {
  send_receipt: "Send your receipt",
  wait_for_review: "We are checking your receipt",
  send_a_new_receipt: "Send a new receipt",
  open_it: "Open it",
  nothing: "",
};

export default OrdersAPI;
