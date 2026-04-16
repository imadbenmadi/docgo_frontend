import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import FaqElement from "../../components/FaqElement";
import BackgroundImage from "../../../src/assets/three monochrome plastic spheres.png";
import Container from "../../components/Container";
import GeometricShapes from "../../../src/assets/geometric shapes.png";
import api from "../../services/apiClient";

function FrequentlyAskedQuestions({ faqs: propFaqs }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [fetchedFaqs, setFetchedFaqs] = useState([]);

  // Self-fetch FAQs when the parent didn't supply any
  useEffect(() => {
    if (propFaqs && propFaqs.length > 0) return; // parent already provided data
    api
      .get("/faqs?isActive=true&limit=50&sortBy=createdAt&sortOrder=desc")
      .then((res) => {
        const data = res.data;
        if (data?.success && Array.isArray(data?.faqs)) {
          setFetchedFaqs(data.faqs);
        }
      })
      .catch(() => {
        // silently fall back to static translations
      });
  }, [propFaqs]);

  // Prefer parent-provided FAQs, then self-fetched, then static fallback
  const dynamicFaqs = propFaqs && propFaqs.length > 0 ? propFaqs : fetchedFaqs;

  // Use dynamic FAQs or fallback to static translations
  const displayFAQs = dynamicFaqs.length > 0 ? dynamicFaqs : [];

  /* 
    // COMMENTED OUT DEFAULT FAQs - Show empty state if no FAQs exist
    : [
        { question: t("faqQuestion1", "How do I start the process of studying abroad?"), answer: t("faqAnswer1", "Simply register on our platform, fill in your details, and our team will guide you through the application and visa process.") },
        { question: t("faqQuestion2", "What documents are needed to apply?"), answer: t("faqAnswer2", "Required documents include a valid passport, transcripts, and motivation or recommendation letters.") },
        { question: t("faqQuestion3", "Do you offer financial assistance or scholarships?"), answer: t("faqAnswer3", "Yes, we provide guidance on available scholarships and help you apply.") },
    ];
    */

  /**
   * Smart language fallback logic for FAQ text
   * Priority:
   * 1. Try selected language (ar, fr, en)
   * 2. If not available, try English as default
   * 3. If not available, try French
   * 4. If not available, try Arabic
   * 5. Finally, try the base field without suffix
   */
  const getFAQText = (faq, field) => {
    // Handle static translations (strings)
    if (typeof faq[field] === "string") return faq[field];

    // Define language priority based on current selection
    let languagePriority = [];

    if (currentLanguage === "ar") {
      languagePriority = [`${field}_ar`, field, `${field}_fr`, `${field}_en`];
    } else if (currentLanguage === "fr") {
      languagePriority = [`${field}_fr`, field, `${field}_en`, `${field}_ar`];
    } else {
      // Default to English
      languagePriority = [field, `${field}_en`, `${field}_fr`, `${field}_ar`];
    }

    // Find first available translation
    for (const langField of languagePriority) {
      if (faq[langField] && faq[langField].trim() !== "") {
        return faq[langField];
      }
    }

    // Final fallback - return empty string
    return "";
  };

  return (
    <div
      id="FAQ"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundAttachment: "fixed",
        backgroundPosition: "right",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }}
      className="w-full flex justify-center items-center bg-sky-50 mt-10 md:mt-20 relative"
    >
      <Container style="flex flex-col sm-sm:gap-4 bg-sky-50 opacity-95 md:gap-6 p-4 md:p-16 w-full md:w-[90%] lg:w-[80%] xl:w-[70%] max-w-7xl relative z-10">
        <img
          className="w-full h-full object-contain"
          src={GeometricShapes}
          alt={t("geometricShapes", "geometric shapes")}
        />

        <h1 className="text-xl md:text-2xl text-center font-medium text-customGray">
          {t("faqTitle", "Frequently asked questions")}
        </h1>

        <p className="text-customGray text-center leading-normal font-normal text-sm md:text-base px-4">
          {t("faqDescription", "Faq Description")}
        </p>

        <div className="flex flex-col gap-3 md:gap-6">
          {displayFAQs.length > 0 ? (
            displayFAQs.map((faq, index) => (
              <FaqElement
                key={faq.id || index}
                question={getFAQText(faq, "question")}
                answer={getFAQText(faq, "answer")}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-lg">
                {t("noFAQsAvailable", "No FAQs available at this moment.")}
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

FrequentlyAskedQuestions.propTypes = {
  faqs: PropTypes.arrayOf(PropTypes.object),
};

export default FrequentlyAskedQuestions;
