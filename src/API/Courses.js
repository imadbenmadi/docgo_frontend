import apiClient from "../services/apiClient";

// Client-side Courses API (for public access)
export const clientCoursesAPI = {
  // Submit quiz result for a course
  submitQuizResult: async (courseId, score, answers) => {
    try {
      const response = await apiClient.post(
        `/courses/${courseId}/quiz-result`,
        {
          score,
          answers,
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to submit quiz result",
      };
    }
  },
  // Get all courses for clients (public)
  getCourses: async (params = {}) => {
    try {
      const response = await apiClient.get("/Courses", { params });

      // Return with success wrapper to match frontend expectations
      return {
        success: true,
        data: response.data,
        message: "Courses fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch courses",
      };
    }
  },

  // Get single course details for clients
  getCourseDetails: async (courseId) => {
    try {
      const response = await apiClient.get(`/Courses/${courseId}`);
      return {
        success: true,
        data: response.data,
        message: "Course details fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch course details",
      };
    }
  },

  // Get featured courses
  getFeaturedCourses: async (limit = 6) => {
    try {
      const response = await apiClient.get("/Courses/featured", {
        params: { limit },
      });
      return {
        success: true,
        data: response.data,
        message: "Featured courses fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch featured courses",
      };
    }
  },

  // Get course categories, specialties, and other filter data
  getCoursesFilters: async () => {
    try {
      const response = await apiClient.get("/Courses/filters");
      return {
        success: true,
        data: response.data,
        message: "Course filters fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch course filters",
      };
    }
  },

  // Search courses with filters
  searchCourses: async (params = {}) => {
    try {
      const response = await apiClient.get("/Courses/search", {
        params,
      });
      return {
        success: true,
        data: response.data,
        message: "Courses searched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to search courses",
      };
    }
  },

  // Alias methods for consistency
  getCourse: async (courseId) => {
    return clientCoursesAPI.getCourseDetails(courseId);
  },
};

// Export the main functions that are used in the Courses.jsx component
export const getCourses = clientCoursesAPI.getCourses;
export const getCoursesFilters = clientCoursesAPI.getCoursesFilters;
export const getCourseDetails = clientCoursesAPI.getCourseDetails;
export const getFeaturedCourses = clientCoursesAPI.getFeaturedCourses;
export const searchCourses = clientCoursesAPI.searchCourses;

export default clientCoursesAPI;
