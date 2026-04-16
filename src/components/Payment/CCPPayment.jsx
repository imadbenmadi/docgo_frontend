import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSpinner,
  FaTag,
  FaTimesCircle,
  FaUpload,
} from "react-icons/fa";
import { PaymentAPI } from "../../API/Payment";
import { useAppContext } from "../../AppContext";
import RichTextDisplay from "../Common/RichTextDisplay";
import ValidationErrorPanel from "../Common/FormValidation/ValidationErrorPanel";
import { useFormValidation } from "../Common/FormValidation/useFormValidation";

const CCPPayment = ({
  itemData,
  itemType,
  amount,
  currency,
  paymentConfig,
  onSuccess,
  onError,
  loading,
  setLoading,
}) => {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const {
    errors: panelErrors,
    showPanel,
    validate: runPanelValidation,
    hidePanel,
  } = useFormValidation();
  const [existingApplication, setExistingApplication] = useState(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [paymentForm, setPaymentForm] = useState({
    fullName: user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "",
    ccpNumber: "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponResult, setCouponResult] = useState(null); // null | coupon object
  const [couponError, setCouponError] = useState("");

  // Discounted amount
  const displayAmount = useMemo(() => {
    const num = parseFloat(amount);
    if (!couponResult || isNaN(num)) return num;
    if (couponResult.discountType === "percentage") {
      return Math.max(
        0,
        num - (num * couponResult.discountValue) / 100,
      ).toFixed(2);
    }
    return Math.max(0, num - couponResult.discountValue).toFixed(2);
  }, [amount, couponResult]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    setCouponError("");
    setCouponResult(null);
    const res = await PaymentAPI.validateCoupon(couponCode.trim(), itemType);
    setCouponValidating(false);
    if (res.success) {
      setCouponResult(res.data.coupon || res.data);
    } else {
      setCouponError(res.message || "Coupon invalide");
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
    setCouponError("");
  };

  // Check for existing payment application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!itemData?.id) return;

      try {
        setCheckingApplication(true);
        const response = await PaymentAPI.checkPaymentApplication(
          itemType,
          itemData.id,
        );

        if (response.success && response.data.hasApplication) {
          setExistingApplication(response.data);
        }
      } catch (error) {
      } finally {
        setCheckingApplication(false);
      }
    };

    checkExistingApplication();
  }, [itemData?.id, itemType]);

  // CCP account details from configuration
  const ccpAccountDetails = {
    accountNumber: paymentConfig?.accountNumber || "Not configured",
    accountName: paymentConfig?.accountName || "Not configured",
    rib: paymentConfig?.rib || "Not configured",
    bankName: paymentConfig?.bankName || "Algeria Post CCP",
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentForm.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!paymentForm.ccpNumber.trim()) {
      newErrors.ccpNumber = "CCP number is required";
    } else if (!/^\d+$/.test(paymentForm.ccpNumber)) {
      newErrors.ccpNumber = "CCP number must contain only digits";
    }

    if (!paymentForm.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[\d\s\-+()]+$/.test(paymentForm.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    if (!paymentForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentForm.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!receiptFile) {
      newErrors.receiptFile = "Payment receipt is required";
    }

    setErrors(newErrors);

    // Also populate the summary panel with the same issues
    const panelRules = [
      {
        field: "Full Name",
        message: newErrors.fullName,
        section: "Your Information",
        scrollToId: "fullName",
        condition: !!newErrors.fullName,
      },
      {
        field: "CCP Number",
        message: newErrors.ccpNumber,
        section: "Your Information",
        scrollToId: "ccpNumber",
        condition: !!newErrors.ccpNumber,
      },
      {
        field: "Phone Number",
        message: newErrors.phoneNumber,
        section: "Your Information",
        scrollToId: "phoneNumber",
        condition: !!newErrors.phoneNumber,
      },
      {
        field: "Email",
        message: newErrors.email,
        section: "Your Information",
        scrollToId: "email",
        condition: !!newErrors.email,
      },
      {
        field: "Receipt File",
        message: newErrors.receiptFile,
        section: "Payment Receipt",
        scrollToId: "receipt-upload",
        condition: !!newErrors.receiptFile,
      },
    ].filter((r) => r.condition);

    runPanelValidation(panelRules.length > 0 ? panelRules : []);

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileSelect = () => {
    // Reset the input value before opening file picker
    // This allows selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          receiptFile: "Please upload a valid file (JPG, PNG, or PDF)",
        }));
        // Reset file input
        event.target.value = null;
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          receiptFile: "File size must be less than 50MB",
        }));
        // Reset file input
        event.target.value = null;
        return;
      }

      setReceiptFile(file);
      setFileName(file.name);
      setErrors((prev) => ({ ...prev, receiptFile: "" }));
    }
    // Reset file input value to allow selecting the same file again
    event.target.value = null;
  };

  const handleCCPPayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare payment data
      const paymentData = {
        itemType,
        itemId: itemData?.id,
        itemName: itemData?.Title || itemData?.title,
        description: `${
          itemType.charAt(0).toUpperCase() + itemType.slice(1)
        }: ${itemData?.Title || itemData?.title}`,
      };

      // Create CCP payment with screenshot
      const paymentResult = await PaymentAPI.createCCPPayment(
        paymentData,
        {
          ccpNumber: paymentForm.ccpNumber,
          fullName: paymentForm.fullName,
          phoneNumber: paymentForm.phoneNumber,
          email: paymentForm.email,
          couponCode: couponResult ? couponCode : undefined,
        },
        receiptFile,
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.message);
      }

      // Show success with the actual payment result
      const successPayment = {
        paymentId: paymentResult.data.paymentId,
        method: "ccp",
        amount: paymentResult.data.amount,
        currency: paymentResult.data.currency,
        status: paymentResult.data.status || "pending_verification",
        itemId: itemData?.id,
        itemType,
        receiptFileName: receiptFile.name,
      };

      onSuccess(successPayment);
    } catch (error) {
      // If payment upload failed, attempt cleanup to remove any uploaded file
      if (itemData?.id) {
        try {
          await PaymentAPI.cleanupCCPPayment({
            itemType,
            itemId: itemData.id,
          });
        } catch (cleanupError) {}
      }

      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: FaClock,
        text: "Pending Verification",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
      },
      approved: {
        icon: FaCheckCircle,
        text: "Approved",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      },
      rejected: {
        icon: FaTimesCircle,
        text: "Rejected",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
      },
      cancelled: {
        icon: FaTimesCircle,
        text: "Cancelled",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        borderColor: "border-gray-200",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      >
        <Icon className="text-sm" />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading state while checking for existing application
  if (checkingApplication) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-3xl text-green-600" />
        <span className="ml-3 text-gray-600">Checking payment status...</span>
      </div>
    );
  }

  // Show existing application if found and not rejected/cancelled
  if (
    existingApplication?.hasApplication &&
    !existingApplication?.canSubmitNew
  ) {
    const app = existingApplication.application;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Algeria CCP Payment
          </h3>
        </div>

        {/* Existing Application Status */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <FaInfoCircle className="text-blue-600 text-2xl mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 text-lg mb-3">
                Payment Application Already Submitted
              </h4>
              <p className="text-blue-800 mb-4">
                You have already submitted a payment application for this item.
                You cannot submit another payment until the current one is
                processed.
              </p>

              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Status:</span>
                  {getStatusBadge(app.status)}
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Amount:</span>
                  <span className="font-bold text-gray-900">
                    {app.amount} {app.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">CCP Number:</span>
                  <span className="font-mono text-gray-900">
                    {app.ccpNumber}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    Transaction ID:
                  </span>
                  <span className="font-mono text-gray-900">
                    {app.transactionId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Submitted:</span>
                  <span className="text-gray-900">
                    {formatDate(app.createdAt)}
                  </span>
                </div>

                {app.status === "pending" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-yellow-600" />
                      <span className="text-yellow-800 text-sm">
                        Your payment is being verified by our team. This usually
                        takes 24-48 hours.
                      </span>
                    </div>
                  </div>
                )}

                {app.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="text-red-600 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium text-sm mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-red-700 text-sm">
                          {app.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Error Panel */}
      <ValidationErrorPanel
        errors={panelErrors}
        isVisible={showPanel}
        onClose={hidePanel}
        title="Please fix the payment form"
      />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          {t("paymentPage.ccpPaymentForm.title", "CCP Algeria Payment")}
        </h3>
      </div>

      {/* Payment Instructions - Rich Text or Default */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-green-600 mt-1" />
          <div className="flex-1">
            <h4 className="font-medium text-green-900 mb-2">
              {t(
                "paymentPage.ccpPaymentForm.paymentInstructions",
                "Payment Instructions",
              )}
            </h4>
            {paymentConfig?.instructions ? (
              <RichTextDisplay
                content={paymentConfig.instructions}
                className="text-sm"
                textClassName="text-green-800"
              />
            ) : (
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>
                  {t(
                    "paymentPage.ccpPaymentForm.instruction1",
                    "Transfer the amount to our CCP account",
                  )}
                </li>
                <li>
                  {t(
                    "paymentPage.ccpPaymentForm.instruction2",
                    "Take a photo or scan your payment receipt",
                  )}
                </li>
                <li>
                  {t(
                    "paymentPage.ccpPaymentForm.instruction3",
                    "Fill in the form below and upload your receipt",
                  )}
                </li>
                <li>
                  {t(
                    "paymentPage.ccpPaymentForm.instruction4",
                    "We will verify your payment within 24 hours",
                  )}
                </li>
                <li>
                  {t(
                    "paymentPage.ccpPaymentForm.instruction5",
                    "You will receive course access after verification",
                  )}
                </li>
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* CCP Account Details */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-5 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
          <FaInfoCircle className="text-green-600" />
          {t(
            "paymentPage.ccpPaymentForm.transferToAccount",
            "Transfer to this account",
          )}
        </h4>
        <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600 font-medium">
              {t("paymentPage.ccpPaymentForm.accountNumber", "Account Number")}:
            </span>
            <span className="font-mono font-bold text-gray-900 text-lg">
              {ccpAccountDetails.accountNumber}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600 font-medium">
              {t("paymentPage.ccpPaymentForm.accountName", "Account Name")}:
            </span>
            <span className="font-semibold text-gray-900">
              {ccpAccountDetails.accountName}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600 font-medium">
              {t("paymentPage.ccpPaymentForm.rib", "RIB")}:
            </span>
            <span className="font-mono font-medium text-gray-900">
              {ccpAccountDetails.rib}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600 font-medium">
              {t("paymentPage.ccpPaymentForm.bank", "Bank")}:
            </span>
            <span className="font-medium text-gray-900">
              {ccpAccountDetails.bankName}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 bg-green-50 -mx-4 px-4 rounded-b-lg">
            <span className="text-gray-700 font-semibold text-lg">
              {t("paymentPage.ccpPaymentForm.amountToPay", "Amount to Pay")}:
            </span>
            <div className="text-right">
              {couponResult && (
                <p className="text-sm text-gray-400 line-through">
                  {amount} {currency}
                </p>
              )}
              <span className="font-bold text-2xl text-green-600">
                {displayAmount} {currency}
              </span>
              {couponResult && (
                <p className="text-xs text-green-700 font-medium">
                  Code : {couponResult.code}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coupon code section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-5 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FaTag className="text-green-600" />
          Code promo (optionnel)
        </h4>
        {couponResult ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-lg px-4 py-3">
            <FaCheckCircle className="text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Coupon appliqué :{" "}
                <span className="font-mono">{couponResult.code}</span>
              </p>
              <p className="text-xs text-green-700">
                {couponResult.discountType === "percentage"
                  ? `${couponResult.discountValue}% de réduction`
                  : `${couponResult.discountValue} ${currency} de réduction`}
              </p>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-gray-400 hover:text-red-500 text-sm underline"
            >
              Retirer
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleValidateCoupon())
                }
                placeholder="Ex. XXXX-XXXX"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleValidateCoupon}
                disabled={!couponCode.trim() || couponValidating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
              >
                {couponValidating ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Vérifier"
                )}
              </button>
            </div>
            {couponError && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <FaTimesCircle />
                {couponError}
              </p>
            )}
          </>
        )}
      </div>

      {/* Payment Form */}
      <form onSubmit={handleCCPPayment} className="space-y-5">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4 text-lg">
            {t(
              "paymentPage.ccpPaymentForm.yourInformation",
              "Your Information",
            )}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("paymentPage.ccpPaymentForm.fullName", "Full Name")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={paymentForm.fullName}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t(
                  "paymentPage.ccpPaymentForm.fullNamePlaceholder",
                )}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* CCP Number */}
            <div>
              <label
                htmlFor="ccpNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("paymentPage.ccpPaymentForm.ccpNumber", "CCP Number")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ccpNumber"
                name="ccpNumber"
                value={paymentForm.ccpNumber}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-mono ${
                  errors.ccpNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t(
                  "paymentPage.ccpPaymentForm.ccpNumberPlaceholder",
                )}
              />
              {errors.ccpNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.ccpNumber}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("paymentPage.ccpPaymentForm.phoneNumber", "Phone Number")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={paymentForm.phoneNumber}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t(
                  "paymentPage.ccpPaymentForm.phoneNumberPlaceholder",
                )}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t("paymentPage.ccpPaymentForm.email", "Email Address")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={paymentForm.email}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t(
                  "paymentPage.ccpPaymentForm.emailPlaceholder",
                  "your.email@example.com",
                )}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Display */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4 text-lg">
            {t("paymentPage.profileInformation", "Profile Information")}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">
                {t("paymentPage.university", "University / Institution")}
              </p>
              <p className="text-base font-medium text-gray-900">
                {user?.university ||
                  t("paymentPage.notProvided", "Not provided")}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">
                {t("paymentPage.professionalStatus", "Professional Status")}
              </p>
              <p className="text-base font-medium text-gray-900">
                {user?.professionalStatus
                  ? t(
                      `paymentPage.${user.professionalStatus}`,
                      user.professionalStatus,
                    )
                  : t("paymentPage.notProvided", "Not provided")}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">
                {t("paymentPage.academicStatus", "Academic Status")}
              </p>
              <p className="text-base font-medium text-gray-900">
                {user?.academicStatus
                  ? t(`paymentPage.${user.academicStatus}`, user.academicStatus)
                  : t("paymentPage.notProvided", "Not provided")}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-4">
            <i>
              {t(
                "paymentPage.editProfileInfo",
                "To update this information, please edit your profile",
              )}
            </i>
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4 text-lg">
            {t(
              "paymentPage.ccpPaymentForm.uploadReceiptRequired",
              "Upload Payment Receipt *",
            )}
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="receipt-upload"
                className={`flex flex-col items-center justify-center w-full h-48 border-3 border-dashed rounded-lg cursor-pointer transition-all ${
                  errors.receiptFile
                    ? "border-red-500 bg-red-50 hover:bg-red-100"
                    : "border-green-500 bg-green-50 hover:bg-green-100"
                } ${fileName ? "border-solid bg-green-100" : ""}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  {fileName ? (
                    <>
                      <FaCheckCircle className="w-12 h-12 mb-3 text-green-600" />
                      <p className="mb-2 text-sm font-semibold text-green-700">
                        {t(
                          "paymentPage.ccpPaymentForm.fileSelected",
                          "File selected:",
                        )}
                      </p>
                      <p className="text-sm text-green-600 break-all">
                        {fileName}
                      </p>
                      <p className="text-xs text-green-500 mt-2">
                        {t(
                          "paymentPage.ccpPaymentForm.clickToChange",
                          "Click to change file",
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-12 h-12 mb-3 text-green-600" />
                      <p className="mb-2 text-sm text-gray-700">
                        <span className="font-semibold">
                          {t(
                            "paymentPage.ccpPaymentForm.clickToUpload",
                            "Click to upload",
                          )}
                        </span>{" "}
                        {t(
                          "paymentPage.ccpPaymentForm.yourReceipt",
                          "your receipt",
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t(
                          "paymentPage.ccpPaymentForm.acceptedFormats",
                          "JPG, PNG or PDF (MAX. 5MB)",
                        )}
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="receipt-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {errors.receiptFile && (
              <p className="text-sm text-red-600 text-center">
                {errors.receiptFile}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin text-xl" />
              <span>
                {t(
                  "paymentPage.ccpPaymentForm.submittingPayment",
                  "Submitting payment...",
                )}
              </span>
            </>
          ) : (
            <>
              <FaCheckCircle className="text-xl" />
              <span>
                {t(
                  "paymentPage.ccpPaymentForm.submitForVerification",
                  "Submit Payment for Verification",
                )}
              </span>
            </>
          )}
        </button>

        <p className="text-sm text-gray-600 text-center">
          {t(
            "paymentPage.ccpPaymentForm.confirmationMessage",
            "By submitting this form, you confirm that you have completed the CCP transfer and uploaded a valid payment receipt for verification.",
          )}
        </p>
      </form>
    </div>
  );
};

CCPPayment.propTypes = {
  itemData: PropTypes.object.isRequired,
  itemType: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string.isRequired,
  paymentConfig: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
};

export default CCPPayment;
