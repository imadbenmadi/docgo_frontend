import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../utils/apiClient";
import { getApiErrorMessage } from "../utils/apiErrorTranslate";

/**
 * Custom hook to fetch homepage content from database
 * Merges database content with i18n translations based on current language
 *
 * Usage:
 *   const content = useHomePageContent();
 *   // content.hero.title (from DB or fallback to i18n)
 *   // content.about.description
 *   // etc.
 */
export const useHomePageContent = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Fetch homepage content from backend
        const response = await apiClient.get("/HomePage");

        if (response.data?.success || response.data?.content) {
          const dbContent = response.data.content || response.data;

          // Get current language
          const lang = i18n.language || "en";

          // Create merged content object that combines DB content with i18n fallbacks
          const mergedContent = {
            hero: {
              badge: dbContent[`heroBadge_${lang}`] || t("homepage.hero.badge"),
              title: dbContent[`heroTitle_${lang}`] || t("homepage.hero.title"),
              subtitle:
                dbContent[`heroSubtitle_${lang}`] ||
                t("homepage.hero.subtitle"),
              cta: dbContent[`heroCta_${lang}`] || t("homepage.hero.cta"),
            },
            about: {
              title:
                dbContent[`aboutTitle_${lang}`] || t("homepage.about.title"),
              description:
                dbContent[`aboutDescription_${lang}`] ||
                t("homepage.about.description"),
              quote:
                dbContent[`studyQuote_${lang}`] || t("homepage.about.quote"),
              isVisible: dbContent.showAboutSection !== false,
            },
            steps: {
              title:
                dbContent[`stepsTitle_${lang}`] || t("homepage.steps.title"),
              step1: {
                title:
                  dbContent[`step1Title_${lang}`] ||
                  t("homepage.steps.step1.title"),
                description:
                  dbContent[`step1Desc_${lang}`] ||
                  t("homepage.steps.step1.description"),
              },
              step2: {
                title:
                  dbContent[`step2Title_${lang}`] ||
                  t("homepage.steps.step2.title"),
                description:
                  dbContent[`step2Desc_${lang}`] ||
                  t("homepage.steps.step2.description"),
              },
              step3: {
                title:
                  dbContent[`step3Title_${lang}`] ||
                  t("homepage.steps.step3.title"),
                description:
                  dbContent[`step3Desc_${lang}`] ||
                  t("homepage.steps.step3.description"),
              },
              step4: {
                title:
                  dbContent[`step4Title_${lang}`] ||
                  t("homepage.steps.step4.title"),
                description:
                  dbContent[`step4Desc_${lang}`] ||
                  t("homepage.steps.step4.description"),
              },
            },
            services: {
              title:
                dbContent[`servicesTitle_${lang}`] ||
                t("homepage.services.title"),
              service1: {
                title:
                  dbContent[`service1Title_${lang}`] ||
                  t("homepage.services.service1.title"),
                description:
                  dbContent[`service1Desc_${lang}`] ||
                  t("homepage.services.service1.description"),
                cta:
                  dbContent[`service1Cta_${lang}`] ||
                  t("homepage.services.service1.cta"),
              },
              service2: {
                title:
                  dbContent[`service2Title_${lang}`] ||
                  t("homepage.services.service2.title"),
                description:
                  dbContent[`service2Desc_${lang}`] ||
                  t("homepage.services.service2.description"),
                cta:
                  dbContent[`service2Cta_${lang}`] ||
                  t("homepage.services.service2.cta"),
              },
            },
            programSearcher: {
              title:
                dbContent[`programSearcherTitle_${lang}`] ||
                t("homepage.programSearcher.title"),
              description:
                dbContent[`programSearcherDescription_${lang}`] ||
                t("homepage.programSearcher.description"),
              placeholder:
                dbContent[`programSearcherPlaceholder_${lang}`] ||
                t("homepage.programSearcher.placeholder"),
              buttonText:
                dbContent[`programSearcherButtonText_${lang}`] ||
                t("homepage.programSearcher.buttonText"),
              isVisible: dbContent.showProgramSearcher !== false,
            },
            faq: {
              title: dbContent[`faqTitle_${lang}`] || t("homepage.faq.title"),
              description:
                dbContent[`faqDescription_${lang}`] ||
                t("homepage.faq.subtitle"),
              isVisible: dbContent.showFAQSection !== false,
            },
            countries: {
              title: t("homepage.countries.title"),
              subtitle: t("homepage.countries.subtitle"),
              list: dbContent.featuredCountries || [],
              isVisible: dbContent.showAboutCountries !== false,
            },
            // Toggle visibility settings
            visibility: {
              featuredCourses: dbContent.showFeaturedCourses !== false,
              featuredPrograms: dbContent.showFeaturedPrograms !== false,
              programSearcher: dbContent.showProgramSearcher !== false,
              aboutSection: dbContent.showAboutSection !== false,
              servicesSection: dbContent.showServicesSection !== false,
              stepsSection: dbContent.showStepsSection !== false,
              faqSection: dbContent.showFAQSection !== false,
              aboutCountries: dbContent.showAboutCountries !== false,
            },
            // Filter options
            filterStudyDomains: dbContent.filterStudyDomains || [],
            filterStudyLocations: dbContent.filterStudyLocations || [],
          };

          setContent(mergedContent);
          setError(null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        // Use i18n as complete fallback
        setContent({
          hero: {
            badge: t("homepage.hero.badge"),
            title: t("homepage.hero.title"),
            subtitle: t("homepage.hero.subtitle"),
            cta: t("homepage.hero.cta"),
          },
          about: {
            title: t("homepage.about.title"),
            description: t("homepage.about.description"),
          },
          steps: {
            title: t("homepage.steps.title"),
            step1: {
              title: t("homepage.steps.step1.title"),
              description: t("homepage.steps.step1.description"),
            },
            step2: {
              title: t("homepage.steps.step2.title"),
              description: t("homepage.steps.step2.description"),
            },
            step3: {
              title: t("homepage.steps.step3.title"),
              description: t("homepage.steps.step3.description"),
            },
            step4: {
              title: t("homepage.steps.step4.title"),
              description: t("homepage.steps.step4.description"),
            },
          },
          services: {
            title: t("homepage.services.title"),
            service1: {
              title: t("homepage.services.service1.title"),
              description: t("homepage.services.service1.description"),
              cta: t("homepage.services.service1.cta"),
            },
            service2: {
              title: t("homepage.services.service2.title"),
              description: t("homepage.services.service2.description"),
              cta: t("homepage.services.service2.cta"),
            },
          },
          programSearcher: {
            title: t("homepage.programSearcher.title"),
            description: t("homepage.programSearcher.description"),
            placeholder: t("homepage.programSearcher.placeholder"),
            buttonText: t("homepage.programSearcher.buttonText"),
            isVisible: true,
          },
          faq: {
            title: t("homepage.faq.title"),
            description: t("homepage.faq.subtitle"),
            isVisible: true,
          },
          countries: {
            title: t("homepage.countries.title"),
            subtitle: t("homepage.countries.subtitle"),
            list: [],
            isVisible: true,
          },
          visibility: {
            featuredCourses: true,
            featuredPrograms: true,
            programSearcher: true,
            aboutSection: true,
            servicesSection: true,
            stepsSection: true,
            faqSection: true,
            aboutCountries: true,
          },
          filterStudyDomains: [],
          filterStudyLocations: [],
        });
        setError(getApiErrorMessage(err, t));
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [i18n.language, t]);

  return { content, loading, error };
};

export default useHomePageContent;
