import api from "./apiClient";

export const courseService = {
  // Get all courses with pagination and filters (works for both authenticated and guest users)
  getCourses: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 12,
        category = "",
        specialty = "",
        difficulty = "",
        price = "",
        certificate = "",
        search = "",
        sortBy = "createdAt",
        order = "DESC",
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
      });

      if (category) queryParams.append("category", category);
      if (specialty) queryParams.append("specialty", specialty);
      if (difficulty) queryParams.append("difficulty", difficulty);
      if (price) queryParams.append("price", price);
      if (certificate) queryParams.append("certificate", certificate);
      if (search) queryParams.append("search", search);

      // Use the unified courses endpoint that handles both authenticated and guest users
      const response = await api.get(`/Courses?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single course details (works for both authenticated and guest users)
  getCourse: async (courseId) => {
    try {
      // Use the unified courses endpoint that handles both authenticated and guest users
      const response = await api.get(`/Courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Apply for a course
  applyCourse: async (courseData) => {
    try {
      const response = await api.post(`/enrollment/courses/apply`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Enrol in a free course.
   *
   * Through /orders, like everything else. This used to call
   * /enrollment/courses/enroll-free, which writes to course_applications and
   * course_enrollments and nothing else - so a free enrolment left no order,
   * appeared in no queue, and counted toward no figure on the finance screen.
   * The platform has one way in: an order, which for a free item is approved
   * on the spot with the enrolment made in the same transaction.
   */
  enrollFreeCourse: async (courseId) => {
    const response = await api.post(`/orders`, {
      itemType: "course",
      itemId: courseId,
    });
    return response.data;
  },

  // Get user's course applications
  getUserApplications: async () => {
    try {
      const response = await api.get(`/Users/Courses/applications`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    try {
      const response = await api.get(`/Users/Courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update video progress
  updateVideoProgress: async (progressData) => {
    try {
      const response = await api.post(
        `/Users/Courses/progress/video`,
        progressData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all user progress
  getAllUserProgress: async () => {
    try {
      const response = await api.get(`/Users/Courses/progress`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add course review
  addReview: async (reviewData) => {
    try {
      const response = await api.post(
        `/Users/Courses/course_reviews`,
        reviewData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course course_reviews
  getCourseReviews: async (courseId) => {
    try {
      const response = await api.get(
        `/Users/Courses/${courseId}/course_reviews`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(
        `/Users/Courses/course_reviews/${reviewId}`,
        reviewData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(
        `/Users/Courses/course_reviews/${reviewId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user certificates
  getUserCertificates: async () => {
    try {
      const response = await api.get(`/Users/Courses/certificates`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Issue certificate
  issueCertificate: async (certificateData) => {
    try {
      const response = await api.post(
        `/Users/Courses/certificates/issue`,
        certificateData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    try {
      const response = await api.get(
        `/Users/Courses/certificates/download/${certificateId}`,
        {
          responseType: "blob",
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user meets
  getUserMeets: async () => {
    try {
      const response = await api.get(`/Users/Courses/meets`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get course meets
  getCourseMeets: async (courseId) => {
    try {
      const response = await api.get(`/Users/Courses/${courseId}/meets`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Join meet
  joinMeet: async (meetId) => {
    try {
      const response = await api.get(`/Users/Courses/meets/${meetId}/join`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default courseService;
