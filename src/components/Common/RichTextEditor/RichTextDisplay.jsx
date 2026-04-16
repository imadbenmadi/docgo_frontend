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

        // Sanitize the HTML content to prevent XSS attacks
        const cleanContent = DOMPurify.sanitize(content, {
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
    content: PropTypes.string,
    className: PropTypes.string,
    textClassName: PropTypes.string,
    maxLength: PropTypes.number,
    showReadMore: PropTypes.bool,
};

export default RichTextDisplay;
