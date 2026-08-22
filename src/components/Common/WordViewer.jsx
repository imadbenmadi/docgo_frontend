import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import mammoth from "mammoth";
import apiClient from "../../services/apiClient";

/**
 * Renders a .docx / .doc section item inline.
 *
 * WHY IT FETCHES A SIGNED URL FIRST
 * ---------------------------------
 * Course_Words is a protected directory — direct GETs are 404'd by the media
 * protection shield. The only legitimate way in is /media/signed-url, which
 * verifies enrollment server-side and hands back a short-lived, IP-pinned URL.
 *
 * WHY IT CONVERTS IN THE BROWSER
 * ------------------------------
 * Rendering .docx server-side needs LibreOffice, which shared cPanel hosting
 * does not provide. Handing the file to Office Online (view.officeapps.live.com)
 * would work but requires the document to be PUBLICLY reachable, which defeats
 * the whole point of gating paid content. mammoth converts the file to HTML
 * entirely client-side, so the bytes never leave our origin.
 */
function WordViewer({ wordUrl, title }) {
    const [html, setHtml] = useState("");
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!wordUrl) {
                setStatus("error");
                setMessage("No document attached to this item.");
                return;
            }

            setStatus("loading");

            try {
                // Resolve the protected file to a signed, enrollment-checked URL.
                let fileUrl = wordUrl;
                if (!wordUrl.startsWith("http")) {
                    const basename = wordUrl.split("/").pop();
                    const res = await apiClient.get(
                        `/media/signed-url/word/${encodeURIComponent(basename)}`,
                    );
                    fileUrl = res.data?.url;
                }

                if (!fileUrl) throw new Error("Could not resolve document URL");

                // credentials are only meaningful for our own origin; Bunny
                // rejects credentialed requests, so omit them for CDN URLs.
                const isCdn = /b-cdn\.net|bunnycdn\.com/.test(fileUrl);
                const response = await fetch(fileUrl, {
                    credentials: isCdn ? "omit" : "include",
                });

                if (!response.ok) {
                    throw new Error(
                        response.status === 403
                            ? "You need to be enrolled to read this document."
                            : `Could not download document (${response.status})`,
                    );
                }

                const arrayBuffer = await response.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });

                if (cancelled) return;
                setHtml(result.value || "<p><em>This document is empty.</em></p>");
                setStatus("ready");
            } catch (err) {
                if (cancelled) return;
                setStatus("error");
                setMessage(err.message || "Failed to open document");
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [wordUrl]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Opening document…</p>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <p className="font-medium text-red-800">
                    Could not display this document
                </p>
                <p className="text-red-700 text-sm mt-1">{message}</p>
            </div>
        );
    }

    return (
        <div
            className="word-document bg-white rounded-xl border border-gray-200 shadow-sm p-8 overflow-x-auto prose prose-sm max-w-none"
            // mammoth emits a constrained subset of HTML (headings, lists,
            // tables, emphasis, images as data URIs) from a file an admin
            // uploaded, so this is not user-supplied markup.
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

WordViewer.propTypes = {
    wordUrl: PropTypes.string,
    title: PropTypes.string,
};

export default WordViewer;
