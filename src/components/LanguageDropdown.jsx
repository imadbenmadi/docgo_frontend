import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { MdLanguage } from "react-icons/md";

const LanguageDropdown = ({ compact = false, menuClassName = "" }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(
        i18n.language || "fr",
    );
    const dropdownRef = useRef(null);

    const languages = [
        { code: "fr", name: "Français" },
        { code: "en", name: "English" },
        { code: "ar", name: "عربي" },
    ];

    useEffect(() => {
        setSelectedLanguage(i18n.language || "fr");
    }, [i18n]);

    useEffect(() => {
        document.documentElement.dir = i18n.dir();
        document.documentElement.lang = i18n.language;
        document.title = i18n.t("appTitle", "healthpathglobal");

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [i18n]);

    const handleChangeLanguage = (code) => {
        i18n.changeLanguage(code);
        setSelectedLanguage(code);
        setIsOpen(false);
    };

    const selectedLabel = compact
        ? selectedLanguage.toUpperCase()
        : languages.find((lang) => lang.code === selectedLanguage)?.name;

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    compact
                        ? "px-2.5 py-2 text-xs font-semibold"
                        : "px-3 py-2"
                }`}
            >
                <MdLanguage className={compact ? "text-lg" : "text-xl"} />
                <span className={compact ? "text-xs font-semibold" : "text-sm font-medium"}>
                    {selectedLabel || "FR"}
                </span>
            </button>

            {isOpen && (
                <ul
                    className={`absolute left-0 mt-2 w-32 overflow-hidden rounded-md border bg-white shadow-lg z-20 ${menuClassName}`}
                >
                    {languages.map((lang) => (
                        <li
                            key={lang.code}
                            onClick={() => handleChangeLanguage(lang.code)}
                            className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center hover:bg-gray-100 ${
                                selectedLanguage === lang.code
                                    ? "font-semibold text-blue-600"
                                    : ""
                            }`}
                        >
                            {lang.name || "Français"}
                            {selectedLanguage === lang.code && (
                                <span className="text-green-500 text-sm">
                                    
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

LanguageDropdown.propTypes = {
    compact: PropTypes.bool,
    menuClassName: PropTypes.string,
};

export default LanguageDropdown;
