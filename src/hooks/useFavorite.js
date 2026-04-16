import { useCallback, useMemo, useState } from "react";
import { useFavorites as useFavoritesContext } from "../context/FavoritesContext";

export const useFavorite = (itemId, itemType = "course") => {
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoritesContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isFavorited = useMemo(() => {
    if (!itemId) return false;
    return isFavorite(itemId, itemType);
  }, [itemId, itemType, isFavorite]);

  const toggleFavorite = useCallback(
    async (item = null) => {
      if (!itemId || loading) return;

      setLoading(true);
      setError(null);

      try {
        if (isFavorited) {
          await removeFromFavorites(itemId, itemType);
        } else {
          if (!item) {
            throw new Error("Missing item data");
          }
          await addToFavorites(item, itemType);
        }
      } catch (err) {
        setError("Failed to update favorite");
      } finally {
        setLoading(false);
      }
    },
    [
      addToFavorites,
      removeFromFavorites,
      itemId,
      itemType,
      isFavorited,
      loading,
    ],
  );

  return {
    isFavorited,
    loading,
    error,
    toggleFavorite,
  };
};

export const useFavorites = () => {
  const ctx = useFavoritesContext();
  const totalCount = ctx.getFavoriteCount ? ctx.getFavoriteCount() : 0;

  return {
    ...ctx,
    totalCount,
  };
};
