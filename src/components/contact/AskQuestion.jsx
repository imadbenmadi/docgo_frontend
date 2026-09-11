import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { MessageCircleQuestion, X } from "lucide-react";
import ContactForm from "./ContactForm";
import { useAppContext } from "../../AppContext";

/**
 * "I have a question about this."
 *
 * A button that sits in the corner of any page and opens the contact form
 * already knowing what the page is about, so the question arrives with its
 * subject attached instead of as "hi, about the thing I was looking at".
 *
 * It is deliberately one component rather than a form pasted onto each page:
 * a product page, the page for a product someone already bought, and the
 * payment page all need the same thing, and the only difference between them
 * is two strings.
 *
 * The panel is portalled to the body because several of these pages have a
 * transformed ancestor, which would otherwise become the containing block for
 * the fixed overlay and strand it inside a card.
 */
const AskQuestion = ({
    context = "landing",
    subjectType = null,
    subjectId = null,
    label = null,
    floating = true,
    className = "",
}) => {
    const { t } = useTranslation();
    const { user } = useAppContext();
    const [open, setOpen] = useState(false);

    // A page behind an open panel should not scroll under it.
    useEffect(() => {
        if (!open) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const buttonLabel =
        label || t("contact.askQuestion", "Poser une question");

    const trigger = floating ? (
        <button
            type="button"
            onClick={() => setOpen(true)}
            className={`fixed bottom-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white shadow-lg transition hover:bg-blue-700 ltr:right-6 rtl:left-6 ${className}`}
        >
            <MessageCircleQuestion className="h-5 w-5" />
            <span className="hidden text-sm font-medium sm:inline">
                {buttonLabel}
            </span>
        </button>
    ) : (
        <button
            type="button"
            onClick={() => setOpen(true)}
            className={`inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 ${className}`}
        >
            <MessageCircleQuestion className="h-4 w-4" />
            {buttonLabel}
        </button>
    );

    // The floating button is portalled too: several of these pages sit inside
    // a transformed ancestor, which would become the containing block for a
    // fixed element and pin the button halfway down a card.
    return (
        <>
            {floating ? createPortal(trigger, document.body) : trigger}
            {open &&
                createPortal(
                    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
                        <div
                            className="absolute inset-0"
                            onClick={() => setOpen(false)}
                            aria-hidden="true"
                        />
                        <div className="relative z-10 my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="absolute top-4 z-10 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 ltr:right-4 rtl:left-4"
                                aria-label={t("common.close", "Fermer")}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="max-h-[85vh] overflow-y-auto p-6">
                                <ContactForm
                                    context={context}
                                    subjectType={subjectType}
                                    subjectId={subjectId ? String(subjectId) : null}
                                    title={buttonLabel}
                                    onSuccess={() =>
                                        setTimeout(() => setOpen(false), 2500)
                                    }
                                />
                                {!user && (
                                    <p className="mt-3 text-center text-xs text-gray-500">
                                        {t(
                                            "contact.signInForScreenshot",
                                            "Connectez-vous pour joindre une capture d'écran.",
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
};

AskQuestion.propTypes = {
    context: PropTypes.string,
    subjectType: PropTypes.string,
    subjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    floating: PropTypes.bool,
    className: PropTypes.string,
};

export default AskQuestion;
