import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

/**
 * FeaturedCountriesSection - Displays featured countries with flag images
 * Uses flagcdn.com CDN for high-quality flag images (256x192)
 *
 * Props:
 *   title: Section title
 *   subtitle: Section subtitle
 *   countries: Array of country objects [{ code: "fr", name_en: "France", ... }]
 */
export default function FeaturedCountriesSection({
  title,
  subtitle,
  countries = [],
}) {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  const getCountryName = (country) => {
    const nameKey = `name_${lang}`;
    return country[nameKey] || country.name_en || country.code;
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {countries.length > 0 ? (
            countries.map((country) => (
              <div
                key={country.code}
                className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-all group"
              >
                {/* Flag Image */}
                <div className="w-20 h-16 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow bg-gray-100 flex items-center justify-center">
                  <img
                    src={`https://flagcdn.com/256x192/${country.code.toLowerCase()}.png`}
                    alt={getCountryName(country)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 192'%3E%3Crect fill='%23e5e7eb' width='256' height='192'/%3E%3Ctext x='128' y='96' text-anchor='middle' dy='.3em' font-size='48' fill='%23999' font-weight='bold'%3E${country.code.toUpperCase()}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </div>

                {/* Country Name */}
                <p className="text-sm font-semibold text-gray-900 text-center line-clamp-2">
                  {getCountryName(country)}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No countries featured yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

FeaturedCountriesSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  countries: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name_en: PropTypes.string,
      name_fr: PropTypes.string,
      name_ar: PropTypes.string,
    }),
  ),
};

FeaturedCountriesSection.defaultProps = {
  countries: [],
};
