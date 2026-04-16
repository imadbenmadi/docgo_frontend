import api from "./apiClient";

// Local storage keys
const FAVORITES_STORAGE_KEY = "healthpathglobal_favorites";

// Local storage helpers for guest users
export const getFavoritesFromStorage = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : { courses: [], programs: [] };
  } catch (error) {
    return { courses: [], programs: [] };
  }
};

export const saveFavoritesToStorage = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {}
};

export const addToLocalFavorites = (item, type) => {
  const favorites = getFavoritesFromStorage();
  const key = type === "course" ? "courses" : "programs";

  // Handle different ID field names
  const itemId = item.id || item.ID || item.Id;

  if (!itemId) {
    return favorites;
  }

  // Check if already exists
  const exists = favorites[key].some((fav) => {
    const favId = fav.id || fav.ID || fav.Id;
    return favId === itemId;
  });

  if (!exists) {
    favorites[key].push({
      id: itemId, // Normalize to lowercase 'id'
      type,
      addedAt: new Date().toISOString(),
      ...item,
    });
    saveFavoritesToStorage(favorites);
  }

  return favorites;
};

export const removeFromLocalFavorites = (id, type) => {
  const favorites = getFavoritesFromStorage();
  const key = type === "course" ? "courses" : "programs";

  favorites[key] = favorites[key].filter((fav) => {
    const favId = fav.id || fav.ID || fav.Id;
    return favId !== id;
  });
  saveFavoritesToStorage(favorites);

  return favorites;
};

export const isInLocalFavorites = (id, type) => {
  const favorites = getFavoritesFromStorage();
  const key = type === "course" ? "courses" : "programs";
  return favorites[key].some((fav) => {
    const favId = fav.id || fav.ID || fav.Id;
    return favId === id;
  });
};

// API calls for authenticated users
export const favoritesService = {
  // Add to favorites
  addToFavorites: async (courseId, programId, type) => {
    try {
      const response = await api.post("/Favorites/add", {
        ...(type === "course" ? { courseId } : { programId }),
        type,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Remove from favorites
  removeFromFavorites: async (courseId, programId, type) => {
    try {
      const response = await api.delete("/Favorites/remove", {
        data: {
          ...(type === "course" ? { courseId } : { programId }),
          type,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user favorites
  getFavorites: async (type = null) => {
    try {
      const params = type ? { type } : {};
      const response = await api.get("/Favorites", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check favorite status
  checkFavoriteStatus: async (courseId, programId, type) => {
    try {
      const params = {
        type,
        ...(type === "course" ? { courseId } : { programId }),
      };
      const response = await api.get("/Favorites/status", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
