import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../utils/apiClient";
import FilePreview from "../Common/FilePreview";
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

  const currentPath =
    breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].path : null;

  const selectedContentPath = useMemo(() => {
    if (!selectedFile?.id) return null;
    return `/courses/${courseId}/files/${selectedFile.id}/content`;
  }, [courseId, selectedFile?.id]);

  // Fetch files when path changes
  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const query = currentPath
        ? `?parentPath=${encodeURIComponent(currentPath)}`
        : "";
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

        {/* The file itself.

            Everything used to be pointed at by URL - an <iframe>, an <img>, a
            link - and none of it worked, because the content endpoint checks
            who is asking and a subresource request does not carry the session.
            FilePreview fetches through the API client and renders from a blob
            instead, which also gets Word documents rendering rather than
            downloading. */}
        {!loading && !error && selectedFile && !selectedFile.isDirectory && (
          <div style={{ marginTop: "16px" }}>
            <FilePreview
              path={selectedContentPath}
              name={selectedFile.name}
              mimeType={selectedFile.mimeType}
              size={selectedFile.size}
              height="70vh"
            />
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
