

import { Frown } from 'lucide-react';

const Not_Found = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center space-y-6">
          <Frown className="mx-auto h-16 w-16 text-red-500 animate-bounce" />

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            404 - Page Not Found
          </h1>

          <p className="text-lg text-gray-600">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>

          <div className="space-y-4">
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center animate-spin-slow">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-300 to-red-400 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Please check the URL or return to the homepage.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Not_Found;

