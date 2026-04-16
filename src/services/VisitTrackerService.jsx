import api from "./apiClient";

class VisitService {
  constructor() {
    this.currentVisitId = null;
    this.visitStartTime = null;
  }

  async registerVisit(page) {
    try {
      // Get device type
      const deviceType = this.getDeviceType();

      // Get current page if not provided
      const currentPage = page || window.location.pathname;

      // Get referrer
      const referrer = document.referrer || null;

      const response = await api.post("/visit/register", {
        page: currentPage,
        referrer,
        deviceType,
      });

      if (response.data.success) {
        this.currentVisitId = response.data.visitId;
        this.visitStartTime = Date.now();

        // Add event listener for page unload to update duration
        window.addEventListener("beforeunload", this.updateDuration.bind(this));

        return response.data.visitId;
      }
    } catch (error) {
    }
    return null;
  }

  async updateDuration() {
    if (!this.currentVisitId || !this.visitStartTime) return;

    try {
      const duration = Math.round((Date.now() - this.visitStartTime) / 1000); // Duration in seconds

      await api.put(`/visit/duration/${this.currentVisitId}`, {
        duration,
      });

      // Clear the visit ID after successful update to prevent duplicate updates
      this.currentVisitId = null;
      this.visitStartTime = null;
    } catch (error) {
      // Only log non-400 errors (400 means visit already processed or invalid)
      if (error.response?.status !== 400) {
      }
      // Clear the visit ID even on error to prevent retry loops
      this.currentVisitId = null;
      this.visitStartTime = null;
    }
  }

  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/mobile/i.test(userAgent)) return "Mobile";
    if (/tablet/i.test(userAgent)) return "Tablet";
    if (/windows|macintosh|linux/i.test(userAgent)) return "Desktop";
    return "Unknown";
  }

  // Clean up event listeners
  cleanup() {
    window.removeEventListener("beforeunload", this.updateDuration);
  }
}

export default new VisitService();
