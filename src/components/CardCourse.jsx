import { motion } from "framer-motion";
import { ArrowRight, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CardCourse = ({ id, url, title, description, price }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ImageLoading, setImageLoading] = useState(true);
  const [ImageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleViewDetails = () => {
    if (id) {
      navigate(`/courses/${id}`);
    }
  };

  return (
    <motion.div
      className="relative flex flex-col cursor-pointer w-[280px] sm:w-[320px] md:w-[340px] bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group"
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

      {/* Sparkle effect on hover */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
      </div>

      {/* Image container with gradient overlay */}
      <div className="relative w-full h-44 sm:h-52 overflow-hidden">
        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {ImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {ImageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageIcon className="w-12 h-12" />
              <span className="text-xs font-medium">
                {t("ImageNotFound", "Image not found") || "Image not found"}
              </span>
            </div>
          </div>
        ) : (
          <img
            className={`w-full h-full object-cover transition-all duration-700 ${
              ImageLoading ? "opacity-0 scale-110" : "opacity-100 scale-100"}
            } `}
            src={url}
            alt={title}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Price badge with gradient */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1 transform group-hover:scale-110 transition-transform duration-300">
            <span className="text-sm sm:text-base font-bold">{price}</span>
            <span className="text-xs sm:text-sm font-medium">
              {t("Currency", "DA")}
            </span>
          </div>
        </div>
      </div>

      {/* Content section with improved spacing */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Title with gradient on hover */}
        <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
          {title}
        </h3>
        {/* Description with better styling */}
        {/* <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1">
          {description || t("CourseDescription", "The UI/UX design specialization takes a design-centered approach...")}
        </p> */}
        {/* Enhanced button with arrow */}
        {/* <motion.div */}\
        <div className="mt-2">
          {/* // whileHover={{ scale: 1.05 }}
          // whileTap={{ scale: 0.95 }} >
          */}
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn">
            <span className="text-sm sm:text-base">
              {t("ViewMoreDetails", "View more details")}
            </span>
            <ArrowRight
              className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
            />
          </button>
          {/* </motion.div> */}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0  transition-transform duration-500" />
    </motion.div>
  );
};

export default CardCourse;
