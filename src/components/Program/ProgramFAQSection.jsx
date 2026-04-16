import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpSolid } from "@heroicons/react/24/solid";
import PropTypes from "prop-types";
import { useAppContext } from "../../AppContext";
import RichTextDisplay from "../Common/RichTextDisplay";
import { showSimpleInfo, showSimpleError } from "../../utils/sweetAlertHelper";
import apiClient from "../../utils/apiClient";

const ProgramFAQSection = ({ faqs = [] }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAppContext();
  const [openItems, setOpenItems] = useState(new Set());
  const [voteStates, setVoteStates] = useState({}); // Track voting states for each FAQ
  const [selectedCategory, setSelectedCategory] = useState(t("faq.all", "All"));

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

  // Handle voting on FAQ
  const handleVote = async (faqId) => {
    if (!user) {
      await showSimpleInfo(
        t("faq.pleaseLoginToVote", "Please log in to vote on FAQs."),
      );
      return;
    }

    // Check if already voted
    if (voteStates[faqId]?.hasVoted) {
      await showSimpleInfo(
        t("faq.alreadyVoted", "You have already voted on this FAQ."),
      );
      return;
    }

    // Set voting state
    setVoteStates((prev) => ({
      ...prev,
      [faqId]: { ...prev[faqId], isVoting: true },
    }));

    try {
      const response = await apiClient.post(
        `/faqs/${faqId}/helpful`,
        { voteType: "helpful" },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      const result = response.data;
      if (result.success) {
        setVoteStates((prev) => ({
          ...prev,
          [faqId]: {
            ...prev[faqId],
            hasVoted: true,
            isVoting: false,
            helpfulCount: result.helpfulCount,
          },
        }));
      } else {
        await showSimpleError(
          result.message ||
            t("faq.failedToVote", "Failed to submit vote. Please try again."),
        );
      }
    } catch (error) {
      await showSimpleError(
        t("faq.failedToVote", "Failed to submit vote. Please try again."),
      );
    } finally {
      setVoteStates((prev) => ({
        ...prev,
        [faqId]: { ...prev[faqId], isVoting: false },
      }));
    }
  };

  // Group FAQs by category and extract unique categories
  const groupedFAQs = faqs.reduce((groups, faq) => {
    const category =
      getLocalizedText(faq, "category") || t("common.general", "General");
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(faq);
    return groups;
  }, {});

  // Extract categories for filter
  const availableCategories = [
    t("faq.all", "All"),
    ...Object.keys(groupedFAQs),
  ];

  // Filter FAQs based on selected category
  const filteredFAQs =
    selectedCategory === t("faq.all", "All")
      ? faqs
      : groupedFAQs[selectedCategory] || [];

  // If no FAQs, don't render the section
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {t("FAQ", "FAQ")}
        </h3>
        <p className="text-gray-600">
          {t(
            "faq.description",
            "Frequently asked questions about this program",
          )}
        </p>
      </div>

      {/* Category Filter */}
      {availableCategories.length > 2 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("faq.filterByCategory", "Filter by Category")}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableCategories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map((faq) => {
          const isOpen = openItems.has(faq.id);
          const voteState = voteStates[faq.id] || {};
          const helpfulCount = voteState.helpfulCount ?? faq.helpfulCount ?? 0;

          return (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Question */}
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium text-gray-900 pr-4 flex-1">
                    <RichTextDisplay
                      content={getLocalizedText(faq, "question")}
                      className="text-gray-900"
                    />
                  </div>
                  {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </div>
              </button>

              {/* Answer */}
              {isOpen && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <RichTextDisplay
                    content={getLocalizedText(faq, "answer")}
                    className="text-gray-700 mb-4"
                  />

                  {/* Voting Section */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <HandThumbUpIcon className="h-4 w-4" />
                      <span>
                        {helpfulCount}{" "}
                        {t(
                          "faq.peopleFoundHelpful",
                          "people found this helpful",
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => handleVote(faq.id)}
                      disabled={
                        !user || voteState.hasVoted || voteState.isVoting
                      }
                      className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                        voteState.hasVoted
                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                          : user
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                      }`}
                      title={
                        !user ? t("faq.loginToVote", "Log in to vote") : ""
                      }
                    >
                      {voteState.hasVoted ? (
                        <HandThumbUpSolid className="h-4 w-4" />
                      ) : (
                        <HandThumbUpIcon className="h-4 w-4" />
                      )}
                      <span>
                        {voteState.isVoting
                          ? t("faq.voting", "Voting...")
                          : voteState.hasVoted
                            ? t("faq.voted", "Voted")
                            : t("faq.helpful", "Helpful")}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No FAQs for selected category */}
      {filteredFAQs.length === 0 &&
        selectedCategory !== t("faq.all", "All") && (
          <div className="text-center py-8 text-gray-500">
            <p>{t("faq.noFaqsInCategory", "No FAQs found in this category")}</p>
          </div>
        )}
    </div>
  );
};

ProgramFAQSection.propTypes = {
  faqs: PropTypes.arrayOf(PropTypes.object),
};

export default ProgramFAQSection;
