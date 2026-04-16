import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";

function ErrorElement() {
    const { t } = useTranslation();
    const error = useRouteError();
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-md shadow-lg text-center max-w-md mx-auto">
                <h1 className="text-3xl md:text-4xl mb-4 text-red-600">
                    {t("errorPage.title", "Oops! An Error Occurred")}
                </h1>
                <p className="text-lg mb-4 text-gray-700">
                    {t("errorPage.message", "Something went wrong on this page.")}
                </p>
                {error && (
                    <div className="text-left bg-red-100 p-4 mb-4 rounded-md">
                        <h2 className="text-xl text-red-600 font-semibold">
                            {t("errorPage.errorDetails", "Error Details:")}
                        </h2>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                            {error.toString()}
                        </pre>
                    </div>
                )}
                <p className="text-lg">
                    {t("errorPage.goBack", "Please go back to the")}{" "}
                    <a className="text-blue-600 hover:underline" href="/">
                        {t("errorPage.homePage", "home page")}
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}

export default ErrorElement;
