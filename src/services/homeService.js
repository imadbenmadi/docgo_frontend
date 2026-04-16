import api from "./apiClient";
import defaultHomeData from "../data/defaultHomeData";

const homeService = {
    // Get all home page data - always resolves (falls back to static defaults on error)
    getHomePageData: async () => {
        try {
            const response = await api.get("/home");
            return response.data;
        } catch (error) {
            return defaultHomeData;
        }
    },

    // Submit contact message from landing page
    submitContactMessage: async (contactData) => {
        try {
            const response = await api.post("/home/contact", contactData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default homeService;
