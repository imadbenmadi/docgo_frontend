import { AnimatePresence, motion } from "framer-motion";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    X,
    XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * ValidationErrorPanel - frontend version
 * Floating slide-in panel that shows all form validation errors + file upload issues.
 */
export default function ValidationErrorPanel({
    errors = [],
    warnings = [],
    isVisible = false,
    onClose,
    title = "Please fix the following issues",
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [dismissed, setDismissed] = useState(new Set());
    const panelRef = useRef(null);

    const visibleErrors = errors.filter(
        (e) => !dismissed.has(e.field + e.message),
    );
    const visibleWarnings = warnings.filter(
        (w) => !dismissed.has(w.field + w.message),
    );
    const totalCount = visibleErrors.length + visibleWarnings.length;

    useEffect(() => {
        setDismissed(new Set());
        if (errors.length > 0 || warnings.length > 0) {
            setIsExpanded(true);
        }
    }, [errors.length, warnings.length]);

    const dismissItem = (e, item) => {
        e.stopPropagation();
        setDismissed((prev) => new Set([...prev, item.field + item.message]));
    };

    const scrollToField = (item) => {
        if (item.scrollToId) {
            const el = document.getElementById(item.scrollToId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.focus?.();
                el.classList.add("ring-2", "ring-red-400", "ring-offset-2");
                setTimeout(() => {
                    el.classList.remove(
                        "ring-2",
                        "ring-red-400",
                        "ring-offset-2",
                    );
                }, 2000);
            }
        }
    };

    // Group by section
    const grouped = {};
    [
        ...visibleErrors.map((e) => ({ ...e, type: "error" })),
        ...visibleWarnings.map((w) => ({ ...w, type: "warning" })),
    ].forEach((item) => {
        const sec = item.section || "General";
        if (!grouped[sec]) grouped[sec] = [];
        grouped[sec].push(item);
    });

    if (!isVisible && totalCount === 0) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={panelRef}
                    initial={{ x: 420, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 420, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-6 right-4 z-[9999] w-[360px] max-h-[80vh] flex flex-col"
                    style={{ maxWidth: "calc(100vw - 16px)" }}
                >
                    <div className="bg-white/97 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden flex flex-col max-h-[80vh]">
                        {/* Header */}
                        <div
                            className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none border-b ${
                                visibleErrors.length > 0
                                    ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-100"
                                    : "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100"
                            }`}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <div
                                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                                    visibleErrors.length > 0
                                        ? "bg-red-100 text-red-600"
                                        : "bg-yellow-100 text-yellow-600"
                                }`}
                            >
                                {visibleErrors.length > 0 ? (
                                    <XCircle className="w-5 h-5" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`font-semibold text-sm truncate ${
                                            visibleErrors.length > 0
                                                ? "text-red-800"
                                                : "text-yellow-800"
                                        }`}
                                    >
                                        {title}
                                    </span>
                                    <span
                                        className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                                            visibleErrors.length > 0
                                                ? "bg-red-600 text-white"
                                                : "bg-yellow-500 text-white"
                                        }`}
                                    >
                                        {totalCount}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {visibleErrors.length > 0
                                        ? `${visibleErrors.length} field${visibleErrors.length > 1 ? "s" : ""} need${visibleErrors.length === 1 ? "s" : ""} attention`
                                        : `${visibleWarnings.length} warning${visibleWarnings.length > 1 ? "s" : ""}`}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(!isExpanded);
                                    }}
                                    className="w-7 h-7 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClose?.();
                                    }}
                                    className="w-7 h-7 rounded-lg hover:bg-red-100 hover:text-red-600 text-gray-400 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22 }}
                                    className="overflow-y-auto custom-scrollbar"
                                >
                                    <div className="p-3 space-y-3">
                                        {Object.entries(grouped).map(
                                            ([section, items]) => (
                                                <div key={section}>
                                                    {Object.keys(grouped)
                                                        .length > 1 && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                                {section}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="space-y-1.5">
                                                        {items.map(
                                                            (item, idx) => (
                                                                <ErrorItem
                                                                    key={`${item.field}-${idx}`}
                                                                    item={item}
                                                                    onDismiss={
                                                                        dismissItem
                                                                    }
                                                                    onScrollTo={
                                                                        scrollToField
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                                        <p className="text-xs text-gray-400 text-center">
                                            Click an item to jump to that field
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ErrorItem({ item, onDismiss, onScrollTo }) {
    const isError = item.type === "error";
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.18 }}
            onClick={() => onScrollTo(item)}
            className={`group flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                isError
                    ? "bg-red-50 border-red-100 hover:bg-red-100/70 hover:border-red-200"
                    : "bg-yellow-50 border-yellow-100 hover:bg-yellow-100/70 hover:border-yellow-200"
            }`}
        >
            <div
                className={`flex-shrink-0 mt-0.5 ${isError ? "text-red-500" : "text-yellow-500"}`}
            >
                {isError ? (
                    <AlertCircle className="w-4 h-4" />
                ) : (
                    <AlertTriangle className="w-4 h-4" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                {item.field && (
                    <p
                        className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${isError ? "text-red-700" : "text-yellow-700"}`}
                    >
                        {item.field}
                    </p>
                )}
                <p
                    className={`text-sm leading-snug ${isError ? "text-red-800" : "text-yellow-800"}`}
                >
                    {item.message}
                </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1">
                {item.scrollToId && (
                    <span
                        className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium px-1.5 py-0.5 rounded ${
                            isError
                                ? "text-red-600 bg-red-100"
                                : "text-yellow-600 bg-yellow-100"
                        }`}
                    >
                        Go
                    </span>
                )}
                <button
                    onClick={(e) => onDismiss(e, item)}
                    className={`w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                        isError
                            ? "hover:bg-red-200 text-red-400"
                            : "hover:bg-yellow-200 text-yellow-400"
                    }`}
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
}

/** Quick success flash banner */
export function ValidationSuccessBanner({
    isVisible,
    message = "All good! Submitting...",
}) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed top-6 right-4 z-[9999]"
                >
                    <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** Inline field-level error indicator */
export function FieldError({ message, className = "" }) {
    if (!message) return null;
    return (
        <AnimatePresence>
            <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-1.5 text-xs text-red-600 mt-1 font-medium ${className}`}
            >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {message}
            </motion.p>
        </AnimatePresence>
    );
}

