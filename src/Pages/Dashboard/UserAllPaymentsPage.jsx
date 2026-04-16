/**
 * ============================================================================
 * USER - ALL PAYMENTS PAGE
 * ============================================================================
 * User dashboard page to view all their own payments
 * Shows accepted, rejected, and pending payments
 * Can download screenshots and see details
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  Filter,
  AlertCircle,
  Check,
  X,
  Clock,
  Eye,
  Search,
  Image as ImageIcon,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import apiClient from "../../utils/apiClient";

const UserAllPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "all", // all, pending, approved, rejected
    itemType: "all", // all, course, program
  });

  const [pagination, setPagination] = useState({
    limit: 25,
    offset: 0,
    total: 0,
  });

  const [expandedRow, setExpandedRow] = useState(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byType: {},
  });

  const getPaymentLabel = (payment) => {
    const type = String(payment?.itemType || "").toLowerCase();
    if (type === "program") return "Program";
    if (type === "course") return "Course";
    return "Payment";
  };

  const getItemTypeIcon = (payment) => {
    const type = String(payment?.itemType || "").toLowerCase();
    if (type === "program") return GraduationCap;
    if (type === "course") return BookOpen;
    return ImageIcon;
  };

  const formatAmount = (payment) => {
    const amount = payment?.amount;
    const currency = payment?.currency;
    if (amount === null || amount === undefined) return "—";

    const amountText = String(amount);
    return currency ? `${amountText} ${currency}` : amountText;
  };

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

  const expandedPayment = useMemo(
    () => payments.find((p) => p.id === expandedRow) || null,
    [payments, expandedRow],
  );

  useEffect(() => {
    if (!expandedPayment?.id) return;
    if (!expandedPayment?.hasScreenshot) return;
    fetchScreenshotPreview(expandedPayment.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedPayment?.id]);

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

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.itemType !== "all")
        params.append("itemType", filters.itemType);
      params.append("limit", pagination.limit);
      params.append("offset", pagination.offset);

      const response = await apiClient.get(
        `/user/payment-history/all?${params}`,
      );

      if (response.data.success) {
        setPayments(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch your payments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/user/payment-history/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.offset]);

  useEffect(() => {
    fetchStats();
  }, []);

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
    const Statuses = {
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: Check,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: X,
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
      },
    };

    const config = Statuses[status] || Statuses.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = pagination.offset / pagination.limit + 1;

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Payments</h1>
          <p className="text-gray-600">
            View all your payment history and download payment receipts
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">Total Payments</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.total || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <p className="text-sm text-green-600 mb-2">Approved</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.byStatus?.approved || 0}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <p className="text-sm text-yellow-600 mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.byStatus?.pending || 0}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <p className="text-sm text-red-600 mb-2">Rejected</p>
            <p className="text-3xl font-bold text-red-600">
              {stats.byStatus?.rejected || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filter</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Type
              </label>
              <select
                value={filters.itemType}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    itemType: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="program">Programs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <React.Fragment key={payment.id}>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                {(() => {
                                  const Icon = getItemTypeIcon(payment);
                                  return (
                                    <Icon className="w-5 h-5 text-blue-700" />
                                  );
                                })()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {payment?.item?.title || "Untitled"}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {getPaymentLabel(payment)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    #{payment.id}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {formatAmount(payment)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(payment.uploadDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                setExpandedRow(
                                  expandedRow === payment.id
                                    ? null
                                    : payment.id,
                                )
                              }
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedRow === payment.id && (
                          <tr className="bg-blue-50/50">
                            <td colSpan="5" className="px-6 py-4">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Preview */}
                                <div className="lg:col-span-1">
                                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <p className="text-sm font-semibold text-gray-900">
                                        Payment Preview
                                      </p>
                                      <span className="text-xs text-gray-500">
                                        {payment.hasScreenshot
                                          ? "Proof"
                                          : "No proof"}
                                      </span>
                                    </div>

                                    {payment.hasScreenshot ? (
                                      <div className="relative">
                                        <div className="w-full aspect-[4/3] rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                                          {screenshotPreviews[payment.id]
                                            ?.loading ? (
                                            <div className="text-center">
                                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                              <p className="text-xs text-gray-500">
                                                Loading preview...
                                              </p>
                                            </div>
                                          ) : screenshotPreviews[payment.id]
                                              ?.url ? (
                                            <img
                                              src={
                                                screenshotPreviews[payment.id]
                                                  .url
                                              }
                                              alt="Payment proof"
                                              className="w-full h-full object-contain"
                                            />
                                          ) : (
                                            <div className="text-center px-4">
                                              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                              <p className="text-xs text-gray-500">
                                                Preview unavailable
                                              </p>
                                              {screenshotPreviews[payment.id]
                                                ?.error ? (
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                  {
                                                    screenshotPreviews[
                                                      payment.id
                                                    ].error
                                                  }
                                                </p>
                                              ) : null}
                                            </div>
                                          )}
                                        </div>

                                        <button
                                          onClick={() =>
                                            handleDownload(payment.id)
                                          }
                                          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                        >
                                          <Download className="w-4 h-4" />
                                          Download Screenshot
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="w-full aspect-[4/3] rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-center px-4">
                                        <div>
                                          <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                          <p className="text-xs text-gray-500">
                                            No screenshot available for this
                                            payment.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Details */}
                                <div className="lg:col-span-2 space-y-4">
                                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-500 uppercase">
                                          Item
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 truncate">
                                          {payment?.item?.title || "Untitled"}
                                        </p>
                                        {payment?.item?.description ? (
                                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {payment.item.description}
                                          </p>
                                        ) : null}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <p className="text-xs font-medium text-gray-500 uppercase">
                                            Amount
                                          </p>
                                          <p className="text-lg font-bold text-gray-900">
                                            {formatAmount(payment)}
                                          </p>
                                        </div>
                                        {getStatusBadge(payment.status)}
                                      </div>
                                    </div>
                                  </div>

                                  {payment.rejectionReason ? (
                                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                      <p className="text-xs font-medium text-red-700 uppercase mb-2">
                                        Rejection Reason
                                      </p>
                                      <p className="text-red-800">
                                        {payment.rejectionReason}
                                      </p>
                                    </div>
                                  ) : null}

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                        Transaction ID
                                      </p>
                                      <p className="text-gray-900 font-mono text-sm break-all">
                                        {payment.transactionId || "N/A"}
                                      </p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                        Verification Date
                                      </p>
                                      <p className="text-gray-900 text-sm">
                                        {payment.verificationDate
                                          ? new Date(
                                              payment.verificationDate,
                                            ).toLocaleDateString()
                                          : "Pending"}
                                      </p>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                        Upload Date
                                      </p>
                                      <p className="text-gray-900 text-sm">
                                        {new Date(
                                          payment.uploadDate,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {pagination.offset + 1} to{" "}
                  {Math.min(
                    pagination.offset + pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} payments
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        offset: Math.max(0, prev.offset - prev.limit),
                      }))
                    }
                    disabled={pagination.offset === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        offset: prev.offset + prev.limit,
                      }))
                    }
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAllPaymentsPage;
