import { FaCheck } from "react-icons/fa";

const PaymentMethodSelector = ({ methods, selectedMethod, onMethodChange }) => {
    return (
        <div className="grid gap-4">
            {methods.map((method) => (
                <button
                    key={method.id}
                    onClick={() => onMethodChange(method.id)}
                    disabled={!method.available}
                    className={`
                        relative p-4 border-2 rounded-lg transition-all duration-200
                        ${
                            selectedMethod === method.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                        }
                        ${
                            !method.available
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                        }
                    `}
                >
                    <div className="flex items-center gap-4">
                        {/* Method Icon */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {method.icon ? (
                                <img
                                    src={method.icon}
                                    alt={method.name}
                                    className="w-8 h-8 object-contain"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                            )}
                        </div>

                        {/* Method Info */}
                        <div className="flex-1 text-left">
                            <h3 className="font-medium text-gray-900">
                                {method.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {method.description}
                            </p>
                            {!method.available && (
                                <p className="text-xs text-red-500 mt-1">
                                    Currently unavailable
                                </p>
                            )}
                        </div>

                        {/* Selection Indicator */}
                        <div
                            className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                            ${
                                selectedMethod === method.id
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-300"
                            }
                        `}
                        >
                            {selectedMethod === method.id && (
                                <FaCheck className="text-white text-xs" />
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default PaymentMethodSelector;
