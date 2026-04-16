import {
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    BookOpen,
    GraduationCap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import SliderButtonProfile from "./SliderButtonProfile";
import { Link } from "react-router-dom";

const ApplicationsProfileSection = ({
    applications,
    currentSlide,
    setSlide,
}) => {
    const { t } = useTranslation();
    const itemsPerSlide = 3;

    // Combine course applications and program applications
    const allApplications = [
        ...(applications.courseApplications || []).map((app) => ({
            ...app,
            type: "course",
        })),
        ...(applications.programApplications || []).map((app) => ({
            ...app,
            type: "program",
        })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const getStatusIcon = (status) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "pending":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case "under_review":
                return <AlertCircle className="w-5 h-5 text-blue-500" />;
            case "rejected":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "under_review":
                return "bg-blue-100 text-blue-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (!allApplications.length) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                    {t("profile_data.applications", "Applications")}
                </h2>
                <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                        {t("dashboard.noApplications", "No Applications")}
                    </p>
                    <Link
                        to="/programs"
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {t("dashboard.browsePrograms", "Browse Programs")}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                    {t("profile_data.applications", "Applications")}
                </h2>
                <div className="flex items-center gap-4">
                    <SliderButtonProfile
                        direction="prev"
                        onClick={() =>
                            setSlide(
                                currentSlide > 0
                                    ? currentSlide - 1
                                    : Math.ceil(
                                          allApplications.length / itemsPerSlide
                                      ) - 1
                            )
                        }
                    />
                    <SliderButtonProfile
                        direction="next"
                        onClick={() =>
                            setSlide(
                                currentSlide <
                                    Math.ceil(
                                        allApplications.length / itemsPerSlide
                                    ) -
                                        1
                                    ? currentSlide + 1
                                    : 0
                            )
                        }
                    />
                </div>
            </div>
            <div className="overflow-hidden">
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {Array.from({
                        length: Math.ceil(
                            allApplications.length / itemsPerSlide
                        ),
                    }).map((_, slideIndex) => (
                        <div key={slideIndex} className="w-full flex-shrink-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allApplications
                                    .slice(
                                        slideIndex * itemsPerSlide,
                                        (slideIndex + 1) * itemsPerSlide
                                    )
                                    .map((application) => (
                                        <ApplicationCard
                                            key={`${application.type}-${application.id}`}
                                            application={application}
                                            getStatusIcon={getStatusIcon}
                                            getStatusColor={getStatusColor}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ApplicationCard = ({ application, getStatusIcon, getStatusColor }) => {
    const { t } = useTranslation();

    // Get the associated course or program data
    const targetData =
        application.applicationCourse || application.applicationProgram;
    const isProgram = application.type === "program";

    return (
        <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isProgram ? (
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                    ) : (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    )}
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isProgram
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                    >
                        {t(
                            isProgram ? "dashboard.program" : "dashboard.course"
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            application.status
                        )}`}
                    >
                        {t(`dashboard.${application.status}`)}
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {targetData?.title || t("dashboard.applicationTitle", "Application Title")}
            </h3>

            {targetData?.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {targetData.description}
                </p>
            )}

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">
                        {t("applications.submitted", "Submitted on:")}
                    </span>
                    <span className="text-gray-700">
                        {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {application.updatedAt !== application.createdAt && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">
                            {t("applications.lastUpdate", "Last update")}
                        </span>
                        <span className="text-gray-700">
                            {new Date(
                                application.updatedAt
                            ).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {application.status === "approved" && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <Link
                            to={
                                isProgram
                                    ? `/programs/${targetData?.id}`
                                    : `/courses/${targetData?.id}`
                            }
                            className="block w-full text-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                            {t("applications.access", "Access")}
                        </Link>
                    </div>
                )}

                {application.status === "pending" && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            {t("applications.pendingMessage", "Your application is under review")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

ApplicationsProfileSection.propTypes = {
    applications: PropTypes.shape({
        courseApplications: PropTypes.array,
        programApplications: PropTypes.array,
    }).isRequired,
    currentSlide: PropTypes.number.isRequired,
    setSlide: PropTypes.func.isRequired,
};

ApplicationCard.propTypes = {
    application: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        type: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string,
        applicationCourse: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            description: PropTypes.string,
        }),
        applicationProgram: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            description: PropTypes.string,
        }),
    }).isRequired,
    getStatusIcon: PropTypes.func.isRequired,
    getStatusColor: PropTypes.func.isRequired,
};

export default ApplicationsProfileSection;
