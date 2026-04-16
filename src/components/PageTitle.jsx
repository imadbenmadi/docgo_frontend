import { useUserNavigation } from "../context/UserNavigationContext";

const PageTitle = () => {
  const { pageTitle } = useUserNavigation();

  // Extract just the page name without "healthpathglobal -" for shorter display
  const displayTitle = pageTitle.replace("healthpathglobal - ", "");

  return (
    <div className="mb-8 pb-6 border-b-2 border-gray-200">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {displayTitle}
      </h1>
      <div className="h-1 w-12 bg-gradient-to-r from-[#0086C9] to-[#00A6E6] rounded-full"></div>
    </div>
  );
};

export default PageTitle;
