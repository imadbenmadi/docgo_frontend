import React from "react";
import { AlertCircle } from "lucide-react";

const NotFinished = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center space-y-6">
          <AlertCircle className="mx-auto h-16 w-16 text-orange-500 animate-pulse" />

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            Oops! This Page is Not Finished Yet
          </h1>

          <p className="text-lg text-gray-600">
            We're working hard to bring you something awesome. Check back later!
          </p>

          <div className="space-y-4">
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center animate-spin-slow">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800">
              Thank you for your patience! We're making something special for
              you.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Expected completion: Coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFinished;
