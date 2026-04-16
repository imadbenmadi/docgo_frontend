import apiClient from "../services/apiClient";

// Client-side Programs API (for public access)
export const clientProgramsAPI = {
  // Get all programs for clients (public)
  getPrograms: async (params = {}) => {
    try {
      const response = await apiClient.get("/Programs", { params });

      // Server now returns programs directly
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single program details for clients
  getProgramDetails: async (programId) => {
    try {
      const response = await apiClient.get(`/Programs/${programId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get featured programs
  getFeaturedPrograms: async (limit = 6) => {
    try {
      const response = await apiClient.get("/Programs/featured", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Get available program locations
  getProgramLocations: async () => {
    try {
      const response = await apiClient.get("/programs/locations");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get available countries
  getCountries: async () => {
    try {
      const response = await apiClient.get("/Programs/filter/countries");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specialties for a country
  getSpecialties: async (country) => {
    try {
      const response = await apiClient.get("/Programs/filter/specialties", {
        params: { country },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get types for a specialty
  getTypes: async (specialty) => {
    try {
      const response = await apiClient.get("/Programs/filter/types", {
        params: { specialty },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all register options (countries, specialties, types) in one call
  getRegisterOptions: async () => {
    try {
      const response = await apiClient.get("/public/register-options");
      if (response.data?.options) {
        const opt = response.data.options;
        return {
          countries: opt.programCountries || [],
          specialtiesPerCountry: opt.programSpecialtiesPerCountry || {},
          typesPerCountrySpecialty: opt.programTypesPerCountrySpecialty || {},
        };
      }
      return {
        countries: [],
        specialtiesPerCountry: {},
        typesPerCountrySpecialty: {},
      };
    } catch (error) {
      throw error;
    }
  },

  // Get program categories and universities
  getProgramCategories: async () => {
    try {
      const response = await apiClient.get("/Programs/categories");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search programs with filters
  searchPrograms: async (params = {}) => {
    try {
      const response = await apiClient.get("/Programs/search", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ...existing code...

  // Alias methods for consistency
  getProgram: async (programId) => {
    return clientProgramsAPI.getProgramDetails(programId);
  },
};

export default clientProgramsAPI;
