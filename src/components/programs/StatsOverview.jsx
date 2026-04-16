import React from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap, Users, Globe, Star } from "lucide-react";

const StatsOverview = ({
  totalPrograms,
  openPrograms,
  featuredPrograms,
  totalUniversities,
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: GraduationCap,
      label: t("Total Programs", "Total Programs") || "Total Programs",
      value: totalPrograms || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    // {
    //     icon: Users,
    //     label: t("Open Programs", "Open Programs") || "Open Programs",
    //     value: openPrograms || 0,
    //     color: "text-green-600",
    //     bgColor: "bg-green-100",
    // },
    {
      icon: Star,
      label: t("Featured", "Featured") || "Featured",
      value: featuredPrograms || 0,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    // {
    //     icon: Globe,
    //     label: t("Universities", "Universities") || "Universities",
    //     value: totalUniversities || 0,
    //     color: "text-purple-600",
    //     bgColor: "bg-purple-100",
    // },
  ];

  return (
    <div className="bg-white border-b border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="grid grid-cols-2  gap-6 md:gap-20 max-w-3xl">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-full mb-4 mx-auto`}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
