import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import RichTextDisplay from "../../Common/RichTextEditor/RichTextDisplay";

const CourseFAQSection = ({ faqs = [] }) => {
  const { t, i18n } = useTranslation();
  const [openItems, setOpenItems] = useState(new Set());

  // Get current language
  const currentLang = i18n.language || "en";

  // Toggle FAQ item
  const toggleItem = (faqId) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(faqId)) {
      newOpenItems.delete(faqId);
    } else {
      newOpenItems.add(faqId);
    }
    setOpenItems(newOpenItems);
  };

  // Get localized text based on current language
  const getLocalizedText = (faq, field) => {
    if (currentLang === "ar" && faq[`${field}_ar`]) {
      return faq[`${field}_ar`];
    }
    if (currentLang === "fr" && faq[`${field}_fr`]) {
      return faq[`${field}_fr`];
    }
    return faq[field] || "";
  };

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((groups, faq) => {
    const category =
      getLocalizedText(faq, "category") || t("common.general", "General");
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(faq);
    return groups;
  }, {});

  // If no FAQs, don't render the section
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {t("faq_title", "Frequently Asked Questions")}
        </h3>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
          <div key={category}>
            {Object.keys(groupedFAQs).length > 1 && (
              <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                {category}
              </h4>
            )}

            <div className="space-y-3">
              {categoryFAQs.map((faq) => {
                const isOpen = openItems.has(faq.id);
                const question = getLocalizedText(faq, "question");
                const answer = getLocalizedText(faq, "answer");

                return (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full px-4 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-900 pr-4">
                        {question}
                      </span>
                      {isOpen ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 py-4 bg-white border-t border-gray-100">
                        <div dir={currentLang === "ar" ? "rtl" : "ltr"}>
                          <RichTextDisplay
                            content={answer}
                            className="prose prose-sm max-w-none"
                            textClassName="text-gray-700 leading-relaxed"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ count indicator */}
      {/* <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 text-center">
                    {t(
                        "course.faq_count",
                        { count: faqs.length },
                        `${faqs.length} questions answered`
                    )}
                </p>
            </div> */}
    </div>
  );
};

export default CourseFAQSection;
