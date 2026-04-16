// import { motion, AnimatePresence } from "framer-motion";
// import { useState } from "react";

// const AnimatedSelect = ({ options, placeholder }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedOption, setSelectedOption] = useState("");

//   return (
//     <div className="relative w-full">
//       <motion.button
//         className="w-full p-3 border rounded-lg bg-white text-left flex justify-between items-center"
//         onClick={() => setIsOpen(!isOpen)}
//         whileTap={{ scale: 0.995 }}
//       >
//         <span
//           className={`${!selectedOption ? "text-gray-400" : "text-gray-900"}`}
//         >
//           {selectedOption || placeholder}
//         </span>
//         <motion.svg
//           animate={{ rotate: isOpen ? 180 : 0 }}
//           className="w-4 h-4 text-gray-500"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M19 9l-7 7-7-7"
//           />
//         </motion.svg>
//       </motion.button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.2 }}
//             className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg"
//           >
//             {options.map((option, index) => (
//               <motion.button
//                 key={option}
//                 className="w-full p-3 text-left hover:bg-blue-50 transition-colors"
//                 whileHover={{ x: 4 }}
//                 onClick={() => {
//                   setSelectedOption(option);
//                   setIsOpen(false);
//                 }}
//               >
//                 {option}
//               </motion.button>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };
// export default AnimatedSelect;
import React, { useState, useRef, useEffect } from "react";

const AnimatedSelect = ({
    options,
    placeholder,
    onChange,
    value,
    maxHeight = "250px", // Default max height
    className = "",
}) => {
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
                        placeholder="Search..."
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
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimatedSelect;
