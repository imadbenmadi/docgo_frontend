import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { useAppContext } from "../AppContext";
import {
  favoritesService,
  getFavoritesFromStorage,
  addToLocalFavorites,
  removeFromLocalFavorites,
  isInLocalFavorites,
} from "../services/favoritesService";
import { getApiErrorMessage } from "../utils/apiErrorTranslate";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { user } = useAppContext();
  const [favorites, setFavorites] = useState({ courses: [], programs: [] });
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Authenticated user - fetch from server
        const payload = await favoritesService.getFavorites();
        const serverFavorites = payload?.data?.favorites || [];

        // Process server favorites into our format
        const processedFavorites = {
          courses: serverFavorites
            .filter((fav) => fav.type === "course")
            .map((fav) => ({
              ...fav.Course,
              type: "course",
              favoriteId: fav.id,
              addedAt: fav.createdAt,
            })),
          programs: serverFavorites
            .filter((fav) => fav.type === "program")
            .map((fav) => ({
              ...fav.Program,
              type: "program",
              favoriteId: fav.id,
              addedAt: fav.createdAt,
            })),
        };

        setFavorites(processedFavorites);
      } else {
        // Guest user - get from local storage
        const localFavorites = getFavoritesFromStorage();
        setFavorites(localFavorites);
      }
    } catch (error) {
      // Fallback to local storage on error
      if (!user) {
        const localFavorites = getFavoritesFromStorage();
        setFavorites(localFavorites);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load favorites on mount and when user changes
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addToFavorites = async (item, type) => {
    try {
      if (user) {
        // Authenticated user - save to server
        const courseId = type === "course" ? item.id : null;
        const programId = type === "program" ? item.id : null;

        await favoritesService.addToFavorites(courseId, programId, type);

        // Update local state
        setFavorites((prev) => ({
          ...prev,
          [type === "course" ? "courses" : "programs"]: [
            ...prev[type === "course" ? "courses" : "programs"],
            {
              ...item,
              type,
              addedAt: new Date().toISOString(),
            },
          ],
        }));
      } else {
        // Guest user - save to local storage
        const updatedFavorites = addToLocalFavorites(item, type);
        setFavorites(updatedFavorites);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error) || "Failed to add to favorites",
      };
    }
  };

  const removeFromFavorites = async (id, type) => {
    try {
      if (user) {
        // Authenticated user - remove from server
        const courseId = type === "course" ? id : null;
        const programId = type === "program" ? id : null;

        await favoritesService.removeFromFavorites(courseId, programId, type);

        // Update local state
        setFavorites((prev) => ({
          ...prev,
          [type === "course" ? "courses" : "programs"]: prev[
            type === "course" ? "courses" : "programs"
          ].filter((item) => item.id !== id),
        }));
      } else {
        // Guest user - remove from local storage
        const updatedFavorites = removeFromLocalFavorites(id, type);
        setFavorites(updatedFavorites);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error) || "Failed to remove from favorites",
      };
    }
  };

  const isFavorite = (id, type) => {
    if (user) {
      // For authenticated users, check the current state
      const key = type === "course" ? "courses" : "programs";
      return favorites[key].some((item) => item.id === id);
    } else {
      // For guest users, check local storage
      return isInLocalFavorites(id, type);
    }
  };

  const getFavoriteCount = (type = null) => {
    if (type) {
      const key = type === "course" ? "courses" : "programs";
      return favorites[key].length;
    }
    return favorites.courses.length + favorites.programs.length;
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteCount,
    loadFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
