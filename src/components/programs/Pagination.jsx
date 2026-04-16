import React from "react";
import { useTranslation } from "react-i18next";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useTranslation();

    if (totalPages <= 1) return null;

    const generatePageNumbers = () => {
        const pages = [];
        const showPages = 5; // Number of page buttons to show

        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(totalPages, startPage + showPages - 1);

        // Adjust startPage if we're near the end
        if (endPage - startPage + 1 < showPages) {
            startPage = Math.max(1, endPage - showPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pages = generatePageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {/* First Page */}
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl transition-colors ${
                    currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title={t("First Page", "First Page") || "First Page"}
            >
                <ChevronsLeft className="w-5 h-5" />
            </button>

            {/* Previous Page */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl transition-colors ${
                    currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title={t("Previous Page", "Previous Page") || "Previous Page"}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {/* Show ... if there are pages before the visible range */}
                {pages[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="px-3 py-2 text-sm rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            1
                        </button>
                        {pages[0] > 2 && (
                            <span className="px-2 text-gray-400">...</span>
                        )}
                    </>
                )}

                {/* Visible page numbers */}
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                            page === currentPage
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Show ... if there are pages after the visible range */}
                {pages[pages.length - 1] < totalPages && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="px-3 py-2 text-sm rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
            </div>

            {/* Next Page */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl transition-colors ${
                    currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title={t("Next Page", "Next Page") || "Next Page"}
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Last Page */}
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl transition-colors ${
                    currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title={t("Last Page", "Last Page") || "Last Page"}
            >
                <ChevronsRight className="w-5 h-5" />
            </button>

            {/* Page Info */}
            <div className="ml-4 text-sm text-gray-600">
                {t("Page", "Page") || "Page"} {currentPage} {t("of", "of") || "of"}{" "}
                {totalPages}
            </div>
        </div>
    );
};

export default Pagination;