/**
 * FileUploadZone - enhanced drag-and-drop upload area with validation feedback
 */
export function FileUploadZone({
    onFileSelect,
    accept = "image/*",
    maxSizeMB = 5,
    label = "Upload file",
    hint,
    currentFile = null,
    currentFileName = null,
    error = null,
    className = "",
    icon: Icon = null,
}) {
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState(null);
    const inputRef = useRef(null);

    const validate = (file) => {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const isImage = accept.includes("image/");
        const isPDF = accept.includes("pdf");
        const isVideo = accept.includes("video/");

        if (
            acceptedTypes.length &&
            !acceptedTypes.some((t) => {
                if (t.endsWith("/*"))
                    return file.type.startsWith(t.replace("/*", "/"));
                if (t.startsWith("."))
                    return file.name.toLowerCase().endsWith(t);
                return file.type === t;
            })
        ) {
            const friendly = accept
                .replace(/image\//g, "")
                .replace(/video\//g, "")
                .replace(/application\//g, "")
                .toUpperCase();
            return `Invalid file type. Accepted: ${friendly}`;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File too large. Max size: ${maxSizeMB}MB`;
        }
        return null; // valid
    };

    const processFile = (file) => {
        const err = validate(file);
        if (err) {
            onFileSelect(null, err);
            return;
        }
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
        onFileSelect(file, null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const hadFile = currentFile || currentFileName || preview;

    return (
        <div className={`relative ${className}`}>
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                    error
                        ? "border-red-400 bg-red-50 hover:bg-red-100/70"
                        : dragOver
                          ? "border-blue-500 bg-blue-50 scale-[1.01]"
                          : hadFile
                            ? "border-emerald-400 bg-emerald-50 hover:bg-emerald-100/60"
                            : "border-gray-300 bg-gray-50/50 hover:bg-gray-100/60 hover:border-gray-400"
                }`}
            >
                {/* Preview image */}
                {(preview ||
                    (currentFileName && accept.includes("image/"))) && (
                    <img
                        src={preview || currentFileName}
                        alt="preview"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-20"
                    />
                )}

                <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
                    {hadFile ? (
                        <>
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            <p className="text-sm font-semibold text-emerald-700">
                                File selected
                            </p>
                            <p className="text-xs text-emerald-600 max-w-[200px] truncate">
                                {currentFile?.name ||
                                    currentFileName ||
                                    "File ready"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Click to change
                            </p>
                        </>
                    ) : error ? (
                        <>
                            <XCircle className="w-10 h-10 text-red-500" />
                            <p className="text-sm font-semibold text-red-700">
                                {error}
                            </p>
                            <p className="text-xs text-gray-500">
                                Click to try again
                            </p>
                        </>
                    ) : (
                        <>
                            {Icon ? (
                                <Icon className="w-10 h-10 text-gray-400" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                                    </div>
                            )}
                            <p className="text-sm font-semibold text-gray-700">
                                {label}
                            </p>
                            {hint && (
                                <p className="text-xs text-gray-500">{hint}</p>
                            )}
                            <p className="text-xs text-gray-400">
                                Max {maxSizeMB}MB
                            </p>
                        </>
                    )}
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) processFile(file);
                    e.target.value = null;
                }}
            />

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5 font-medium"
                >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                </motion.p>
            )}
        </div>
    );
}
