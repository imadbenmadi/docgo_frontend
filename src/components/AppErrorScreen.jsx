import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AlertTriangle, Check, Copy, Home, RefreshCw, Send } from "lucide-react";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

/**
 * Error boundary screen, used as the router's errorElement.
 *
 * Posts the error to /client-errors once on mount, shows the resulting
 * reference code for the user to quote, and keeps the stack trace collapsed.
 */

/** Short, unambiguous, and easy to read down a phone line. */
const makeReference = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
    let out = "";
    for (let i = 0; i < 6; i++) {
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return `ERR-${out}`;
};

const AppErrorScreen = ({ error, app = "frontend", onRetry }) => {
    const [reference] = useState(makeReference);
    const [reported, setReported] = useState("sending");
    const [showDetail, setShowDetail] = useState(false);
    const [copied, setCopied] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const sent = useRef(false);

    const message =
        error?.message || error?.statusText || String(error || "Unknown error");
    const stack = error?.stack || error?.componentStack || null;

    useEffect(() => {
        // Once per mount. A crash that re-renders must not become a stream of
        // identical reports.
        if (sent.current) return;
        sent.current = true;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        fetch(`${getApiBaseUrl()}/client-errors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            signal: controller.signal,
            body: JSON.stringify({
                app,
                reference,
                message,
                stack,
                componentStack: error?.componentStack || null,
                url: window.location.href,
                route: window.location.pathname,
                userAgent: navigator.userAgent,
            }),
        })
            .then((r) => setReported(r.ok ? "sent" : "failed"))
            .catch(() => setReported("failed"))
            .finally(() => clearTimeout(timeout));

        // Deliberately NOT aborting on unmount. React runs effects twice in
        // development, so the cleanup from the first run was cancelling the
        // request the second run then refused to retry - the report never
        // left the browser. A crash report is fire-and-forget: it should
        // outlive the screen that sent it.
        return () => clearTimeout(timeout);
    }, [app, error, message, reference, stack, attempt]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(
                `${reference}\n${message}\n${window.location.href}`,
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard blocked — the code is on screen to read anyway */
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-5 flex items-start gap-4">
                    <div className="rounded-lg bg-amber-50 p-2.5">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Cette page n&apos;a pas pu s&apos;afficher
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Le problème vient de nous, pas de vous. Il a été
                            signalé automatiquement.
                        </p>
                    </div>
                </div>

                <div className="mb-5 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                Référence
                            </p>
                            <p className="font-mono text-lg font-semibold text-gray-900">
                                {reference}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={copy}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                            {copied ? "Copié" : "Copier"}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {reported === "sending" && "Envoi du rapport…"}
                        {reported === "sent" &&
                            "Rapport envoyé. Donnez cette référence au support."}
                        {reported === "failed" && (
                            <>
                                Le rapport n&apos;a pas pu être envoyé. Copiez la
                                référence et le détail ci-dessous.
                            </>
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onRetry || (() => window.location.reload())}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white hover:bg-blue-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Réessayer
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <Home className="h-4 w-4" />
                        Accueil
                    </a>
                    {reported === "failed" && (
                        <button
                            type="button"
                            onClick={() => {
                                // `attempt` is in the effect's dependencies, so
                                // bumping it is what actually resends. The ref
                                // is the once-per-attempt guard.
                                sent.current = false;
                                setReported("sending");
                                setAttempt((n) => n + 1);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Send className="h-4 w-4" />
                            Renvoyer le rapport
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setShowDetail((v) => !v)}
                    className="mt-5 text-sm text-gray-500 underline hover:text-gray-700"
                >
                    {showDetail ? "Masquer le détail technique" : "Détail technique"}
                </button>

                {showDetail && (
                    <div className="mt-3 max-h-64 overflow-auto rounded-lg bg-gray-900 p-4">
                        <p className="font-mono text-xs text-amber-300">{message}</p>
                        {stack && (
                            <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-gray-400">
                                {stack}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

AppErrorScreen.propTypes = {
    error: PropTypes.any,
    app: PropTypes.string,
    onRetry: PropTypes.func,
};

export default AppErrorScreen;
