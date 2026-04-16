import { useTranslation } from "react-i18next";

export const LoadingSpinner = ({
    size = "medium",
    message,
    className = "",
}) => {
    const { t } = useTranslation();

    const getSizeClasses = () => {
        switch (size) {
            case "small":
                return "w-4 h-4";
            case "large":
                return "w-12 h-12";
            default:
                return "w-8 h-8";
        }
    };

    return (
        <div
            className={`flex flex-col items-center justify-center ${className}`}
        >
            <div
                className={`${getSizeClasses()} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin`}
            />
            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        </div>
    );
};

export const LoadingSkeleton = ({
    width = "w-full",
    height = "h-4",
    className = "",
}) => {
    return (
        <div
            className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`}
        />
    );
};

export const CourseCardSkeleton = () => {
    return (
        <div className="flex relative grow shrink gap-9 items-start self-stretch my-auto min-w-60 w-[325px]">
            <div className="flex z-0 flex-col flex-1 shrink my-auto w-full bg-white basis-0 min-w-60 rounded-xl shadow-md p-4 animate-pulse">
                <LoadingSkeleton
                    width="w-full"
                    height="h-32"
                    className="mb-4 rounded-lg"
                />
                <LoadingSkeleton width="w-3/4" height="h-6" className="mb-2" />
                <LoadingSkeleton width="w-full" height="h-4" className="mb-2" />
                <LoadingSkeleton width="w-5/6" height="h-4" className="mb-4" />
                <LoadingSkeleton
                    width="w-full"
                    height="h-10"
                    className="rounded-full"
                />
            </div>
        </div>
    );
};

export default LoadingSpinner;
