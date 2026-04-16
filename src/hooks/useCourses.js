import { useState, useEffect, useCallback } from "react";
import { courseService } from "../services/courseService";
import { useAppContext } from "../AppContext";
import { getApiErrorMessage } from "../utils/apiErrorTranslate";

export const useCourses = (externalFilters = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchCourses = useCallback(async (params, isSearching = false) => {
    if (isSearching) {
      setSearchLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await courseService.getCourses(params);

      setCourses(response.courses || []);
      setPagination(response.pagination || {});
      setIsAuthenticated(response.isAuthenticated || false);
    } catch (err) {
      setError(getApiErrorMessage(err) || "Failed to fetch courses");
      setCourses([]);
      setIsAuthenticated(false);
    } finally {
      if (isSearching) {
        setSearchLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    const defaultFilters = {
      page: 1,
      limit: 12,
      category: "",
      specialty: "",
      difficulty: "",
      price: "",
      certificate: "",
      search: "",
      sortBy: "createdAt",
      order: "DESC",
      ...externalFilters,
    };
    fetchCourses(defaultFilters);
  }, [fetchCourses]);

  // Respond to external filter changes
  useEffect(() => {
    if (Object.keys(externalFilters).length > 0) {
      fetchCourses(externalFilters, true);
    }
  }, [externalFilters, fetchCourses]);

  const changePage = useCallback(
    (page) => {
      const newFilters = { ...externalFilters, page };
      fetchCourses(newFilters);
    },
    [externalFilters, fetchCourses],
  );

  return {
    courses,
    loading,
    searchLoading,
    error,
    pagination,
    isAuthenticated,
    changePage,
    refetch: () => fetchCourses(externalFilters),
  };
};

export const useCourse = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await courseService.getCourse(courseId);
      setCourse(response.course || response);
      setIsAuthenticated(response.course?.isAuthenticated || false);
    } catch (err) {
      setError(getApiErrorMessage(err) || "Failed to fetch course");
      setCourse(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return {
    course,
    loading,
    error,
    isAuthenticated,
    refetch: fetchCourse,
  };
};

export const useCourseApplication = () => {
  const { userId } = useAppContext();
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);

  const applyCourse = useCallback(
    async (courseData) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      setApplying(true);
      setError(null);

      try {
        const response = await courseService.applyCourse(courseData);
        return response;
      } catch (err) {
        setError(getApiErrorMessage(err) || "Failed to apply for course");
        throw err;
      } finally {
        setApplying(false);
      }
    },
    [userId],
  );

  return {
    applyCourse,
    applying,
    error,
  };
};
