import { useEffect, useState } from "react";
import FeaturedPrograms from "../components/programs/FeaturedPrograms";
import Reveal from "../components/Reveal";
import MainLoading from "../MainLoading";
import homeService from "../services/homeService";
import defaultHomeData from "../data/defaultHomeData";
import AboutUsSection from "./Layout/AboutUsSection";
import CoursesSection from "./Layout/CoursesSection";
import FrequentlyAskedQuestions from "./Layout/FrequentlyAskedQuestions";
import HelpSection from "./Layout/Helpsection";
import AdvancedSearchHero from "./Layout/AdvancedSearchHero";
import OurServices from "./Layout/OurServices";
import WhatToDoSection from "./Layout/WhatToDoSection";

function LandingPage() {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const response = await homeService.getHomePageData();
      if (response._isStaticFallback) {
        // API unavailable - use built-in defaults
        setIsOffline(true);
        setHomeData(response.data);
      } else if (response.success) {
        setIsOffline(false);
        // Merge: if server didn't return homePageContent, fall back to static
        const data = response.data;
        if (!data.homePageContent) {
          data.homePageContent = defaultHomeData.data.homePageContent;
        }
        setHomeData(data);
      } else {
        // API responded but with failure - use defaults silently
        setIsOffline(true);
        setHomeData(defaultHomeData.data);
      }
    } catch {
      setIsOffline(true);
      setHomeData(defaultHomeData.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <MainLoading />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Animated Background Elements - Removed for clean white design */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden">
        {/* Gradient Orbs - Hidden */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-3000"></div>

        {/* Floating Shapes - Hidden */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 border-4 border-blue-400/20 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-12 h-12 border-4 border-purple-400/20 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-lg animate-float animation-delay-4000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 border-4 border-indigo-400/20 rounded-full animate-float animation-delay-3000"></div>

        {/* Grid Pattern Overlay - Hidden */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 hidden"></div>

        {/* Gradient Mesh - Hidden */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full filter blur-3xl hidden"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full filter blur-3xl hidden"></div>
      </div>

      {/* Offline / static-fallback banner */}
      {/* {isOffline && (
                <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-xs font-medium py-1.5 px-4 text-center">
                    <span></span>
                    <span>
                        Connexion au serveur indisponible - affichage du contenu
                        par défaut
                    </span>
                    <button
                        onClick={fetchHomeData}
                        className="ml-3 underline hover:no-underline font-semibold"
                    >
                        Réessayer
                    </button>
                </div>
            )} */}

      {/* Content */}
      <div className={`relative z-10 ${isOffline ? "mt-8" : ""}`}>
        {(() => {
          const cms = homeData?.homePageContent;
          const show = (key) => !cms || cms[key] !== false;
          return (
            <>
              {/* <Reveal>
                                <HereoSection
                                    statistics={homeData?.statistics}
                                    cms={cms}
                                />
                            </Reveal> */}
              {show("showProgramSearcher") && (
                <Reveal>
                  <AdvancedSearchHero cms={cms} />
                </Reveal>
              )}
              {show("showStepsSection") && (
                <Reveal>
                  <WhatToDoSection cms={cms} />
                </Reveal>
              )}
              {show("showAboutSection") && (
                <Reveal>
                  <AboutUsSection cms={cms} />
                </Reveal>
              )}
              {show("showServicesSection") && (
                <Reveal>
                  <OurServices statistics={homeData?.statistics} cms={cms} />
                </Reveal>
              )}
              {show("showFeaturedCourses") && (
                <CoursesSection
                  featuredCourses={homeData?.featuredCourses}
                  latestCourses={homeData?.latestCourses}
                />
              )}
              {show("showFeaturedPrograms") && (
                <Reveal>
                  <FeaturedPrograms
                    limit={3}
                    featuredPrograms={homeData?.featuredPrograms}
                    latestPrograms={homeData?.latestPrograms}
                  />
                </Reveal>
              )}
              {show("showFAQSection") && (
                <Reveal>
                  <FrequentlyAskedQuestions faqs={homeData?.faqs} />
                </Reveal>
              )}
              <Reveal>
                <HelpSection contactInfo={homeData?.contactInfo} />
              </Reveal>
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default LandingPage;
