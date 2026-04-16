import { useTranslation } from "react-i18next";
import BackgroundImage from "../../assets/About us.png";

function AboutUsSection({ cms }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const lang = i18n.language?.split("-")[0] || "en";
  const c = (key) => cms?.[`${key}_${lang}`] || cms?.[`${key}_en`] || null;

  const isVisible = cms?.showAboutSection !== false;

  if (!isVisible) {
    return null;
  }

  const showCountries = cms?.showAboutCountries !== false;
  const featuredCountries = Array.isArray(cms?.featuredCountries)
    ? cms.featuredCountries
    : [];

  // Get managed about section content with fallbacks to i18n
  const aboutTitle = c("aboutTitle") || t("AboutUs", "About Us");
  const aboutDescription =
    c("aboutDescription") ||
    t(
      "AboutUsDescription",
      "We empower students to access study abroad opportunities and professional growth. We offer personalized guidance, online courses, and a supportive community to help you achieve your academic and professional goals. Unlock your potential with us!",
    );
  const studyQuote =
    c("studyQuote") ||
    t(
      "StudyAbroadQuote",
      '"Studying abroad can change the way you see the world"',
    );

  // Map featured countries to flag data
  const flags = featuredCountries.map((country) => ({
    code: country.code,
    name:
      lang === "fr"
        ? country.name_fr || country.name_en
        : lang === "ar"
          ? country.name_ar || country.name_en
          : country.name_en,
  }));

  return (
    <div
      id="aboutUs"
      className="relative w-full py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="backdrop-blur-sm bg-[#F7FCFF]/20 rounded-lg shadow-lg p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 lg:gap-10">
            <h1 className="sm:text-2xl lg:text-2xl xl:text-3xl font-medium text-customGray text-center">
              {aboutTitle}
            </h1>

            <p className="sm-sm:text-[12px] sm:text-sm lg:text-base xl:text-lg text-customGray leading-relaxed text-center">
              {aboutDescription}
            </p>

            <div className="grid grid-cols-2 place-items-center sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-4 lg:gap-6 py-6 md:py-8">
              {showCountries &&
                flags.map((flag) => (
                  <div
                    key={flag.code}
                    className="flex flex-col items-center gap-3"
                  >
                    <img
                      src={`https://flagcdn.com/256x192/${flag.code.toLowerCase()}.png`}
                      alt={flag.name}
                      className="w-16 h-12 md:w-20 md:h-14 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/80x60?text=${flag.code}`;
                      }}
                    />
                    <p className="text-xs md:text-sm text-center text-gray-700 font-medium">
                      {flag.name}
                    </p>
                  </div>
                ))}
            </div>

            <div
              className={` ${
                isRTL ? "border-r-2" : "border-l-2"
              }  border-black pl-4 md:pl-6`}
            >
              <p className="sm-sm:text-sm text-base sm:text-base md:text-lg lg:text-lg xl:text-xl text-customGray font-medium">
                {studyQuote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsSection;
