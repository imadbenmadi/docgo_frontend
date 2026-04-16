import { useTranslation } from "react-i18next";

export const ErrorMessage = ({
    message,
    type = "error",
    onRetry,
    className = "",
}) => {
    const { t } = useTranslation();

    const getTypeStyles = () => {
        switch (type) {
            case "error":
                return "bg-red-50 border-red-200 text-red-700";
            case "warning":
                return "bg-yellow-50 border-yellow-200 text-yellow-700";
            case "info":
                return "bg-blue-50 border-blue-200 text-blue-700";
            default:
                return "bg-gray-50 border-gray-200 text-gray-700";
        }
    };

    return (
        <div
            className={`border rounded-lg p-4 ${getTypeStyles()} ${className}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="font-medium text-sm">
                        {type === "error" && (t("Error", "Error") || "Error")}
                        {type === "warning" && (t("Warning", "Warning") || "Warning")}
                        {type === "info" && (t("Information", "Information") || "Information")}
                    </p>
                    <p className="mt-1 text-sm">{message}</p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="ml-4 px-3 py-1 text-xs bg-white border border-current rounded hover:bg-opacity-10 transition"
                    >
                        {t("Retry", "Retry") || "Retry"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
