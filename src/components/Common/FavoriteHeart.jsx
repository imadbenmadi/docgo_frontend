import PropTypes from "prop-types";
import { Heart, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFavorite } from "../../hooks/useFavorite";

/**
 * Save this, whatever "this" is.
 *
 * Courses and programmes each grew their own heart, wired by hand into the
 * card and the hero. CV services and internships got neither - partly because
 * the store could not hold them, and partly because there was no piece to drop
 * in. This is that piece: it takes a type and the item, and works the same on
 * all four.
 */
const FavoriteHeart = ({
  item,
  type,
  className = "",
  size = "h-5 w-5",
  withLabel = false,
}) => {
  const { t } = useTranslation();
  const id = item?.id ?? item?.ID ?? item?.Id;
  const { isFavorited, loading, toggleFavorite } = useFavorite(id, type);

  if (!id) return null;

  const label = isFavorited
    ? t("favorites.remove", "Retirer des favoris")
    : t("favorites.add", "Ajouter aux favoris");

  return (
    <button
      type="button"
      onClick={(e) => {
        // These sit on cards that are themselves links. Without this, saving
        // something navigates away from the page you wanted to stay on.
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(item);
      }}
      disabled={loading}
      aria-label={label}
      title={label}
      aria-pressed={isFavorited}
      className={`inline-flex items-center gap-2 rounded-full p-2 transition disabled:opacity-60 ${
        isFavorited
          ? "text-rose-600 hover:bg-rose-50"
          : "text-gray-400 hover:bg-gray-100 hover:text-rose-500"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className={`${size} animate-spin`} />
      ) : (
        <Heart className={size} fill={isFavorited ? "currentColor" : "none"} />
      )}
      {withLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
};

FavoriteHeart.propTypes = {
  item: PropTypes.object,
  type: PropTypes.oneOf(["course", "program", "cv", "internship"]).isRequired,
  className: PropTypes.string,
  size: PropTypes.string,
  withLabel: PropTypes.bool,
};

export default FavoriteHeart;
