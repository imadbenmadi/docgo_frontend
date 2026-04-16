import { useRef, useState } from "react";
import ValidationErrorPanel from "../Common/FormValidation/ValidationErrorPanel";
import { useFormValidation } from "../Common/FormValidation/useFormValidation";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
];
const MAX_SIZE_MB = 10;

const BaridiMobForm = ({ onSubmit }) => {
    const fileInputRef = useRef(null);
    const [receiptFile, setReceiptFile] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [fileError, setFileError] = useState(null);
    const {
        errors: panelErrors,
        showPanel,
        validate,
        hidePanel,
    } = useFormValidation();

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        event.target.value = null;
        if (!file) return;

        // Validate type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFileError("Please upload a valid file (JPG, PNG, or PDF)");
            setReceiptFile(null);
            setFileName(null);
            return;
        }

        // Validate size
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setFileError(`File must be smaller than ${MAX_SIZE_MB}MB`);
            setReceiptFile(null);
            setFileName(null);
            return;
        }

        setFileError(null);
        setReceiptFile(file);
        setFileName(file.name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const isValid = validate([
            {
                field: "Payment Receipt",
                message:
                    "Please upload your payment receipt (JPG, PNG, or PDF)",
                section: "Payment Proof",
                scrollToId: "baridi-file-upload",
                condition: !receiptFile,
            },
        ]);

        if (!isValid) return;

        onSubmit?.({ receiptFile });
    };

    return (
        <main className="max-w-[400px] mx-auto p-4 flex flex-col justify-start">
            <ValidationErrorPanel
                errors={panelErrors}
                isVisible={showPanel}
                onClose={hidePanel}
                title="Complete payment form"
            />

            <header className="w-full mb-6">
                <h1 className="text-3xl font-semibold text-zinc-800">
                    Processus de paiement
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                    N&apos;hésitez pas, complétez votre processus de paiement et
                    commencez votre voyage maintenant avec nous
                </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <section
                    id="baridi-file-upload"
                    className={`flex flex-col items-center p-6 text-sm text-center rounded-2xl border-2 border-dashed transition-colors ${
                        fileError
                            ? "border-red-500 bg-red-50"
                            : receiptFile
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-blue-600"
                    }`}
                    aria-labelledby="upload-title"
                >
                    <h2 id="upload-title" className="text-zinc-800 font-medium">
                        Télécharger le reçu de paiement
                    </h2>

                    {receiptFile ? (
                        <p className="mt-2 text-emerald-700 font-semibold text-sm break-all max-w-[280px]">
                             {fileName}
                        </p>
                    ) : (
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/90d6207c9595f421b21f613a50561a7aa8316d57879a833387e2269fc2ae6a1d?placeholderIfAbsent=true&apiKey=ce15f09aba8c461ea95db36c370d18d3"
                            alt="Upload icon"
                            className="object-contain mt-2 w-8 aspect-square"
                        />
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleFileChange}
                        aria-label="File upload input"
                    />
                    <button
                        type="button"
                        onClick={handleFileSelect}
                        className="mt-2 font-semibold text-blue-600 underline underline-offset-auto cursor-pointer text-sm"
                    >
                        {receiptFile
                            ? "Changer le fichier"
                            : "sélectionnez le fichier"}
                    </button>
                    <p className="mt-1 text-xs text-gray-500">
                        JPG, PNG ou PDF  max {MAX_SIZE_MB}MB
                    </p>
                </section>

                {fileError && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                        <span></span> {fileError}
                    </p>
                )}

                <button
                    className="w-full px-6 py-2 mt-2 text-sm font-semibold text-sky-50 bg-blue-500 rounded-[56px] hover:bg-blue-600 transition-colors"
                    type="submit"
                >
                    Terminer le paiement
                </button>
            </form>
        </main>
    );
};

export default BaridiMobForm;
