import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

/**
 * One value out of a long list, with a search box.
 *
 * The study domains are a list of fifty the admin keeps, and a native select
 * makes somebody scroll it with no way to type. This is the same shape as the
 * country selector beside it, so the two fields behave alike.
 */

const fold = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "",
  label,
  renderOption,
  disabled = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const display = (option) =>
    renderOption ? renderOption(option) : String(option);

  const shown = useMemo(() => {
    if (!query) return options;
    return options.filter(
      (o) => fold(o).includes(fold(query)) || fold(display(o)).includes(fold(query)),
    );
    // display is stable enough for this list; options and query are what move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition-all hover:border-blue-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        <span className={value ? "" : "text-gray-400"}>
          {value ? display(value) : placeholder}
        </span>
        <span className="ml-2 text-gray-400">&#9662;</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.search", "Rechercher…")}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {!shown.length && (
                <p className="px-4 py-6 text-center text-sm text-gray-400">
                  {t("common.noMatch", "Aucun résultat.")}
                </p>
              )}
              {shown.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    close();
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                    option === value ? "bg-blue-50 font-medium" : ""
                  }`}
                >
                  {display(option)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

SearchableSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  renderOption: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default SearchableSelect;
