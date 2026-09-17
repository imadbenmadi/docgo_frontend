import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import mammoth from "mammoth";
import { Download, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import apiClient from "../../services/apiClient";

/**
 * One file, shown rather than downloaded.
 *
 * Everything here exists because pointing an <iframe src> at the API does not
 * work, and had not been working anywhere on the platform:
 *
 *   - The file endpoints check who is asking. A frame, an <img> or a <video>
 *     is a subresource request, and a browser will not reliably attach the
 *     session cookie to one cross-origin - Chrome's third-party cookie
 *     phase-out settles it for good. The request arrives unauthenticated and
 *     answers 401.
 *   - The 401 and 404 pages Express serves carry X-Frame-Options: SAMEORIGIN,
 *     and so did every response in production, where Apache was setting the
 *     header itself. So the failure did not read as "not signed in", it read
 *     as "Refused to display ... in a frame", which sent everyone looking at
 *     framing policy instead of at authentication.
 *   - A .docx cannot be framed at any origin. Browsers download it.
 *
 * So the file is fetched the same way every other API call is - through the
 * client that knows how to authenticate - and handed to the viewer as a blob
 * URL. A blob belongs to the page that made it, so there is no origin to
 * refuse it, no cookie to forget and no header to get in the way. Word
 * documents are converted in the browser with mammoth, because rendering them
 * server-side would need LibreOffice and Office Online would need the document
 * to be publicly reachable.
 */

const EXT_KINDS = {
  pdf: "pdf",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  bmp: "image",
  mp4: "video",
  webm: "video",
  mov: "video",
  m4v: "video",
  ogv: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  m4a: "audio",
  doc: "word",
  docx: "word",
  txt: "text",
  md: "text",
  csv: "text",
  json: "text",
  log: "text",
  xml: "text",
  yml: "text",
  yaml: "text",
  html: "text",
  htm: "text",
};

const extensionOf = (name = "") => {
  const i = String(name).lastIndexOf(".");
  return i === -1 ? "" : String(name).slice(i + 1).toLowerCase();
};

/** What to draw for this file. mimeType wins, the extension is the fallback. */
export const previewKind = (name, mimeType) => {
  const mime = String(mimeType || "").toLowerCase();
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.includes("wordprocessingml") || mime === "application/msword") {
    return "word";
  }
  if (mime.startsWith("text/")) return "text";
  return EXT_KINDS[extensionOf(name)] || "other";
};

const humanSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
};

/**
 * Fetch a file as a blob.
 *
 * Course media (/media/stream/...) may live on Bunny: the stream endpoint
 * answers with a 302 to a signed CDN URL, and Bunny replies with
 * Access-Control-Allow-Origin: *. A request sent with credentials - which the
 * API client always is - may not accept a wildcard origin, so the browser
 * throws the file away. For those paths the file is fetched in two steps:
 * ask the API for a signed URL (with the session), then fetch that URL with
 * no credentials. The URL carries its own short-lived token, so nothing is
 * lost by leaving the cookie behind.
 *
 * Everything else - ZIP files, admin endpoints - is served from our own disk
 * and goes through the API client as before.
 */
const fetchBlob = async (path) => {
  if (path.startsWith("/media/stream/")) {
    const { data } = await apiClient.get(
      path.replace("/media/stream/", "/media/signed-url/"),
    );
    if (!data?.url) {
      const err = new Error("No URL for this file");
      err.response = { status: 404 };
      throw err;
    }
    const res = await fetch(data.url, { credentials: "omit" });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.response = { status: res.status };
      throw err;
    }
    return res.blob();
  }
  const res = await apiClient.get(path, { responseType: "blob" });
  return res.data;
};

