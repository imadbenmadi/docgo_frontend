import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Service({ url, h1, h3, p, btn, to }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="group relative flex flex-col gap-6 p-8 w-full md:w-[45%] lg:w-[48%] bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>

      {/* Sparkle Effect */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
      </div>

      {/* Top Accent Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

      <div className="relative z-10 flex flex-col gap-6 items-center text-center">
        {/* Image Container with Glow Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <motion.img
            className="relative w-48 h-48 md:w-56 md:h-56 object-contain transform group-hover:scale-110 transition-transform duration-500"
            src={`${url}`}
            alt={`${h1}`}
            animate={isHovered ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Title with Gradient */}
        <h1 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
          {h1}
        </h1>

        {/* Subtitle with Animated Border */}
        <div className="relative inline-block w-full">
          <h3 className="text-base md:text-lg font-semibold text-gray-700 pb-3">
            {h3}
          </h3>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-3/4 transition-all duration-500"></div>
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 min-h-[60px]">
          {p}
        </p>

        {/* Enhanced Button */}
        <Link to={to} className="w-full mt-4">
          <motion.button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{btn}</span>
            <ArrowRight
              className={`w-5 h-5 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
            />
          </motion.button>
        </Link>
      </div>

      {/* Bottom Corner Decoration */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </motion.div>
  );
}

export default Service;
