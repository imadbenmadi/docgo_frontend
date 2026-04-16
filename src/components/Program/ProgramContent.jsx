import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { TbTargetArrow } from "react-icons/tb";
import RichTextDisplay from "../Common/RichTextEditor/RichTextDisplay";
import {
  getCountryDisplayName,
  getCountryName,
} from "../../utils/countryCodeMap";

const ProgramContent = ({ program }) => {
  const { t, i18n } = useTranslation("", { keyPrefix: "programs" });
  const { t: tCommon } = useTranslation();

  // Get localized full description
  const programDescription =
    i18n.language === "ar" && program.description_ar
      ? program.description_ar
      : program.description;

  // Get localized content for new fields
  const eligibilityCriteria =
    i18n.language === "ar" && program.eligibilityCriteria_ar
      ? program.eligibilityCriteria_ar
      : program.eligibilityCriteria;

  const requiredDocuments =
    i18n.language === "ar" && program.requiredDocuments_ar
      ? program.requiredDocuments_ar
      : program.requiredDocuments;

  // Get university info
  const university =
    i18n.language === "ar" && program.university_ar
      ? program.university_ar
      : program.university;

  const specialty =
    program.programSpecialty ||
    (i18n.language === "ar" && program.category_ar
      ? program.category_ar
      : program.category);

  const getProgramCountryText = () => {
    const raw = program?.programCountry || program?.country || "";
    if (!raw) return "";

    const rawStr = String(raw);
    const isIso2 = /^[a-z]{2}$/i.test(rawStr);
    const frName = isIso2 ? getCountryName(rawStr.toUpperCase()) : rawStr;

    return i18n.language === "ar"
      ? getCountryDisplayName(frName, "ar")
      : frName;
  };

  const countryText = getProgramCountryText();

  // Helper function to check if content is empty
  const hasContent = (content) => {
    if (!content) return false;

    // Handle non-string values
    if (typeof content !== "string") {
      // If it's an object or array, check if it has content
      if (typeof content === "object") {
        return Object.keys(content).length > 0;
      }
      return false;
    }

    // Remove HTML tags and check if there's actual text
    const textOnly = content.replace(/<[^>]*>/g, "").trim();
    return textOnly.length > 0;
  };

  return (
    <div className="space-y-8">
      {/* About This Program - Full Description */}
      {hasContent(programDescription) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {t("About this program", "About this program")}
            </h3>
          </div>
          <RichTextDisplay
            textClassName="text-gray-700"
            content={programDescription}
          />
        </div>
      )}

      {/* Program Type & University Info */}
      {(program.programType || university || specialty) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-purple-600 w-6 h-6" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("Program Information", "Program Information")}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.programType && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("Type", "Type")}
                  </p>
                  <p className="text-gray-700 capitalize">
                    {program.programType}
                  </p>
                </div>
              </div>
            )}

            {university && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("University", "University")}
                  </p>
                  <p className="text-gray-700">{university}</p>
                </div>
              </div>
            )}

            {specialty && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {tCommon("Specialites", "Specialty")}
                  </p>
                  <p className="text-gray-700">{specialty}</p>
                </div>
              </div>
            )}

            {program.language && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("Language", "Language")}
                  </p>
                  <p className="text-gray-700">{program.language}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Information */}
      {program.Price && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            {/* <DollarSign className="text-emerald-600 w-6 h-6" /> */}
            <h3 className="text-xl font-bold text-gray-900">
              {t("Financial Information", "Financial Information") ||
                "Financial Information"}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.Price && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {/* <DollarSign className="w-4 h-4 text-emerald-600" /> */}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("Program Fee", "Program Fee") || "Program Fee"}
                  </p>
                  <p className="text-gray-700 text-lg font-semibold">
                    {program.Price}
                  </p>
                  {program.discountPrice && (
                    <p className="text-sm text-emerald-600 mt-1">
                      {t("Discount Price", "Discount Price") ||
                        "Discount Price"}
                      : {program.discountPrice}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Important Dates & Location */}
      {(program.applicationStartDate ||
        program.applicationDeadline ||
        program.programStartDate ||
        program.programEndDate ||
        countryText) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600 w-6 h-6" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("Program Highlights", "Program Highlights") ||
                "Program Highlights"}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.applicationStartDate && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("Application Opens", "Application Opens") ||
                      "Application Opens"}
                  </p>
                  <p className="text-gray-700">
                    {new Date(
                      program.applicationStartDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {program.applicationDeadline && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                <Clock className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("Application Deadline", "Application Deadline") ||
                      "Application Deadline"}
                  </p>
                  <p className="text-gray-700">
                    {new Date(program.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {program.programStartDate && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("Program Starts", "Program Starts") || "Program Starts"}
                  </p>
                  <p className="text-gray-700">
                    {new Date(program.programStartDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {program.programEndDate && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                <Calendar className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("Program Ends", "Program Ends") || "Program Ends"}
                  </p>
                  <p className="text-gray-700">
                    {new Date(program.programEndDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {countryText && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {tCommon("country", "Country") || "Country"}
                  </p>
                  <p className="text-gray-700">{countryText}</p>
                  {program.programCountry && program.country && (
                    <p className="text-sm text-gray-600 mt-0.5">
                      {String(program.country)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {program.isRemote !== undefined && (
              <div className="flex items-start gap-3 bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                <Globe className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {t("Format", "Format") || "Format"}
                  </p>
                  <p className="text-gray-700">
                    {program.isRemote
                      ? t("Remote", "Remote") || "Remote"
                      : t("On-site", "On site") || "On-site"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Program Highlights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
        <div className="flex items-center mb-4">
          <Award className="text-blue-600 w-6 h-6 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">
            {t("Program Highlights", "Program Highlights") ||
              "Program Highlights"}
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {program.startDate && (
            <div className="flex items-start bg-white rounded-lg p-4">
              <Calendar className="text-blue-600 w-5 h-5 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">
                  {t("Start Date", "Start Date") || "Start Date"}
                </p>
                <p className="text-gray-600 text-sm">
                  {new Date(program.startDate).toLocaleDateString(
                    i18n.language === "ar" ? "ar-DZ" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
          )}
          {program.duration && (
            <div className="flex items-start bg-white rounded-lg p-4">
              <Clock className="text-blue-600 w-5 h-5 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">
                  {t("Duration", "Duration") || "Duration"}
                </p>
                <p className="text-gray-600 text-sm">{program.duration}</p>
              </div>
            </div>
          )}
          {program.isRemote !== null && (
            <div className="flex items-start bg-white rounded-lg p-4">
              <MapPin className="text-blue-600 w-5 h-5 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">
                  {t("Format", "Format") || "Format"}
                </p>
                <p className="text-gray-600 text-sm">
                  {program.isRemote
                    ? t("Remote", "Remote") || "Remote"
                    : t("On-site", "On site") || "On-site"}
                </p>
              </div>
            </div>
          )}
          {program.Users_count && (
            <div className="flex items-start bg-white rounded-lg p-4">
              <Users className="text-blue-600 w-5 h-5 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">
                  {t("Participants", "Participants") || "Participants"}
                </p>
                <p className="text-gray-600 text-sm">
                  {program.Users_count}{" "}
                  {t("enrolled", "Enrolled") || "enrolled"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Eligibility Criteria */}
      {hasContent(eligibilityCriteria) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Target className="text-blue-600 w-6 h-6 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("Eligibility Criteria", "Eligibility Criteria") ||
                "Eligibility Criteria"}
            </h3>
          </div>
          <RichTextDisplay
            textClassName="text-gray-700"
            content={eligibilityCriteria}
          />
        </div>
      )}

      {/* Required Documents */}
      {hasContent(requiredDocuments) && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-100 p-6">
          <div className="flex items-center mb-4">
            <FileText className="text-orange-600 w-6 h-6 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("Required Documents", "Required Documents") ||
                "Required Documents"}
            </h3>
          </div>
          <RichTextDisplay
            textClassName="text-gray-700"
            content={requiredDocuments}
          />
        </div>
      )}

      {/* Requirements (keeping for backward compatibility) */}
      {hasContent(program.requirements) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="text-orange-500 w-6 h-6 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("Requirements", "Requirements") || "Requirements"}
            </h3>
          </div>
          <RichTextDisplay
            textClassName="text-gray-700"
            content={program.requirements}
          />
        </div>
      )}

      {/* Program Structure */}
      {hasContent(program.structure) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {t("Program Structure", "Program Structure") || "Program Structure"}
          </h3>
          <RichTextDisplay
            textClassName="text-gray-700"
            content={program.structure}
          />
        </div>
      )}
    </div>
  );
};

ProgramContent.propTypes = {
  program: PropTypes.object.isRequired,
};

export default ProgramContent;
