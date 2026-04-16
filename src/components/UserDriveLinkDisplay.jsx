import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../services/apiClient";
import { Link as LinkIcon, ExternalLink, Loader } from "lucide-react";

const UserDriveLinkDisplay = () => {
  const { t } = useTranslation();
  const [driveLink, setDriveLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriveLink = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/drive-links/my-drive-link");
        if (response.data.success && response.data.data) {
          setDriveLink(response.data.data);
        }
      } catch {
        // This is not necessarily an error - user just might not have a drive link
      } finally {
        setLoading(false);
      }
    };

    fetchDriveLink();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!driveLink) {
    return null; // Don't show anything if user doesn't have a drive link
  }

  if (!driveLink?.driveLink) return null;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">
              {t("drive_link", "Drive link")}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {t("drive_link_help", "This is your shared Google Drive link.")}
            </p>
          </div>
        </div>

        <a
          href={driveLink.driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("open", "Open")}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default UserDriveLinkDisplay;
