import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import SliderButtonProfileProfile from "./SliderButtonProfile";

const CertificatesProfileSection = ({
  certificates,
  currentSlide,
  setSlide,
}) => {
  const { t, i18n } = useTranslation();
  const itemsPerSlide = 3;

  if (!certificates || certificates.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          {t("certificates.title", "Certificates")}
        </h2>
        {certificates.length > itemsPerSlide && (
          <div className="flex items-center gap-2 sm:gap-4">
            <SliderButtonProfileProfile
              direction="prev"
              onClick={() =>
                setSlide(
                  currentSlide > 0
                    ? currentSlide - 1
                    : Math.ceil(certificates.length / itemsPerSlide) - 1,
                )
              }
            />
            <SliderButtonProfileProfile
              direction="next"
              onClick={() =>
                setSlide(
                  currentSlide <
                    Math.ceil(certificates.length / itemsPerSlide) - 1
                    ? currentSlide + 1
                    : 0,
                )
              }
            />
          </div>
        )}
      </div>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({
            length: Math.ceil(certificates.length / itemsPerSlide),
          }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates
                  .slice(
                    slideIndex * itemsPerSlide,
                    (slideIndex + 1) * itemsPerSlide,
                  )
                  .map((cert) => (
                    <CertificateCard key={cert.id} certificate={cert} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="mt-8 text-right">
        <button className="text-blue-500 hover:text-blue-600 font-semibold underline">
          {t("certificates.view_all", "View all certificates")}
        </button>
      </div> */}
    </div>
  );
};

const CertificateCard = ({ certificate }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all border-2 border-purple-200 hover:border-purple-400">
      {/* Certificate Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 p-2 rounded-full">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-purple-700 uppercase">
            {t("certificates.certified", "Certified")}
          </span>
        </div>
      </div>

      {/* Course Image */}
      {certificate.Image && (
        <img
          src={import.meta.env.VITE_API_URL + certificate.Image}
          className="w-full h-40 sm:h-48 object-cover rounded-xl mb-4"
          alt={certificate.title}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}

      {/* Certificate Info */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {certificate.title}
      </h3>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="truncate">
            {t("certificates.issued_by", "Issued by")}: {certificate.issuer}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{new Date(certificate.issueDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* View Certificate Button */}
      <a
        href={certificate.officialUrl || `/certificate/${certificate.id}`}
        target={certificate.officialUrl ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        <span>{t("certificates.view_official", "View Certificate")}</span>
      </a>
    </div>
  );
};

export default CertificatesProfileSection;
