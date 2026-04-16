import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch, FiLoader, FiFilter, FiX } from "react-icons/fi";
import PropTypes from "prop-types";

export function SearchFilters({ onFiltersChange }) {
    const { t } = useTranslation();

    // Local state for filters before applying
    const [localFilters, setLocalFilters] = useState({
        search: "",
        category: "",
        specialty: "",
        difficulty: "",
        price: "",
        certificate: "",
        date: "latest",
        sortBy: "createdAt",
        order: "DESC",
    });

    // Applied filters that are actually sent to API
    const [appliedFilters, setAppliedFilters] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Use ref to avoid dependency issues
    const onFiltersChangeRef = useRef(onFiltersChange);
    onFiltersChangeRef.current = onFiltersChange;

    // Debounce search
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(localFilters.search);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [localFilters.search]);

    // Auto-apply search changes (debounced)
    useEffect(() => {
        if (debouncedQuery !== appliedFilters.search) {
            const newFilters = { ...localFilters, search: debouncedQuery };
            applyFilters(newFilters);
        }
    }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    const applyFilters = useCallback(
        (filters = localFilters) => {
            setIsSearching(true);
            setAppliedFilters(filters);

            if (onFiltersChangeRef.current) {
                onFiltersChangeRef.current({
                    ...filters,
                    page: 1, // Reset to first page when filters change
                });
            }

            // Reset searching state after a delay
            setTimeout(() => setIsSearching(false), 1000);
        },
        [localFilters]
    );

    const clearFilters = () => {
        const clearedFilters = {
            search: "",
            category: "",
            specialty: "",
            difficulty: "",
            price: "",
            certificate: "",
            date: "latest",
            sortBy: "createdAt",
            order: "DESC",
        };
        setLocalFilters(clearedFilters);
        applyFilters(clearedFilters);
    };

    const handleLocalFilterChange = (key, value) => {
        setLocalFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const categoryOptions = [
        { value: "", label: t("Toutes les catégories", "Toutes les catégories") || "All Categories" },
        { value: "Programming", label: t("Programming", "Programming") || "Programming" },
        { value: "Design", label: t("Design", "Design") || "Design" },
        { value: "Business", label: t("Business", "Business") || "Business" },
        { value: "Marketing", label: t("Marketing", "Marketing") || "Marketing" },
        { value: "Data Science", label: t("Data Science", "Data Science") || "Data Science" },
        { value: "Languages", label: t("Languages", "Languages") || "Languages" },
    ];

    const specialtyOptions = [
        { value: "", label: t("Toutes les spécialités", "Toutes les spécialités") || "All Specialties" },
        {
            value: "Web Development",
            label: t("Web Development", "Web Development") || "Web Development",
        },
        {
            value: "Mobile Development",
            label: t("Mobile Development", "Mobile Development") || "Mobile Development",
        },
        { value: "Data Science", label: t("Data Science", "Data Science") || "Data Science" },
        {
            value: "AI & Machine Learning",
            label: t("AI & Machine Learning", "AI & Machine Learning") || "AI & Machine Learning",
        },
        { value: "UI/UX Design", label: t("UI/UX Design", "UI/UX Design") || "UI/UX Design" },
        {
            value: "Digital Marketing",
            label: t("Digital Marketing", "Digital Marketing") || "Digital Marketing",
        },
        {
            value: "Cybersecurity",
            label: t("Cybersecurity", "Cybersecurity") || "Cybersecurity",
        },
        {
            value: "Cloud Computing",
            label: t("Cloud Computing", "Cloud Computing") || "Cloud Computing",
        },
    ];

    const difficultyOptions = [
        { value: "", label: t("Tous les niveaux", "Tous les niveaux") || "All Levels" },
        { value: "beginner", label: t("Débutant", "Débutant") || "Beginner" },
        { value: "intermediate", label: t("Intermédiaire", "Intermédiaire") || "Intermediate" },
        { value: "advanced", label: t("Avancé", "Avancé") || "Advanced" },
        { value: "expert", label: t("Expert", "Expert") || "Expert" },
    ];

    const priceOptions = [
        { value: "", label: t("Tous les prix", "Tous les prix") || "All Prices" },
        { value: "free", label: t("Gratuit", "Free") || "Free" },
        { value: "paid", label: t("Payant", "Paid") || "Paid" },
    ];

    const certificateOptions = [
        {
            value: "",
            label:
                t("Avec ou sans certificat", "Avec ou sans certificat") || "With or without certificate",
        },
        { value: "with", label: t("Avec certificat", "Avec certificat") || "With certificate" },
        {
            value: "without",
            label: t("Sans certificat", "Sans certificat") || "Without certificate",
        },
    ];

    const sortOptions = [
        {
            value: "latest",
            label: t("Plus récent", "Plus récent") || "Latest",
            sortBy: "createdAt",
            order: "DESC",
        },
        {
            value: "oldest",
            label: t("Plus ancien", "Plus ancien") || "Oldest",
            sortBy: "createdAt",
            order: "ASC",
        },
        {
            value: "popular",
            label: t("Plus populaire", "Plus populaire") || "Most Popular",
            sortBy: "enrollments",
            order: "DESC",
        },
        {
            value: "rating",
            label: t("Mieux noté", "Mieux noté") || "Highest Rated",
            sortBy: "rating",
            order: "DESC",
        },
        {
            value: "title_az",
            label: t("Titre A-Z", "Titre A Z") || "Title A-Z",
            sortBy: "title",
            order: "ASC",
        },
        {
            value: "title_za",
            label: t("Titre Z-A", "Titre Z A") || "Title Z-A",
            sortBy: "title",
            order: "DESC",
        },
    ];

    const handleInputChange = (e) => {
        handleLocalFilterChange("search", e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            applyFilters();
        }
    };

    const handleSortChange = (sortValue) => {
        const sortOption = sortOptions.find((opt) => opt.value === sortValue);
        if (sortOption) {
            const newFilters = {
                ...localFilters,
                date: sortValue,
                sortBy: sortOption.sortBy,
                order: sortOption.order,
            };
            setLocalFilters(newFilters);
            applyFilters(newFilters);
        }
    };

    return (
        <section className="flex flex-col gap-4 mx-auto max-w-7xl p-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full sm:min-w-96">
                    <div
                        className={`relative flex items-center px-4 py-3 bg-white rounded-lg border border-solid shadow-md transition-all duration-200 ${
                            isSearching
                                ? "border-blue-300 shadow-lg"
                                : "border-gray-200"
                        }`}
                    >
                        {isSearching ? (
                            <FiLoader className="w-5 h-5 text-blue-500 mr-3 animate-spin" />
                        ) : (
                            <FiSearch className="w-5 h-5 text-gray-500 mr-3" />
                        )}
                        <input
                            type="text"
                            placeholder={
                                t("RechercherUnCours", "Search for a course...") ||
                                "Search for courses..."
                            }
                            value={localFilters.search}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <FiFilter className="w-4 h-4" />
                    {t("Filtres", "Filtres") || "Filters"}
                </button>

                {/* Apply/Clear Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => applyFilters()}
                        disabled={isSearching}
                        className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t("Appliquer", "Appliquer") || "Apply"}
                    </button>
                    <button
                        onClick={clearFilters}
                        disabled={isSearching}
                        className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("Catégorie", "Catégorie") || "Category"}
                            </label>
                            <select
                                value={localFilters.category}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "category",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categoryOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Specialty Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("Spécialité", "Spécialité") || "Specialty"}
                            </label>
                            <select
                                value={localFilters.specialty}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "specialty",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {specialtyOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("Niveau", "Niveau") || "Difficulty"}
                            </label>
                            <select
                                value={localFilters.difficulty}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "difficulty",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {difficultyOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("Prix", "Prix") || "Price"}
                            </label>
                            <select
                                value={localFilters.price}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "price",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {priceOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Certificate Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("Certificat", "Certificat") || "Certificate"}
                            </label>
                            <select
                                value={localFilters.certificate}
                                onChange={(e) =>
                                    handleLocalFilterChange(
                                        "certificate",
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {certificateOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("Trier par", "Trier par") || "Sort by"}
                            </label>
                            <select
                                value={localFilters.date}
                                onChange={(e) =>
                                    handleSortChange(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {sortOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

           
        </section>
    );
}

SearchFilters.propTypes = {
    onFiltersChange: PropTypes.func.isRequired,
};
