import { createContext, useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "../AppContext";
import {
  FAVORITE_TYPES,
  addToLocalFavorites,
  favoritesService,
  getFavoritesFromStorage,
  isInLocalFavorites,
  removeFromLocalFavorites,
} from "../services/favoritesService";

/**
 * Saved items, for all four products.
 *
 * The state used to be `{ courses: [], programs: [] }`, so a CV service or an
 * internship had nowhere to live and the heart on those pages could not work.
 * It is now keyed by product type, which means the four are handled by the
 * same three lines rather than by a branch each.
 */

const FavoritesContext = createContext(null);

const emptyBag = () => ({ course: [], program: [], cv: [], internship: [] });

export const FavoritesProvider = ({ children }) => {
  const { user } = useAppContext();
  const [favorites, setFavorites] = useState(emptyBag);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) {
        setFavorites(getFavoritesFromStorage());
        return;
      }

      const payload = await favoritesService.getFavorites();
      const rows = payload?.data?.favorites || [];
      const bag = emptyBag();

      for (const row of rows) {
        if (!FAVORITE_TYPES.includes(row.type)) continue;
        // `item` is the server's one shape for all four products, so a card
        // does not have to know which table the row came from.
        bag[row.type].push({
          ...(row.item || {}),
          id: row.itemId ?? row.item?.id,
          type: row.type,
          path: row.path,
          favoriteId: row.id,
          addedAt: row.savedAt ?? row.createdAt,
        });
      }

      setFavorites(bag);
    } catch {
      // A failed fetch should not empty the screen for a guest who has a
      // perfectly good local list.
      if (!user) setFavorites(getFavoritesFromStorage());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addToFavorites = async (item, type) => {
    if (!FAVORITE_TYPES.includes(type)) {
      return { success: false, error: `Unknown type ${type}` };
    }
    const id = item?.id ?? item?.ID ?? item?.Id;
    if (!id) return { success: false, error: "Missing item id" };

    try {
      if (user) {
        await favoritesService.addToFavorites(id, type);
        setFavorites((prev) => ({
          ...prev,
          [type]: prev[type].some((f) => String(f.id) === String(id))
            ? prev[type]
            : [...prev[type], { ...item, id, type }],
        }));
      } else {
        setFavorites(addToLocalFavorites(item, type));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || "Failed" };
    }
  };

  const removeFromFavorites = async (id, type) => {
    if (!FAVORITE_TYPES.includes(type)) {
      return { success: false, error: `Unknown type ${type}` };
    }
    try {
      if (user) {
        await favoritesService.removeFromFavorites(id, type);
        setFavorites((prev) => ({
          ...prev,
          [type]: prev[type].filter((f) => String(f.id) !== String(id)),
        }));
      } else {
        setFavorites(removeFromLocalFavorites(id, type));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || "Failed" };
    }
  };

  const isFavorite = (id, type) => {
    if (!FAVORITE_TYPES.includes(type) || !id) return false;
    if (!user) return isInLocalFavorites(id, type);
    // Compared as strings: a course id is a UUID and an internship id is a
    // number, and === would quietly say no for the second.
    return favorites[type].some((f) => String(f.id) === String(id));
  };

  const getFavoriteCount = (type = null) => {
    if (type) return favorites[type]?.length || 0;
    return FAVORITE_TYPES.reduce((n, t) => n + (favorites[t]?.length || 0), 0);
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

// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside a FavoritesProvider");
  }
  return ctx;
};
