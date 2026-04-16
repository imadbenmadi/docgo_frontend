import { useTranslation } from "react-i18next";
import Step from "../../components/Step";

function WhatToDoSection({ cms }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const c = (key) => cms?.[`${key}_${lang}`] || cms?.[`${key}_en`] || null;

  return (
    <div
      id="Steps"
      className="relative w-full py-16 md:py-24 overflow-hidden bg-white"
    >
      {/* Decorative Background Elements - Hidden for clean white design */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden">
        {/* Animated Circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-indigo-400/10 rounded-full filter blur-2xl animate-pulse animation-delay-3000"></div>

        {/* Floating Dots Pattern */}
        <div className="absolute top-20 right-1/4 w-3 h-3 bg-blue-400/30 rounded-full animate-float"></div>
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-purple-400/30 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-indigo-400/30 rounded-full animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-12 md:gap-16 px-6 md:px-12 lg:px-20 xl:px-28 max-w-7xl mx-auto">
        {/* Enhanced Title Section */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {c("stepsTitle") ||
              t("WhatToDoToStudyAbroad", "What to do to study abroad?")}
          </h1>
          <div className="h-1 w-32 mx-auto bg-gray-300 rounded-full"></div>
        </div>

        <div className="grid place-items-stretch sm-sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
          <Step
            Number={1}
            label={c("step1Title") || t("Register", "Register")}
            description={
              c("step1Desc") ||
              t(
                "CreateAccountAndSubmitInfo",
                "Create your account and submit your details to start your visa application.",
              )
            }
          />
          <Step
            Number={2}
            label={c("step2Title") || t("Connexion", "Connect")}
            description={
              c("step2Desc") ||
              t(
                "OurTeamGuidesVisaProcess",
                "Our team will guide you through the visa process and required documents.",
              )
            }
          />
          <Step
            Number={3}
            label={c("step3Title") || t("Submit", "Submit")}
            description={
              c("step3Desc") ||
              t(
                "CompleteVisaApplication",
                "Complete your visa application and make the necessary payments.",
              )
            }
          />
          <Step
            Number={4}
            label={
              c("step4Title") || t("wewillcontactyou", "We will contact you")
            }
            description={
              c("step4Desc") ||
              t(
                "wewillcontactyoudesc",
                "We will follow up with you regarding the next steps, visa application and preparing the necessary documents.",
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

export default WhatToDoSection;