function FilePreview({
  path,
  name = "",
  mimeType = null,
  size = null,
  className = "",
  height = "70vh",
  allowFullscreen = true,
  emptyLabel = null,
}) {
  const kind = useMemo(() => previewKind(name, mimeType), [name, mimeType]);

  const [state, setState] = useState("idle"); // idle | loading | ready | error
  const [message, setMessage] = useState("");
  const [blobUrl, setBlobUrl] = useState(null);
  const [textBody, setTextBody] = useState("");
  const [wordHtml, setWordHtml] = useState("");
  const [full, setFull] = useState(false);

  // Revoking on the way out matters: a course with fifty files would
  // otherwise hold every one of them in memory until the tab closed.
  const urlRef = useRef(null);
  const release = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      release();
      setBlobUrl(null);
      setTextBody("");
      setWordHtml("");
      setMessage("");

      if (!path) {
        setState("idle");
        return;
      }

      setState("loading");
      try {
        const blob = await fetchBlob(path);
        if (cancelled) return;

        if (kind === "text") {
          setTextBody(await blob.text());
        } else if (kind === "word") {
          const buffer = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          if (cancelled) return;
          setWordHtml(result.value || "<p><em>Ce document est vide.</em></p>");
        } else {
          const url = URL.createObjectURL(blob);
          urlRef.current = url;
          setBlobUrl(url);
        }
        setState("ready");
      } catch (error) {
        if (cancelled) return;
        const status = error?.response?.status;
        setState("error");
        setMessage(
          status === 401
            ? "Connectez-vous pour ouvrir ce fichier."
            : status === 403
              ? "Vous n'avez pas accès à ce fichier."
              : status === 404
                ? "Ce fichier est introuvable."
                : "Impossible d'ouvrir ce fichier.",
        );
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [path, kind, release]);

  useEffect(() => release, [release]);

  // Escape closes the full-screen view, and the page behind it should not
  // scroll while it is open.
  useEffect(() => {
    if (!full) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  const body = (() => {
    if (!path) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-500">
          {emptyLabel || "Sélectionnez un fichier pour l'afficher."}
        </div>
      );
    }
    if (state === "loading") {
      return (
        <div className="flex h-full items-center justify-center gap-2 p-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      );
    }
    if (state === "error") {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm text-red-600">{message}</p>
        </div>
      );
    }

    if (kind === "pdf" && blobUrl) {
      return (
        <iframe
          title={name || "Document"}
          src={blobUrl}
          className="h-full w-full border-0 bg-white"
        />
      );
    }
    if (kind === "image" && blobUrl) {
      return (
        <div className="flex h-full items-center justify-center overflow-auto bg-neutral-900 p-2">
          <img
            src={blobUrl}
            alt={name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    }
    if (kind === "video" && blobUrl) {
      return (
        <div className="flex h-full items-center justify-center bg-black">
          <video src={blobUrl} controls className="max-h-full max-w-full" />
        </div>
      );
    }
    if (kind === "audio" && blobUrl) {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <audio src={blobUrl} controls className="w-full max-w-xl" />
        </div>
      );
    }
    if (kind === "word") {
      return (
        <div
          className="word-preview h-full overflow-auto bg-white p-6 text-sm leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: wordHtml }}
        />
      );
    }
    if (kind === "text") {
      return (
        <pre className="h-full overflow-auto whitespace-pre-wrap break-words bg-white p-4 font-mono text-xs text-gray-800">
          {textBody}
        </pre>
      );
    }

    // Anything we cannot draw is still something the person can keep.
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-gray-600">
          Ce type de fichier ne s&apos;affiche pas dans le navigateur.
        </p>
        {blobUrl && (
          <a
            href={blobUrl}
            download={name || "fichier"}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </a>
        )}
      </div>
    );
  })();

  const frame = (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${className}`}
      style={full ? undefined : { height }}
    >
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
          {name || "Aperçu"}
        </span>
        {size ? (
          <span className="flex-shrink-0 text-xs text-gray-400">
            {humanSize(size)}
          </span>
        ) : null}
        {blobUrl && (
          <a
            href={blobUrl}
            download={name || "fichier"}
            className="flex-shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title="Télécharger"
          >
            <Download className="h-4 w-4" />
          </a>
        )}
        {allowFullscreen && path && (
          <button
            type="button"
            onClick={() => setFull((v) => !v)}
            className="flex-shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title={full ? "Réduire" : "Plein écran"}
          >
            {full ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        )}
        {full && (
          <button
            type="button"
            onClick={() => setFull(false)}
            className="flex-shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  );

  if (!full) return frame;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-black/70 p-2 sm:p-6">
      <div className="flex min-h-0 flex-1 flex-col">{frame}</div>
    </div>
  );
}

FilePreview.propTypes = {
  /** API path, relative to the client's base URL. */
  path: PropTypes.string,
  name: PropTypes.string,
  mimeType: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  height: PropTypes.string,
  allowFullscreen: PropTypes.bool,
  emptyLabel: PropTypes.string,
};

export default FilePreview;
