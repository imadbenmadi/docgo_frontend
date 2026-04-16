function Step({ Number, label, description }) {
  return (
    <div className="group relative flex flex-col items-center gap-6 p-8 text-center bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
      {/* Gradient Glow on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 via-indigo-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:via-indigo-400/10 group-hover:to-purple-400/10 transition-all duration-500"></div>

      {/* Top Accent Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full group-hover:w-3/4 transition-all duration-500"></div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Enhanced Number Circle */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
          <span className="relative rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></span>
            <span className="relative"> {Number} </span>
          </span>
        </div>

        {/* Label with Gradient Effect on Hover */}
        <p className="font-bold text-lg sm:text-xl text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
          {label}
        </p>

        {/* Description */}
        <p className="leading-relaxed text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>

        {/* Bottom Decorative Dot */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
}

export default Step;
