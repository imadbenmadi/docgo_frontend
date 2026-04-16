import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { FaUpload, FaSpinner, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaPhone, FaEnvelope, FaCreditCard, FaReceipt } from "react-icons/fa";
import RichTextDisplay from "../Common/RichTextDisplay";
import { PaymentAPI } from "../../API/Payment";
import { useAppContext } from "../../AppContext";

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
    const { user } = useAppContext();
    const [existingApplication, setExistingApplication] = useState(null);
    const [checkingApplication, setCheckingApplication] = useState(true);
    const [paymentForm, setPaymentForm] = useState({
        fullName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
        ccpNumber: "",
        transferReference: "",
        phoneNumber: user?.phoneNumber || "",
        email: user?.email || "",
    });
    const [receiptFile, setReceiptFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    // Check for existing payment application
    useEffect(() => {
        const checkExistingApplication = async () => {
            if (!itemData?.id) return;
            
            try {
                setCheckingApplication(true);
                const response = await PaymentAPI.checkPaymentApplication(
                    itemType,
                    itemData.id
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

        if (!paymentForm.transferReference.trim()) {
            newErrors.transferReference = "Transfer reference is required";
        }

        if (!paymentForm.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^[\d\s\-\+\(\)]+$/.test(paymentForm.phoneNumber)) {
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
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    receiptFile: "File size must be less than 5MB",
                }));
                return;
            }

            setReceiptFile(file);
            setFileName(file.name);
            setErrors((prev) => ({ ...prev, receiptFile: "" }));
        }
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
                    transferReference: paymentForm.transferReference,
                    fullName: paymentForm.fullName,
                    phoneNumber: paymentForm.phoneNumber,
                    email: paymentForm.email,
                },
                receiptFile
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
                reference: paymentForm.transferReference,
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
                } catch (cleanupError) {
                }
            }

            onError(error);
        } finally {
            setLoading(false);
        }
    };

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

            {/* Payment Instructions - Rich Text or Default */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-green-600 mt-1" />
                    <div className="flex-1">
                        <h4 className="font-medium text-green-900 mb-2">
                            Payment Instructions
                        </h4>
                        {paymentConfig?.instructions ? (
                            <RichTextDisplay
                                content={paymentConfig.instructions}
                                className="text-sm"
                                textClassName="text-green-800"
                            />
                        ) : (
                            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                                <li>Transfer the amount to our CCP account</li>
                                <li>
                                    Prenez une photo ou scannez votre reçu de
                                    paiement
                                </li>
                                <li>
                                    Remplissez le formulaire ci-dessous et téléchargez votre
                                    reçu
                                </li>
                                <li>
                                    Nous vérifierons votre paiement dans les 24 heures
                                </li>
                                <li>
                                    Vous recevrez l'accès au cours après
                                    vérification
                                </li>
                            </ol>
                        )}
                    </div>
                </div>
            </div>

            {/* CCP Account Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                    Transfer Details
                </h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-mono font-medium">
                            {ccpAccountDetails.accountNumber}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-medium">
                            {ccpAccountDetails.accountName}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">RIB:</span>
                        <span className="font-mono font-medium">
                            {ccpAccountDetails.rib}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">
                            {ccpAccountDetails.bankName}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-lg text-green-600">
                            {amount} {currency}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleCCPPayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={paymentForm.fullName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="ccpNumber"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Your CCP Account Number *
                        </label>
                        <input
                            type="text"
                            id="ccpNumber"
                            name="ccpNumber"
                            value={paymentForm.ccpNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Your CCP account number"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="transferReference"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Transfer Reference Number *
                        </label>
                        <input
                            type="text"
                            id="transferReference"
                            name="transferReference"
                            value={paymentForm.transferReference}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Transfer reference from receipt"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={paymentForm.phoneNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Your phone number"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={paymentForm.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your email address"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Receipt * (JPG, PNG, or PDF, max 5MB)
                    </label>
                    <div
                        onClick={handleFileSelect}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors"
                    >
                        <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                        <p className="text-gray-600">
                            {fileName ? (
                                <span className="text-green-600 font-medium">
                                    {fileName}
                                </span>
                            ) : (
                                "Click to upload your payment receipt"
                            )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Supported formats: JPG, PNG, PDF (max 5MB)
                        </p>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={
                        loading ||
                        !receiptFile ||
                        !paymentForm.fullName ||
                        !paymentForm.ccpNumber ||
                        !paymentForm.transferReference
                    }
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            <span>Submitting Payment...</span>
                        </>
                    ) : (
                        <>
                            <span>Submit Payment for Verification</span>
                        </>
                    )}
                </button>
            </form>

            {/* Security Notice */}
            <div className="text-xs text-gray-500 text-center">
                <p>
                    ' Your payment information is secure and will be verified
                    within 24 hours
                </p>
            </div>
        </div>
    );
};

CCPPayment.propTypes = {
    itemData: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    itemType: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    currency: PropTypes.string.isRequired,
    paymentConfig: PropTypes.shape({
        accountNumber: PropTypes.string,
        accountName: PropTypes.string,
        rib: PropTypes.string,
        bankName: PropTypes.string,
        instructions: PropTypes.string,
    }),
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    setLoading: PropTypes.func.isRequired,
};

export default CCPPayment;
