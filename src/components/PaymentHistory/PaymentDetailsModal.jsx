/**
 * ============================================================================
 * PAYMENT DETAILS MODAL
 * ============================================================================
 * Reusable modal component to display payment details
 * Used from admin and user views with appropriate access controls
 */

import React, { useEffect, useState } from "react";
import {
  X,
  Download,
  AlertCircle,
  Check,
  Clock,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import apiClient from "../../utils/apiClient";

const PaymentDetailsModal = ({
  paymentId,
  isOpen,
  onClose,
  isAdmin = false,
}) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch payment details
  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPaymentDetails();
    }
  }, [isOpen, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = isAdmin
        ? `/Admin/payment-history/${paymentId}`
        : `/user/payment-history/${paymentId}`;

      const response = await apiClient.get(endpoint);

      if (response.data.success) {
        setPayment(response.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch payment details",
      );
    } finally {
      setLoading(false);
    }
  };

  // Download screenshot
  const handleDownload = async () => {
    try {
      const endpoint = isAdmin
        ? `/Admin/payment-history/${paymentId}/download-screenshot`
        : `/user/payment-history/${paymentId}/download`;

      const response = await apiClient.get(endpoint, {
        responseType: "blob",
      });

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
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
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          ) : payment ? (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`rounded-lg p-4 ${
                  payment.status === "approved"
                    ? "bg-green-50 border border-green-200"
                    : payment.status === "rejected"
                      ? "bg-red-50 border border-red-200"
                      : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {payment.status === "approved" ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : payment.status === "rejected" ? (
                    <X className="w-6 h-6 text-red-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-yellow-600" />
                  )}
                  <div>
                    <p
                      className={`font-bold text-lg ${
                        payment.status === "approved"
                          ? "text-green-900"
                          : payment.status === "rejected"
                            ? "text-red-900"
                            : "text-yellow-900"
                      }`}
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </p>
                    {payment.verificationDate && (
                      <p
                        className={
                          payment.status === "approved"
                            ? "text-green-700"
                            : payment.status === "rejected"
                              ? "text-red-700"
                              : "text-yellow-700"
                        }
                      >
                        {payment.status === "pending"
                          ? "Waiting for verification"
                          : `${payment.status === "approved" ? "Approved" : "Rejected"} on ${new Date(payment.verificationDate).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Item Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Item Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex gap-4">
                    <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {payment.item?.title || "Deleted " + payment.itemType}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {payment.itemType}
                      </p>
                      {payment.item?.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.item.description.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Payment Amount
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-3xl font-bold text-blue-900">
                      {payment.amount}
                    </span>
                    <span className="text-lg text-blue-700">
                      {payment.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Payment Method
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {payment.ccpNumber && (
                    <div>
                      <p className="text-sm text-gray-600">CCP Number</p>
                      <p className="font-mono text-gray-900">
                        {payment.ccpNumber}
                      </p>
                    </div>
                  )}
                  {payment.phoneNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-mono text-gray-900">
                        {payment.phoneNumber}
                      </p>
                    </div>
                  )}
                  {payment.transactionId && (
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-mono text-sm text-gray-900 break-all">
                        {payment.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
                    Upload Date
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(payment.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {payment.verificationDate && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
                      Verification Date
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(
                          payment.verificationDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rejection Reason - Admin Only */}
              {isAdmin && payment.rejectionReason && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-3 uppercase">
                    Rejection Reason
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{payment.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Admin Notes - Admin Only */}
              {isAdmin && payment.adminNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                    Admin Notes
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800">{payment.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Verified By - Admin Only */}
              {isAdmin && payment.verifiedBy && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                    Verified By
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-mono text-gray-900">
                      {payment.verifiedBy}
                    </p>
                  </div>
                </div>
              )}

              {/* User Information - Admin Only */}
              {isAdmin && payment.user && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                    User Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {payment.user.firstName} {payment.user.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {payment.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Section */}
              {payment.hasScreenshot && (
                <div>
                  <button
                    onClick={handleDownload}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Download Payment Screenshot
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
