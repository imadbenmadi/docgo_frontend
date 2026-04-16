import { FaLock, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const AuthRequired = ({
    title = "Authentication Required",
    message = "You need to be logged in to access this feature.",
    returnUrl = "",
    showRegister = true,
}) => {
    const loginUrl = returnUrl
        ? `/login?from=${encodeURIComponent(returnUrl)}`
        : "/login";
    const registerUrl = returnUrl
        ? `/register?from=${encodeURIComponent(returnUrl)}`
        : "/register";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    {/* Lock Icon */}
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <FaLock className="text-2xl text-blue-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {title}
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-8">{message}</p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            to={loginUrl}
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <FaSignInAlt />
                                <span>Sign In</span>
                            </span>
                        </Link>

                        {showRegister && (
                            <Link
                                to={registerUrl}
                                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <FaUserPlus />
                                    <span>Create Account</span>
                                </span>
                            </Link>
                        )}

                        <button
                            onClick={() => window.history.back()}
                            className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors duration-200"
                        >
                            Go Back
                        </button>
                    </div>

                    {/* Benefits */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                            Why create an account?
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li> Track your learning progress</li>
                            <li> Access exclusive content</li>
                            <li> Earn certificates</li>
                            <li> Save your favorite courses</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthRequired;
