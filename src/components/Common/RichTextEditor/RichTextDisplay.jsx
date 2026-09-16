import { useMemo } from "react";
import PropTypes from "prop-types";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import "./RichTextDisplay.css";

const RichTextDisplay = ({
    content,
    className = "",
    textClassName = "",
    maxLength,
    showReadMore = false,
}) => {
    const sanitizedContent = useMemo(() => {
        if (!content) return "";

        // A few of the columns this renders are JSON, not HTML.
        // programs.requiredDocuments is a JSON array, and handing an array
        // straight to DOMPurify stringifies it - the page showed
        // "[object Object]" where a list of documents belongs. Turn a list
        // into a list, and an object into its readable fields, before
        // sanitising.
        const asHtml = (value) => {
            if (typeof value === "string") return value;
            if (Array.isArray(value)) {
                const items = value
                    .map((v) =>
                        typeof v === "string"
                            ? v
                            : [v?.name, v?.title, v?.label, v?.description]
                                  .filter(Boolean)
                                  .join(" - "),
                    )
                    .filter(Boolean);
                return items.length
                    ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`
                    : "";
            }
            if (value && typeof value === "object") {
                return String(
                    value.html ?? value.text ?? value.description ?? "",
                );
            }
            return String(value);
        };

        // Sanitize the HTML content to prevent XSS attacks
        const cleanContent = DOMPurify.sanitize(asHtml(content), {
            ALLOWED_TAGS: [
                "p",
                "br",
                "strong",
                "em",
                "u",
                "s",
                "sub",
                "sup",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "ul",
                "ol",
                "li",
                "blockquote",
                "pre",
                "code",
                "a",
                // "img",
                "iframe",
                "div",
                "span",
            ],
            ALLOWED_ATTR: [
                "href",
                "target",
                "rel",
                "class",
                "style",
                "color",
                "background-color",
                "frameborder",
                "allowfullscreen",
            ],
            ALLOW_DATA_ATTR: false,
        });

        // If maxLength is specified, truncate the content
        if (maxLength && cleanContent.length > maxLength) {
            const truncated = cleanContent.substring(0, maxLength);
            return truncated + (showReadMore ? "..." : "");
        }

        return cleanContent;
    }, [content, maxLength, showReadMore]);

    if (!content) {
        return null;
    }

    return (
        <div className={`rich-text-display ${className}`}>
            <div className={textClassName}>{parse(sanitizedContent)}</div>
        </div>
    );
};

RichTextDisplay.propTypes = {
    // JSON columns reach this too, so an array or an object is
    // legitimate input, not a mistake.
    content: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
        PropTypes.object,
    ]),
    className: PropTypes.string,
    textClassName: PropTypes.string,
    maxLength: PropTypes.number,
    showReadMore: PropTypes.bool,
};

export default RichTextDisplay;
