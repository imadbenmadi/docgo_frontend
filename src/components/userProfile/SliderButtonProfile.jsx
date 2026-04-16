import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SliderButtonProfile = ({ direction, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-full border-2 transition-all duration-200 ${
      disabled
        ? "border-gray-300 text-gray-300 cursor-not-allowed"
        : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
    }`}
  >
    {direction === "prev" ? (
      <ChevronLeft className="w-5 h-5" />
    ) : (
      <ChevronRight className="w-5 h-5" />
    )}
  </button>
);

export default SliderButtonProfile;
