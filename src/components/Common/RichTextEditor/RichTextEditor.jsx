import { useMemo, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import PropTypes from "prop-types";
import {
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import "react-quill/dist/quill.snow.css";
import "./RichTextEditor.css";

const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Commencez à écrire...",
    readOnly = false,
    height = "200px",
    theme = "snow",
    className = "",
    label,
    error,
    required = false,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Handle ESC key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            document.addEventListener("keydown", handleKeyDown);
            // Prevent body scrolling when fullscreen
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isFullscreen]);
    // Custom toolbar configuration
    const modules = useMemo(
        () => ({
            toolbar: readOnly
                ? false
                : {
                      container: [
                          [{ header: [1, 2, 3, 4, 5, 6, false] }],
                          [{ font: [] }],
                          [{ size: ["small", false, "large", "huge"] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ color: [] }, { background: [] }],
                          [{ script: "sub" }, { script: "super" }],
                          [{ list: "ordered" }, { list: "bullet" }],
                          [{ indent: "-1" }, { indent: "+1" }],
                          [{ direction: "rtl" }],
                          [{ align: [] }],
                          ["blockquote", "code-block"],
                          ["clean"],
                      ],
                  },
            clipboard: {
                matchVisual: false,
            },
        }),
        [readOnly]
    );

    const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "script",
        "list",
        "bullet",
        "indent",
        "direction",
        "align",
        "blockquote",
        "code-block",
        "link",
        "clean",
    ];

    const handleChange = (content) => {
        if (onChange) {
            onChange(content);
        }
    };

    return (
        <>
            <div
                className={`rich-text-editor-wrapper ${className} mb-24 ${
                    isFullscreen ? "hidden" : ""
                }`}
            >
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                        {required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                )}

                <div
                    className={`rich-text-editor ${
                        readOnly ? "read-only" : ""
                    } relative`}
                >
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="absolute top-2 right-2 z-10 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title="Expand to fullscreen"
                        >
                            <ArrowsPointingOutIcon className="h-4 w-4" />
                        </button>
                    )}
                    <ReactQuill
                        value={value || ""}
                        onChange={handleChange}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        theme={theme}
                        modules={modules}
                        formats={formats}
                        style={{
                            height: readOnly ? "auto" : height,
                            minHeight: readOnly ? "auto" : height,
                        }}
                    />
                </div>

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-white z-50 flex flex-col fullscreen-modal">
                    {/* Fullscreen Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center">
                            {label && (
                                <h3 className="text-lg font-medium text-gray-900">
                                    {label}
                                    {required && (
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    )}
                                </h3>
                            )}
                            {!label && (
                                <h3 className="text-lg font-medium text-gray-900">
                                    Rich Text Editor
                                </h3>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                title="Exit fullscreen"
                            >
                                <ArrowsPointingInIcon className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                title="Close"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Fullscreen Editor */}
                    <div className="flex-1 p-4 overflow-hidden">
                        <div className="h-full rich-text-editor fullscreen-editor">
                            <ReactQuill
                                value={value || ""}
                                onChange={handleChange}
                                placeholder={placeholder}
                                readOnly={readOnly}
                                theme={theme}
                                modules={modules}
                                formats={formats}
                                style={{
                                    height: "calc(100% - 42px)", // Account for toolbar height
                                }}
                            />
                        </div>
                    </div>

                    {/* Fullscreen Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Press ESC to exit fullscreen
                        </div>
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Done
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border-t border-red-200">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

RichTextEditor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    readOnly: PropTypes.bool,
    height: PropTypes.string,
    theme: PropTypes.string,
    className: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    required: PropTypes.bool,
};

export default RichTextEditor;
