import {
    FaChartLine,
    FaCalendarAlt,
    FaCertificate,
    FaGlobeAmericas,
    FaGraduationCap,
    FaTrophy,
    FaDownload,
} from "react-icons/fa";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const CourseSidebar = ({
    courseStats,
    upcomingMeets,
    certificate,
    course,
    userStatus,
}) => {
    const { t } = useTranslation();
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Course Statistics */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                    <FaChartLine className="text-blue-500 text-xl mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">
                        {t("courseInfo.courseStatistics", "Course Statistics")}
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                            {t("courseInfo.totalStudents", "Total Students")}
                        </span>
                        <span className="font-semibold text-gray-900">
                            {courseStats?.enrolledCount || 0}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                            {t("courseInfo.completionRate", "Completion Rate")}
                        </span>
                        <span className="font-semibold text-green-600">
                            {courseStats?.completionRate || 0}%
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                            {t("courseInfo.averageRating", "Average Rating")}
                        </span>
                        <span className="font-semibold text-yellow-600">
                            {courseStats?.averageRating?.toFixed(1) || "0.0"} 
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                            {t("courseInfo.totalReviews", "Total Reviews")}
                        </span>
                        <span className="font-semibold text-gray-900">
                            {courseStats?.reviewCount || 0}
                        </span>
                    </div>
                </div>
            </div> */}

            {/* Upcoming Sessions */}
            {upcomingMeets && upcomingMeets.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <FaCalendarAlt className="text-green-500 text-xl mr-3" />
                        <h3 className="text-lg font-bold text-gray-900">
                            {t("courseInfo.upcomingSessions", "Upcoming Sessions")}
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {upcomingMeets.slice(0, 3).map((meet, index) => (
                            <div
                                key={meet.id || index}
                                className="bg-green-50 border border-green-200 rounded-lg p-3"
                            >
                                <div className="font-medium text-green-800 mb-1">
                                    {meet.title || `Session ${index + 1}`}
                                </div>
                                <div className="text-sm text-green-600">
                                    {" "}
                                    {formatDate(
                                        meet.scheduledTime || meet.date,
                                    )}
                                </div>
                                {meet.description && (
                                    <div className="text-xs text-green-700 mt-1">
                                        {meet.description}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certificate Information */}
            {certificate && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <FaCertificate className="text-yellow-500 text-xl mr-3" />
                        <h3 className="text-lg font-bold text-gray-900">
                            {t("courseInfo.certificate", "Certificate")}
                        </h3>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center text-yellow-800 mb-2">
                            <FaTrophy className="mr-2" />
                            <span className="font-semibold">
                                {t("courseInfo.certificateEarned", "Certificate Earned!")}
                            </span>
                        </div>
                        <div className="text-sm text-yellow-700 mb-3">
                            {t("courseInfo.congratulations", "Congratulations on completing the course")}
                        </div>
                        <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
                            <FaDownload className="mr-2" />
                            {t("courseInfo.downloadCertificate", "Download Certificate")}
                        </button>
                    </div>
                </div>
            )}

            {/* Course Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                    <FaGraduationCap className="text-purple-500 text-xl mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">
                        {t("courseInfo.courseDetails", "Course Details")}
                    </h3>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                        <FaGlobeAmericas className="text-gray-400 mr-3" />
                        <span className="text-gray-600">
                            {t("courseInfo.language", "Language")}:
                        </span>
                        <span className="ml-auto font-medium text-gray-900">
                            {course.language || "English"}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="text-gray-400 mr-3"></span>
                        <span className="text-gray-600">
                            {t("courseInfo.level", "Level")}:
                        </span>
                        <span className="ml-auto font-medium text-gray-900">
                            {course.level || "Beginner"}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="text-gray-400 mr-3"></span>
                        <span className="text-gray-600">
                            {t("courseInfo.category", "Category")}:
                        </span>
                        <span className="ml-auto font-medium text-gray-900">
                            {course.category || "General"}
                        </span>
                    </div>

                    <div className="flex items-center">
                        <span className="text-gray-400 mr-3"></span>
                        <span className="text-gray-600">
                            {t("courseInfo.field", "Field")}:
                        </span>
                        <span className="ml-auto font-medium text-gray-900">
                            {course.field || "Education"}
                        </span>
                    </div>

                    {course.lastUpdated && (
                        <div className="flex items-center">
                            <span className="text-gray-400 mr-3"></span>
                            <span className="text-gray-600">
                                {t("courseInfo.lastUpdated", "Last Updated")}:
                            </span>
                            <span className="ml-auto font-medium text-gray-900">
                                {new Date(
                                    course.lastUpdated,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructor Information */}
            {course.instructor && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <span className="text-indigo-500 text-xl mr-3"></span>
                        <h3 className="text-lg font-bold text-gray-900">
                            {t("courseInfo.instructor", "Instructor")}
                        </h3>
                    </div>

                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                            {(course.instructor.name || "I")
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">
                                {course.instructor.name || "Instructor"}
                            </div>
                            <div className="text-sm text-gray-500">
                                {course.instructor.title ||
                                    t("courseInfo.courseInstructor", "Course Instructor")}
                            </div>
                        </div>
                    </div>

                    {course.instructor.bio && (
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                            {course.instructor.bio}
                        </p>
                    )}
                </div>
            )}

            {/* Access Information */}
            {/* {userStatus && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <span className="text-red-500 text-xl mr-3"></span>
                        <h3 className="text-lg font-bold text-gray-900">
                            Your Access
                        </h3>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Video Access:</span>
                            <span
                                className={`font-medium ${
                                    userStatus.hasVideoAccess
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {userStatus.hasVideoAccess
                                    ? " Granted"
                                    : " Restricted"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Download Access:
                            </span>
                            <span
                                className={`font-medium ${
                                    userStatus.hasDownloadAccess
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {userStatus.hasDownloadAccess
                                    ? " Granted"
                                    : " Restricted"}
                            </span>
                        </div>

                        {userStatus.accessExpiryDate && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Access Expires:
                                </span>
                                <span className="font-medium text-orange-600">
                                    {new Date(
                                        userStatus.accessExpiryDate
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )} */}
        </div>
    );
};

CourseSidebar.propTypes = {
    courseStats: PropTypes.object,
    upcomingMeets: PropTypes.array,
    certificate: PropTypes.object,
    course: PropTypes.object.isRequired,
    userStatus: PropTypes.object,
};

export default CourseSidebar;
