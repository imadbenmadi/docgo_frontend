import api from "./apiClient";

/**
 * Saved items, for all four products.
 *
 * Everything here used to be shaped as "course or programme": two id
 * arguments, one of which was always null, and a local-storage bag with two
 * keys. A CV service or an internship had nowhere to go, so the heart on those
 * pages could not work however it was wired up.
 *
 * A favourite is now a type and an id, the same way an order is. One shape for
 * four products, and adding a fifth would not touch this file.
 */

const FAVORITES_STORAGE_KEY = "healthpathglobal_favorites";

/** The four, in the order the tabs show them. */
export const FAVORITE_TYPES = ["course", "program", "cv", "internship"];

const emptyBag = () => ({ course: [], program: [], cv: [], internship: [] });

/**
 * Read the guest bag, migrating the old two-key shape on the way.
 *
 * Someone who saved a course before this change has `{courses, programs}` in
 * their browser. Dropping it would silently empty their list, so it is read
 * once and rewritten in the new shape.
 */
export const getFavoritesFromStorage = () => {
  const bag = emptyBag();
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return bag;
    const saved = JSON.parse(raw);

    for (const type of FAVORITE_TYPES) {
      if (Array.isArray(saved?.[type])) bag[type] = saved[type];
    }
    // The old spelling.
    if (Array.isArray(saved?.courses)) {
      bag.course = [...bag.course, ...saved.courses];
    }
    if (Array.isArray(saved?.programs)) {
      bag.program = [...bag.program, ...saved.programs];
    }
    return bag;
  } catch {
    return bag;
  }
};

export const saveFavoritesToStorage = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // A browser with storage blocked still works; the list just does not
    // survive a reload, which is better than throwing on every heart click.
  }
};

const idOf = (item) => item?.id ?? item?.ID ?? item?.Id ?? null;

export const addToLocalFavorites = (item, type) => {
  const favorites = getFavoritesFromStorage();
  const id = idOf(item);
  if (!id || !FAVORITE_TYPES.includes(type)) return favorites;

  if (!favorites[type].some((f) => String(idOf(f)) === String(id))) {
    favorites[type] = [
      ...favorites[type],
      { ...item, type, addedAt: new Date().toISOString() },
    ];
    saveFavoritesToStorage(favorites);
  }
  return favorites;
};

export const removeFromLocalFavorites = (id, type) => {
  const favorites = getFavoritesFromStorage();
  if (!FAVORITE_TYPES.includes(type)) return favorites;
  favorites[type] = favorites[type].filter(
    (f) => String(idOf(f)) !== String(id),
  );
  saveFavoritesToStorage(favorites);
  return favorites;
};

export const isInLocalFavorites = (id, type) => {
  const favorites = getFavoritesFromStorage();
  if (!FAVORITE_TYPES.includes(type)) return false;
  return favorites[type].some((f) => String(idOf(f)) === String(id));
};

// ---------------------------------------------------------------------------

export const favoritesService = {
  addToFavorites: async (itemId, type) => {
    const { data } = await api.post("/Favorites/add", { type, itemId });
    return data;
  },

  removeFromFavorites: async (itemId, type) => {
    // In the query string, not a body: a DELETE body is allowed but not every
    // proxy forwards one, and this has to survive shared hosting.
    const { data } = await api.delete("/Favorites/remove", {
      params: { type, itemId },
    });
    return data;
  },

  getFavorites: async (type = null) => {
    const { data } = await api.get("/Favorites", {
      params: type ? { type } : {},
    });
    return data;
  },

  checkFavoriteStatus: async (itemId, type) => {
    const { data } = await api.get("/Favorites/status", {
      params: { type, itemId },
    });
    return data;
  },
};
