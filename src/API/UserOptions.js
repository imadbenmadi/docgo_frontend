import apiClient from "../utils/apiClient";

/**
 * Fetch admin-managed user options:
 * - User origin data (userOriginCountries, userSpecialties)
 * - Professional/Academic status options
 * - Program data (countries, specialties per country, types per specialty)
 * - Country flags for display
 */
export const fetchUserOptions = async () => {
  try {
    const response = await apiClient.get("/public/register-options");
    const data = response.data?.options || response.data || {};

    return {
      // User Profile Origin (where users are FROM) - EMPTY by default, admin manages
      userOriginCountries: data.userOriginCountries || [],
      userSpecialties: data.userSpecialties || [],

      // Professional/Academic Status - EMPTY by default, admin manages
      professionalStatuses: data.professionalStatuses || [],
      academicStatuses: data.academicStatuses || [],

      // Program Management
      programCountries: data.programCountries || [],
      programSpecialtiesPerCountry: data.programSpecialtiesPerCountry || {},
      programTypesPerCountrySpecialty:
        data.programTypesPerCountrySpecialty || {},
      countryFlags: data.countryFlags || {},
    };
  } catch {
    // Return empty defaults - admin controls all options
    return {
      userOriginCountries: [],
      userSpecialties: [],
      professionalStatuses: [],
      academicStatuses: [],
      programCountries: [],
      programSpecialtiesPerCountry: {},
      programTypesPerCountrySpecialty: {},
      countryFlags: {},
    };
  }
};

export default { fetchUserOptions };
