import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../utils/apiClient";
import { buildApiUrl } from "../../utils/apiBaseUrl";
import "../../styles/ZipCourseBrowser.css";

/**
 * ZipCourseBrowser Component
 *
 * Displays extracted ZIP files as a navigable file browser.
 * Supports nested folders and inline file viewing.
 */
export const ZipCourseBrowser = ({ courseId }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseInfo, setCourseInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textPreview, setTextPreview] = useState("");
  const [textLoading, setTextLoading] = useState(false);

  const currentPath =
    breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].path : null;

  const selectedContentPath = useMemo(() => {
    if (!selectedFile?.id) return null;
    return `/courses/${courseId}/files/${selectedFile.id}/content`;
  }, [courseId, selectedFile?.id]);

  const selectedContentUrl = useMemo(() => {
    if (!selectedContentPath) return null;
    return buildApiUrl(selectedContentPath);
  }, [selectedContentPath]);

  // Fetch files when path changes
  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const query = currentPath ? `?parentPath=${currentPath}` : "";
      const res = await apiClient.get(`/courses/${courseId}/files${query}`);

      if (res.data.success) {
        setFiles(res.data.data.files);
        setCourseInfo(res.data.data);
        setError("");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        t("failedLoadFiles", "Failed to load files");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolder = (file) => {
    if (file.isDirectory) {
      setSelectedFile(null);
      setBreadcrumb([...breadcrumb, { name: file.name, path: file.path }]);
    }
  };

  const handleNavigateBreadcrumb = (index) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1));
  };

  const handleRootClick = () => {
    setSelectedFile(null);
    setBreadcrumb([]);
  };

  const handleOpenFile = (file) => {
    if (file.isDirectory) {
      handleOpenFolder(file);
    } else {
      setSelectedFile(file);
    }
  };

  const getExtension = (name = "") => {
    const idx = name.lastIndexOf(".");
    if (idx === -1) return "";
    return name.slice(idx + 1).toLowerCase();
  };

  const isProbablyText = (file) => {
    const mime = String(file?.mimeType || "").toLowerCase();
    if (mime.startsWith("text/")) return true;
    const ext = getExtension(file?.name);
    return ["txt", "md", "csv", "json", "log", "xml", "yml", "yaml"].includes(
      ext,
    );
  };

  const getPreviewKind = (file) => {
    const mime = String(file?.mimeType || "").toLowerCase();
    const ext = getExtension(file?.name);

    if (mime.startsWith("video/") || ["mp4", "webm", "mov"].includes(ext)) {
      return "video";
    }
    if (mime === "application/pdf" || ext === "pdf") {
      return "pdf";
    }
    if (
      mime.startsWith("image/") ||
      ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
    ) {
      return "image";
    }
    if (isProbablyText(file)) {
      return "text";
    }
    if (["doc", "docx"].includes(ext)) {
      return "doc";
    }
    return "unknown";
  };

  useEffect(() => {
    const loadTextPreview = async () => {
      setTextPreview("");
      if (!selectedFile || selectedFile.isDirectory) return;
      if (!selectedContentPath) return;

      const kind = getPreviewKind(selectedFile);
      if (kind !== "text") return;

      setTextLoading(true);
      try {
        const res = await apiClient.get(selectedContentPath, {
          responseType: "text",
          transformResponse: [(data) => data],
        });
        setTextPreview(String(res.data || ""));
      } catch (err) {
        const message =
          err.response?.data?.message ||
          t("failedLoadFiles", "Failed to load files");
        setTextPreview(message);
      } finally {
        setTextLoading(false);
      }
    };

    loadTextPreview();
  }, [selectedContentPath, selectedContentUrl, selectedFile, t]);

  const getFileIcon = (file) => {
    if (file.isDirectory) return "📁";

    const ext = file.name.split(".").pop()?.toLowerCase();
    const icons = {
      pdf: "📄",
      txt: "📝",
      md: "📝",
      html: "🌐",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      mp4: "🎬",
      webm: "🎬",
      mp3: "🎵",
      wav: "🎵",
      doc: "📘",
      docx: "📘",
      xls: "📊",
      xlsx: "📊",
      zip: "🗂️",
    };
    return icons[ext] || "📦";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  return (
    <div className="zip-browser-container">
      <div className="zip-browser">
        {/* Header */}
        <div className="browser-header">
          <h2>{t("courseContent", "Course Content")}</h2>
          {courseInfo && (
            <p className="course-info">
              {courseInfo.fileCount} {t("filesAvailable", "files available")}
            </p>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        {breadcrumb.length > 0 && (
          <div className="breadcrumb-nav">
            <button className="breadcrumb-root" onClick={handleRootClick}>
              📦 {t("root", "Root")}
            </button>
            {breadcrumb.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="separator">/</span>
                <button
                  className="breadcrumb-item"
                  onClick={() => handleNavigateBreadcrumb(idx)}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t("loading", "Loading...")}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}

        {/* File List */}
        {!loading && !error && (
          <div className="file-list">
            {files.length === 0 ? (
              <div className="empty-state">
                <p>{t("noFiles", "No files in this directory")}</p>
              </div>
            ) : (
              <div className="file-grid">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`file-item ${
                      file.isDirectory ? "directory" : "file"
                    } clickable`}
                    onClick={() => handleOpenFile(file)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleOpenFile(file);
                      }
                    }}
                  >
                    <div className="file-icon">{getFileIcon(file)}</div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      {!file.isDirectory && (
                        <div className="file-size">
                          {formatFileSize(file.size)}
                        </div>
                      )}
                      {file.isDirectory && (
                        <div className="file-type">{t("folder", "Folder")}</div>
                      )}
                    </div>
                    {!file.isDirectory && (
                      <div className="file-action-hint">→</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline Preview */}
        {!loading && !error && selectedFile && !selectedFile.isDirectory && (
          <div className="browser-info" style={{ marginTop: "16px" }}>
            <p>
              <strong>{t("preview", "Preview")}:</strong> {selectedFile.name}
            </p>

            {selectedContentUrl &&
              (() => {
                const kind = getPreviewKind(selectedFile);

                if (kind === "video") {
                  return (
                    <video
                      src={selectedContentUrl}
                      controls
                      style={{ width: "100%", marginTop: "10px" }}
                    />
                  );
                }

                if (kind === "pdf") {
                  return (
                    <iframe
                      title={selectedFile.name}
                      src={selectedContentUrl}
                      style={{
                        width: "100%",
                        height: "520px",
                        marginTop: "10px",
                      }}
                    />
                  );
                }

                if (kind === "image") {
                  return (
                    <img
                      src={selectedContentUrl}
                      alt={selectedFile.name}
                      style={{ width: "100%", marginTop: "10px" }}
                    />
                  );
                }

                if (kind === "text") {
                  return textLoading ? (
                    <p style={{ marginTop: "10px" }}>
                      {t("loading", "Loading...")}
                    </p>
                  ) : (
                    <pre
                      style={{
                        marginTop: "10px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: "520px",
                        overflow: "auto",
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {textPreview}
                    </pre>
                  );
                }

                if (kind === "doc") {
                  return (
                    <div style={{ marginTop: "10px" }}>
                      <p>
                        {t(
                          "docPreviewNotAvailable",
                          "DOC/DOCX preview isn't available in the browser. Download the file.",
                        )}
                      </p>
                      <a
                        href={selectedContentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("download", "Download")}
                      </a>
                    </div>
                  );
                }

                return (
                  <div style={{ marginTop: "10px" }}>
                    <p>
                      {t(
                        "unsupportedPreview",
                        "This file type isn't supported for preview.",
                      )}
                    </p>
                    <a
                      href={selectedContentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("open", "Open")}
                    </a>
                  </div>
                );
              })()}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="browser-info">
        <p>
          <strong>{t("tip", "Tip")}:</strong>{" "}
          {t(
            "clickFolderOpen",
            "Click on folders to navigate. Click on files to view.",
          )}
        </p>
      </div>
    </div>
  );
};

export default ZipCourseBrowser;
