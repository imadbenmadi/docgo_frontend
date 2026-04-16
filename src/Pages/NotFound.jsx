import { Link, useNavigate } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Animated 404 */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                        404
                    </h1>
                    <div className="text-6xl mb-4"></div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The link you&apos;re looking for doesn&apos;t seem to be
                        working or doesn&apos;t exist.
                    </p>
                    <p className="text-sm text-gray-500">
                        Don&apos;t worry, it happens to the best of us! 
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Go Back Home
                    </Link>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-300 shadow-sm flex items-center justify-center gap-2"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                {/* Additional Help */}
                <div className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                    <h3 className="font-semibold text-gray-800 mb-2">
                        Need Help?
                    </h3>
                    <p className="text-sm text-gray-600">
                        If you think this is a mistake, please contact the
                        administrator or try refreshing the page.
                    </p>
                </div>

                {/* Floating Animation Elements */}
                <div
                    className="fixed top-20 left-10 text-blue-300 text-4xl animate-bounce"
                    style={{ animationDelay: "0s" }}
                >
                    
                </div>
                <div
                    className="fixed top-40 right-20 text-purple-300 text-3xl animate-bounce"
                    style={{ animationDelay: "1s" }}
                >
                    
                </div>
                <div
                    className="fixed bottom-40 left-20 text-indigo-300 text-2xl animate-bounce"
                    style={{ animationDelay: "2s" }}
                >
                    
                </div>
                <div
                    className="fixed bottom-20 right-10 text-blue-300 text-3xl animate-bounce"
                    style={{ animationDelay: "1.5s" }}
                >
                    
                </div>
            </div>
        </div>
    );
};

export default NotFound;
