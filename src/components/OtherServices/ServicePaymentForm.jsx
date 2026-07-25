import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaInfoCircle, FaSpinner, FaUpload } from "react-icons/fa";
import apiClient from "../../utils/apiClient";
import { useAppContext } from "../../AppContext";
import RichTextDisplay from "../Common/RichTextEditor/RichTextDisplay";

/**
 * Self-contained CCP payment form for "Other Services" (CV creation & internships).
 * Posts a multipart request (screenshot + fields) to the other-services payment
 * endpoints and reports success via onSuccess.
 */
export default function ServicePaymentForm({
  serviceType, // "cv" | "internship"
  internshipId,
  amount,
  currency = "DZD",
  showContent = true,
  contentLabel,
  defaultContent = "",
  onSuccess,
}) {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [ccpNumber, setCcpNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [content, setContent] = useState(defaultContent);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [ccpInfo, setCcpInfo] = useState(null); // admin CCP account details
  const fileInputRef = useRef(null);

  // Load the admin-configured CCP account details (where the user transfers to)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get("/payment/info");
        if (active && res.data?.success) setCcpInfo(res.data.data?.ccp || null);
      } catch {
        // non-fatal: form still works without the displayed account details
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const validate = () => {
    const e = {};
    if (!ccpNumber.trim())
      e.ccpNumber = t("servicePayment.vCcpRequired", "CCP number is required");
    else if (!/^\d+$/.test(ccpNumber.trim()))
      e.ccpNumber = t(
        "servicePayment.vCcpDigits",
        "CCP number must contain only digits",
      );
    if (!file)
      e.file = t("servicePayment.vReceiptRequired", "Payment receipt is required");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (event) => {
    const f = event.target.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setErrors((p) => ({
        ...p,
        file: t("servicePayment.vFileType", "Upload a JPG, PNG or PDF"),
      }));
      event.target.value = null;
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrors((p) => ({
        ...p,
        file: t("servicePayment.vFileSize", "File must be under 10MB"),
      }));
      event.target.value = null;
      return;
    }
    setFile(f);
    setFileName(f.name);
    setErrors((p) => ({ ...p, file: "" }));
    event.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("ccpNumber", ccpNumber.trim());
      if (phoneNumber) fd.append("phoneNumber", phoneNumber);
      if (showContent && content) fd.append("content", content);
      fd.append("screenshot", file);

      let endpoint;
      if (serviceType === "internship") {
        fd.append("internshipId", internshipId);
        endpoint = "/other-services/internship-payment";
      } else {
        endpoint = "/other-services/cv-payment";
      }

      const res = await apiClient.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Payment failed");
      }
      onSuccess?.(res.data.data);
    } catch (err) {
      setErrors((p) => ({
        ...p,
        submit:
          err.response?.data?.message ||
          err.message ||
          t("servicePayment.submitFailed", "Failed to submit payment"),
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount banner */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <span className="font-semibold text-green-900">
          {t("servicePayment.amountToPay", "Amount to pay (CCP)")}
        </span>
        <span className="font-bold text-2xl text-green-600">
          {amount} {currency}
        </span>
      </div>

      {/* Admin CCP account details — where to transfer the money */}
      {ccpInfo && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-5">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FaInfoCircle className="text-green-600" />
            {t("servicePayment.transferTo", "Transfer to this account")}
          </h4>
          <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-gray-600 font-medium">
                {t("servicePayment.accountNumber", "Account number")}
              </span>
              <span className="font-mono font-bold text-gray-900">
                {ccpInfo.accountNumber || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-gray-600 font-medium">
                {t("servicePayment.accountName", "Account name")}
              </span>
              <span className="font-semibold text-gray-900">
                {ccpInfo.accountName || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-gray-600 font-medium">
                {t("servicePayment.rib", "RIB")}
              </span>
              <span className="font-mono text-gray-900">
                {ccpInfo.rib || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">
                {t("servicePayment.bank", "Bank")}
              </span>
              <span className="font-medium text-gray-900">
                {ccpInfo.bankName ||
                  t("servicePayment.bankFallback", "Algeria Post CCP")}
              </span>
            </div>
          </div>
          {ccpInfo.instructions ? (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-900 mb-1">
                {t("servicePayment.instructions", "Instructions")}
              </p>
              <RichTextDisplay
                content={ccpInfo.instructions}
                textClassName="text-sm text-green-800"
              />
            </div>
          ) : null}
        </div>
      )}

      {showContent && (
        <div>
          <label className="block font-semibold mb-2">
            {contentLabel || t("servicePayment.yourInfo", "Your information")}
          </label>
          <textarea
            value={content}
            onChange={(ev) => setContent(ev.target.value)}
            rows={6}
            placeholder={t(
              "servicePayment.contentPlaceholder",
              "Write your information here...",
            )}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("servicePayment.ccpNumber", "CCP number")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={ccpNumber}
            onChange={(ev) => setCcpNumber(ev.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.ccpNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="00799999000123456789"
          />
          {errors.ccpNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.ccpNumber}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("servicePayment.phoneNumber", "Phone number")}
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(ev) => setPhoneNumber(ev.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0550 12 34 56"
          />
        </div>
      </div>

      {/* Receipt upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("servicePayment.receipt", "Payment receipt")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <label
          htmlFor="os-receipt-upload"
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition ${
            errors.file
              ? "border-red-500 bg-red-50"
              : fileName
                ? "border-green-500 bg-green-100"
                : "border-green-500 bg-green-50 hover:bg-green-100"
          }`}
        >
          <div className="flex flex-col items-center text-center px-4">
            {fileName ? (
              <>
                <FaCheckCircle className="w-10 h-10 mb-2 text-green-600" />
                <p className="text-sm font-semibold text-green-700 break-all">
                  {fileName}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  {t("servicePayment.clickToChange", "Click to change")}
                </p>
              </>
            ) : (
              <>
                <FaUpload className="w-10 h-10 mb-2 text-green-600" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {t("servicePayment.clickToUpload", "Click to upload")}
                  </span>{" "}
                  {t("servicePayment.yourReceipt", "your receipt")}
                </p>
                <p className="text-xs text-gray-500">
                  {t("servicePayment.fileHint", "JPG, PNG or PDF (max 10MB)")}
                </p>
              </>
            )}
          </div>
          <input
            id="os-receipt-upload"
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileChange}
          />
        </label>
        {errors.file && (
          <p className="mt-1 text-sm text-red-600 text-center">{errors.file}</p>
        )}
      </div>

      {errors.submit && (
        <p className="text-sm text-red-600 text-center">{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <FaSpinner className="animate-spin" />{" "}
            {t("servicePayment.submitting", "Submitting payment...")}
          </>
        ) : (
          <>
            <FaCheckCircle />{" "}
            {t("servicePayment.submitBtn", "Submit payment for verification")}
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 text-center">
        {t(
          "servicePayment.confirmNotice",
          "By submitting, you confirm you have completed the CCP transfer and uploaded a valid receipt. Our team will verify within 24-48h.",
        )}
      </p>
    </form>
  );
}

ServicePaymentForm.propTypes = {
  serviceType: PropTypes.oneOf(["cv", "internship"]).isRequired,
  internshipId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  currency: PropTypes.string,
  showContent: PropTypes.bool,
  contentLabel: PropTypes.string,
  defaultContent: PropTypes.string,
  onSuccess: PropTypes.func,
};
