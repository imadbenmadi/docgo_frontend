/**
 * ============================================================================
 * COURSE PAYMENT BUTTON & MODAL
 * ============================================================================
 * Component for viewing user's payments for a specific course or program
 * Shows as a button that opens a modal with filtered payments for that item
 */

import React, { useEffect, useState } from "react";
import { Download, X, AlertCircle, Clock, Check } from "lucide-react";
import apiClient from "../../utils/apiClient";

const CoursePaymentButton = ({ itemId, itemType = "course", itemTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState({});

  const fetchScreenshotPreview = async (paymentId) => {
    setScreenshotPreviews((prev) => {
      if (prev[paymentId]?.url || prev[paymentId]?.loading) return prev;
      return {
        ...prev,
        [paymentId]: { url: null, loading: true, error: null },
      };
    });

    try {
      const response = await apiClient.get(
        `/user/payment-history/${paymentId}/download`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      setScreenshotPreviews((prev) => ({
        ...prev,
        [paymentId]: { url, loading: false, error: null },
      }));
    } catch (err) {
      setScreenshotPreviews((prev) => ({
        ...prev,
        [paymentId]: {
          url: null,
          loading: false,
          error: err?.response?.data?.message || "Failed to load screenshot",
        },
      }));
    }
  };

  useEffect(() => {
    if (!expandedPayment) return;
    const payment = payments.find((p) => p.id === expandedPayment);
    if (!payment?.hasScreenshot) return;
    fetchScreenshotPreview(payment.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedPayment]);

  useEffect(() => {
    return () => {
      Object.values(screenshotPreviews || {}).forEach((entry) => {
        if (entry?.url) {
          try {
            window.URL.revokeObjectURL(entry.url);
          } catch {
            // ignore
          }
        }
      });
    };
  }, [screenshotPreviews]);

  // Fetch payments for this specific item
  const handleOpenModal = async () => {
    if (payments.length > 0) {
      setIsOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `/user/payment-history/item/${itemType}/${itemId}`,
      );

      if (response.data.success) {
        setPayments(response.data.data);
        setIsOpen(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch your payment history",
      );
    } finally {
      setLoading(false);
    }
  };

  // Download screenshot
  const handleDownload = async (paymentId) => {
    try {
      const response = await apiClient.get(
        `/user/payment-history/${paymentId}/download`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payment-${paymentId}.png`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch {
      alert("Failed to download screenshot");
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: Check,
        label: "Approved",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: X,
        label: "Rejected",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
    };

    const statusConfig = config[status] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}
      >
        <Icon className="w-4 h-4" />
        {statusConfig.label}
      </div>
    );
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <Check className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <X className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={handleOpenModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Loading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            View Your Payments
          </>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Payment History
                </h2>
                <p className="text-sm text-gray-600">{itemTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payments...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No payments found for this item</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id}>
                      {/* Payment Card */}
                      <div
                        onClick={() =>
                          setExpandedPayment(
                            expandedPayment === payment.id ? null : payment.id,
                          )
                        }
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>{getStatusIcon(payment.status)}</div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {payment.amount} {payment.currency}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(
                                    payment.uploadDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>{getStatusBadge(payment.status)}</div>
                        </div>

                        {/* Expanded Details */}
                        {expandedPayment === payment.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            {/* Status Info */}
                            <div className="bg-gray-50 rounded p-3">
                              <p className="text-xs font-medium text-gray-600 uppercase mb-1">
                                Status Details
                              </p>
                              <p className="text-sm text-gray-800">
                                {payment.status === "approved"
                                  ? `Approved on ${new Date(payment.verificationDate).toLocaleDateString()}`
                                  : payment.status === "rejected"
                                    ? `Rejected on ${new Date(payment.verificationDate).toLocaleDateString()}`
                                    : "Waiting for verification"}
                              </p>
                            </div>

                            {/* Proof Preview */}
                            <div className="bg-white border border-gray-200 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-gray-900 uppercase">
                                  Screenshot Preview
                                </p>
                                <span className="text-xs text-gray-500">
                                  {payment.hasScreenshot ? "Available" : "None"}
                                </span>
                              </div>
                              {payment.hasScreenshot ? (
                                <div className="w-full aspect-[5/3] rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                                  {screenshotPreviews[payment.id]?.loading ? (
                                    <div className="text-center">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                      <p className="text-xs text-gray-500">
                                        Loading preview...
                                      </p>
                                    </div>
                                  ) : screenshotPreviews[payment.id]?.url ? (
                                    <img
                                      src={screenshotPreviews[payment.id].url}
                                      alt="Payment proof"
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-center px-3">
                                      <p className="text-xs text-gray-500">
                                        Preview unavailable
                                      </p>
                                      {screenshotPreviews[payment.id]?.error ? (
                                        <p className="text-[11px] text-gray-400 mt-1">
                                          {screenshotPreviews[payment.id].error}
                                        </p>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full aspect-[5/3] rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                                  <p className="text-xs text-gray-500">
                                    No screenshot available.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Rejection Reason */}
                            {payment.rejectionReason && (
                              <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-xs font-medium text-red-700 uppercase mb-1">
                                  Rejection Reason
                                </p>
                                <p className="text-sm text-red-800">
                                  {payment.rejectionReason}
                                </p>
                              </div>
                            )}

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                  Upload Date
                                </p>
                                <p className="text-sm text-gray-700">
                                  {new Date(
                                    payment.uploadDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {payment.transactionId && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                    Transaction ID
                                  </p>
                                  <p className="text-sm text-gray-700 font-mono truncate">
                                    {payment.transactionId}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Download Button */}
                            {payment.hasScreenshot && (
                              <button
                                onClick={() => handleDownload(payment.id)}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition"
                              >
                                <Download className="w-4 h-4" />
                                Download Screenshot
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoursePaymentButton;
