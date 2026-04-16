import apiClient from "../utils/apiClient";

const reviewsAPI = {
  submitCourseReview: (courseId, { rate, comment }) =>
    apiClient.post(`/Courses/${courseId}/reviews`, { rate, comment }),

  deleteCourseReview: (courseId) =>
    apiClient.delete(`/Courses/${courseId}/reviews`),

  getCourseReviews: (courseId) => apiClient.get(`/Courses/${courseId}/reviews`),

  submitProgramReview: (programId, { rate, comment }) =>
    apiClient.post(`/Programs/${programId}/reviews`, { rate, comment }),

  deleteProgramReview: (programId) =>
    apiClient.delete(`/Programs/${programId}/reviews`),

  getProgramReviews: (programId) =>
    apiClient.get(`/Programs/${programId}/reviews`),
};

export default reviewsAPI;
