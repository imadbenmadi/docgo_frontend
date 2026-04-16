import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StudyForm from "../../components/StudyForm";

function HeroSection({ statistics, cms }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const c = (key) => cms?.[`${key}_${lang}`] || cms?.[`${key}_en`] || null;
  return (
    <div className="relative flex justify-between items-center w-full py-12 md:py-16 px-6 md:px-12 lg:px-20 xl:px-28 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/30 to-pink-400/30 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-1/4 w-20 h-20 border-4 border-blue-400/20 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 border-4 border-purple-400/20 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-lg rotate-12 animate-float animation-delay-3000"></div>
        <div className="absolute top-2/3 right-1/3 w-8 h-8 border-4 border-pink-400/20 rounded-full animate-float animation-delay-4000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12 w-full">
        {/* Left Content Section */}
        <motion.div
          className="flex flex-col items-start gap-5 w-full lg:w-[50%] text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge with Icon */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm mx-auto lg:mx-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span className="text-xs md:text-sm text-gray-700 font-medium">
              {c("heroBadge") ||
                t("ExploreOpportunities", "Explore the world of opportunities")}
            </span>
            <Sparkles className="w-3 h-3 text-purple-600" />
          </motion.div>

          {/* Main Heading with Gradient */}
          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-sm">
              {c("heroTitle") ||
                t(
                  "DiveIntoPossibilities",
                  "Dive into a world of possibilities: Study abroad with us",
                )}
            </span>
          </motion.h1>

          {/* Decorative Line */}
          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full mx-auto lg:mx-0"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* Subheading */}
          <motion.p
            className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {t(
              "JoinUsToDiscover",
              "Join us to discover incredible study abroad options and elevate your learning through specialized courses",
            )}
          </motion.p>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          ></motion.div>

          {/* CTA Button with Enhanced Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mx-auto lg:mx-0"
          >
            <Link to="/Programs">
              <motion.button
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm md:text-base rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-2">
                  {c("heroCta") || t("StudyAbroad", "Study Abroad")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Form Section */}
        <motion.div
          className="w-full lg:w-[45%]"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <StudyForm
            customFields={
              Array.isArray(cms?.filterStudyDomains) &&
              cms.filterStudyDomains.length > 0
                ? cms.filterStudyDomains
                : null
            }
            customLocations={
              Array.isArray(cms?.filterStudyLocations) &&
              cms.filterStudyLocations.length > 0
                ? cms.filterStudyLocations
                : null
            }
          />
        </motion.div>
      </div>
    </div>
  );
}

export default HeroSection;
