import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { CourseCard } from "./CourseCard";

export function CourseGrid({
    courses = [],
    loading = false,
    pagination,
    onPageChange,
    onCourseClick,
}) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse max-w-sm mx-auto"
                    >
                        {/* Image skeleton */}
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-6">
                            {/* Title skeleton */}
                            <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                            {/* Description skeleton */}
                            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                            {/* Price skeleton */}
                            <div className="h-8 bg-gray-200 rounded mb-4 w-24"></div>
                            {/* Tags skeleton */}
                            <div className="flex gap-2 mb-4">
                                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                            </div>
                            {/* Button skeleton */}
                            <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (courses.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center mt-12 p-12 bg-white rounded-2xl shadow-sm">
                <div className="text-6xl mb-4"></div>
                <p className="text-gray-600 text-xl font-medium mb-2">
                    {t("NoCoursesFound", "No Courses Found") || "No courses found"}
                </p>
                <p className="text-gray-500 text-center max-w-md">
                    {t("TryAdjustingFilters", "Try Adjusting Filters") ||
                        "Try adjusting your search filters or browse different categories"}
                </p>
            </div>
        );
    }

    return (
        <div className="relative transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 space-y-0">
                {courses.map((course) => (
                    <div key={course.id} className="mb-6">
                        <CourseCard
                            course={course}
                            id={course.id}
                            Image={course.Image || course.coverImage}
                            title={course.Title}
                            description={course.shortDescription}
                            price={Number(course.Price) || 0}
                            discountPrice={
                                course.discountPrice
                                    ? Number(course.discountPrice)
                                    : undefined
                            }
                            currency={course.Currency || "DZD"}
                            level={course.Level || course.difficulty}
                            averageRating={
                                course.stats?.averageRating || course.Rate
                            }
                            totalReviews={
                                course.stats?.totalcourse_reviews ||
                                course.totalRatings
                            }
                            isEnrolled={course.userStatus?.isEnrolled || false}
                            enrollmentStatus={
                                course.userStatus?.enrollmentStatus
                            }
                            progress={course.userStatus?.progress || 0}
                            onClick={() =>
                                onCourseClick && onCourseClick(course.id)
                            }
                        />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                        className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t("Previous", "Previous") || "Previous"}
                    </button>

                    {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`px-4 py-2 rounded-xl ${
                                        pagination.currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "border border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        },
                    )}

                    <button
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        disabled={
                            pagination.currentPage >= pagination.totalPages
                        }
                        className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t("Next", "Next") || "Next"}
                    </button>
                </div>
            )}
        </div>
    );
}

CourseGrid.propTypes = {
    courses: PropTypes.array,
    loading: PropTypes.bool,
    pagination: PropTypes.shape({
        currentPage: PropTypes.number,
        totalPages: PropTypes.number,
        totalCourses: PropTypes.number,
    }),
    onPageChange: PropTypes.func,
    onCourseClick: PropTypes.func,
};

export default CourseGrid;
