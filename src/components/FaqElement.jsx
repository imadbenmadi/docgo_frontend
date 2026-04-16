import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import PropTypes from "prop-types";
import RichTextDisplay from "./Common/RichTextDisplay";

const AnswerQuestion = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="p-3 md:p-3 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col gap-2">
                <motion.div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="font-semibold text-base md:text-lg text-gray-700 pr-4 flex-1">
                        <RichTextDisplay
                            content={question}
                            className="text-gray-700"
                        />
                    </div>
                    <motion.div
                        initial={false}
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isOpen ? (
                            <Minus className="w-5 h-5 md:w-6 md:h-6 text-gray-600 flex-shrink-0" />
                        ) : (
                            <Plus className="w-5 h-5 md:w-6 md:h-6 text-gray-600 flex-shrink-0" />
                        )}
                    </motion.div>
                </motion.div>

                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: "hidden" }}
                        >
                            <RichTextDisplay
                                content={answer}
                                className="text-sm md:text-base text-gray-600 font-light leading-normal"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

AnswerQuestion.propTypes = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
};

export default AnswerQuestion;
