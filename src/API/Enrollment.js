import apiClient from "../services/apiClient";

// Enrollment API for managing course and program applications and enrollments
export const EnrollmentAPI = {
  // =================================================================
  // COURSE ENROLLMENT METHODS
  // =================================================================

  // Apply for a course (creates Course_Applications)
  applyCourse: async (courseData) => {
    try {
      const response = await apiClient.post(
        "/enrollment/courses/apply",
        courseData,
      );

      return {
        success: true,
        data: response.data.data,
        message: "Course application submitted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to submit course application",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Enroll in a free course
  enrollFreeCourse: async (courseData) => {
    try {
      const response = await apiClient.post(
        "/enrollment/courses/enroll-free",
        courseData,
      );

      return {
        success: true,
        data: response.data.data,
        message: "Successfully enrolled in free course",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to enroll in free course",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    try {
      const response = await apiClient.get(
        `/enrollment/courses/${courseId}/progress`,
      );

      return {
        success: true,
        data: response.data.data,
        message: "Course progress fetched successfully",
      };
    } catch (error) {
      // 404 is expected when no progress exists yet
      if (error.response?.status !== 404) {
      }
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch course progress",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Update course progress
  updateCourseProgress: async (courseId, progressData) => {
    try {
      const response = await apiClient.put(
        `/enrollment/courses/${courseId}/progress`,
        progressData,
      );

      return {
        success: true,
        data: response.data.data,
        message: "Course progress updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update course progress",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Submit quiz results
  submitQuizResults: async (courseId, quizData) => {
    try {
      const response = await apiClient.post(
        `/api/courses/${courseId}/quiz-result`,
        quizData,
      );

      return {
        success: true,
        data: response.data.data,
        message: "Quiz results submitted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to submit quiz results",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // =================================================================
  // PROGRAM ENROLLMENT METHODS
  // =================================================================

  // Apply for a program (creates Program_Applications)
  applyProgram: async (programData) => {
    try {
      const response = await apiClient.post(
        "/enrollment/programs/apply",
        programData,
      );

      return {
        success: true,
        data: response.data.data,
        message: "Program application submitted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to submit program application",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Enroll in a free program
  enrollFreeProgram: async (programData) => {
    try {
      const response = await apiClient.post(
        "/enrollment/programs/enroll-free",
        programData,
      );

      return {
        success: true,
        data: response.data.data,
        message: "Successfully enrolled in free program",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to enroll in free program",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get program progress
  getProgramProgress: async (programId) => {
    try {
      const response = await apiClient.get(
        `/enrollment/programs/${programId}/progress`,
      );

      return {
        success: true,
        data: response.data.data,
        message: "Program progress fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch program progress",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // =================================================================
  // DASHBOARD AND OVERVIEW METHODS
  // =================================================================

  // Get dashboard overview
  getDashboardOverview: async () => {
    try {
      const response = await apiClient.get("/enrollment/dashboard");

      return {
        success: true,
        data: response.data.data,
        message: "Dashboard overview fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch dashboard overview",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get user's course applications
  getCourseApplications: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/enrollment/courses/my-applications",
        { params },
      );

      return {
        success: true,
        data: response.data.data,
        message: "Course applications fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch course applications",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get user's program applications
  getProgramApplications: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/enrollment/programs/my-applications",
        { params },
      );

      return {
        success: true,
        data: response.data.data,
        message: "Program applications fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch program applications",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get user's program enrollments
  getProgramEnrollments: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/enrollment/programs/my-enrollments",
        { params },
      );

      return {
        success: true,
        data: response.data.data,
        message: "Program enrollments fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch program enrollments",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get user's course enrollments (with progressPercentage)
  getCourseEnrollments: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/enrollment/courses/my-enrollments",
        { params },
      );

      return {
        success: true,
        data: response.data.data,
        message: "Course enrollments fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch course enrollments",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // =================================================================
  // ITEM COMPLETION & CERTIFICATE METHODS
  // =================================================================

  // Mark a specific section item as completed
  markItemComplete: async (courseId, itemId, data = {}) => {
    try {
      const response = await apiClient.post(
        `/enrollment/courses/${courseId}/items/${itemId}/complete`,
        data,
      );
      return {
        success: true,
        data: response.data.data,
        message: "Item marked as completed",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to mark item as complete",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Issue a certificate after completing all course content
  issueCertificate: async (courseId, studentName) => {
    try {
      const response = await apiClient.post(
        `/enrollment/courses/${courseId}/certificate/issue`,
        { studentName },
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        alreadyIssued: response.data.alreadyIssued || false,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to issue certificate",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get all certificates for the current user
  getMyCertificates: async () => {
    try {
      const response = await apiClient.get("/enrollment/my-certificates");
      return {
        success: true,
        data: response.data.data,
        message: "Certificates fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch certificates",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Publicly verify a certificate by its UUID (no auth required)
  verifyCertificate: async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/verify/certificate/${certificateId}`,
      );
      return {
        success: true,
        data: response.data,
        valid: response.data.valid,
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        message: error.response?.data?.message || "Verification failed",
      };
    }
  },
};

export default EnrollmentAPI;
