// import { motion, AnimatePresence } from "framer-motion";
// import { useState } from "react";

// const AnimatedSelect = ({ options, placeholder }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedOption, setSelectedOption] = useState("");

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const AnimatedSelect = ({
    options,
    placeholder,
    onChange,
    value,
    maxHeight = "250px", // Default max height
    className = "",
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const selectRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle selection
    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="relative w-full" ref={selectRef}>
            <div
                className="w-full p-3 border rounded-lg cursor-pointer flex justify-between items-center bg-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? "text-black" : "text-gray-500"}>
                    {value || placeholder}
                </span>
                <svg
                    className={`w-5 h-5 transition-transform ${
                        isOpen ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                    <input
                        type="text"
                        className="w-full p-2 border-b"
                        placeholder={t("common.search")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div
                        className={`overflow-auto ${className}`}
                        style={{ maxHeight: maxHeight }}
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSelect(option)}
                                >
                                    {option}
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-gray-500">
                                {t("common.noOptionsFound")}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimatedSelect;
