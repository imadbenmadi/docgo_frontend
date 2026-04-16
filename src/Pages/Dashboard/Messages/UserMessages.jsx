import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    EnvelopeIcon,
    PlusIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useAppContext } from "../../../AppContext";
import apiClient from "../../../services/apiClient";
import { RichTextDisplay } from "../../../components/Common/RichTextEditor";

const UserMessages = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAppContext();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);

    const isRTL = i18n.language === "ar";

    useEffect(() => {
        const fetchUserMessages = async () => {
            try {
                setLoading(true);
                // Using the correct API endpoint from Contact.routes.js
                const response = await apiClient.get(
                    `/contact/user/${user.id}/messages`
                );
                if (response.data.success) {
                    setMessages(response.data.data.messages || []);
                }
            } catch (error) {
                // For now, use empty array if endpoint doesn't exist yet
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchUserMessages();
        }
    }, [user?.id]);

    const handleViewMessage = (message) => {
        setSelectedMessage(message);
        setShowMessageModal(true);
    };

    const handleCloseModal = () => {
        setShowMessageModal(false);
        setSelectedMessage(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "unread":
                return (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                );
            case "read":
                return <ClockIcon className="h-5 w-5 text-blue-500" />;
            case "responded":
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            default:
                return <EnvelopeIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "unread":
                return t("messages.status.unread", "New");
            case "read":
                return t("messages.status.read", "Read");
            case "responded":
                return t("messages.status.responded", "Responded");
            default:
                return status;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "text-red-600 bg-red-50";
            case "medium":
                return "text-yellow-600 bg-yellow-50";
            case "low":
                return "text-green-600 bg-green-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    return (
        <div className={`min-h-screen p-6 ${isRTL ? "rtl" : "ltr"}`}>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <ChatBubbleLeftRightIcon className="h-7 w-7 text-blue-600 mr-3" />
                            {t("messages.title", "Mes Messages")}
                        </h1>
                        <p className="mt-1 text-gray-600">
                            {t(
                                "messages.subtitle",
                                "voir votre messagerie avec notre équipe de support",
                            )}
                        </p>
                    </div>
                    <Link
                        to="/dashboard/messages/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        {t("messages.newMessage", "New Message")}
                    </Link>
                </div>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-lg shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">
                            {t("messages.loading", "Loading messages...")}
                        </p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="p-8 text-center">
                        
                        <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t("messages.noMessages", "No messages yet")}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {t(
                                "messages.noMessagesText",
                                "You haven't sent any messages to our support team yet.",
                            )}
                        </p>
                        <Link
                            to="/dashboard/messages/new"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            {t(
                                "messages.sendFirst",
                                "Envoyer votre premier message",
                            )}
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`p-6 hover:bg-gray-50 transition-colors ${
                                    message.status === "unread"
                                        ? "bg-blue-50"
                                        : ""
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(message.status)}
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {message.subject ||
                                                    t(
                                                        "messages.generalInquiry",
                                                        "General Inquiry",
                                                    )}
                                            </h3>
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                                    message.priority,
                                                )}`}
                                            >
                                                {message.priority}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {getStatusText(message.status)}
                                            </span>
                                        </div>

                                        <div className="mt-2 text-gray-600 line-clamp-2">
                                            <RichTextDisplay
                                                content={
                                                    message.messageHtml ||
                                                    message.message
                                                }
                                                className="text-sm"
                                            />
                                        </div>

                                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                                            <span>
                                                {t("messages.sent", "Sent")}:{" "}
                                                {new Date(
                                                    message.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                            {message.context && (
                                                <span className="capitalize">
                                                    {t(
                                                        "messages.context",
                                                        "Context",
                                                    )}
                                                    : {message.context}
                                                </span>
                                            )}
                                            {message.respondedAt && (
                                                <span className="text-green-600">
                                                    {t(
                                                        "messages.respondedAt",
                                                        "Responded",
                                                    )}
                                                    :{" "}
                                                    {new Date(
                                                        message.respondedAt,
                                                    ).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleViewMessage(message)
                                        }
                                        className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Message View Modal */}
            {showMessageModal && selectedMessage && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    {getStatusIcon(selectedMessage.status)}
                                    <span className="ml-2">
                                        {t(
                                            "messages.messageDetails",
                                            "Message Details",
                                        )}
                                    </span>
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <span
                                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                                            selectedMessage.status === "unread"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : selectedMessage.status ===
                                                    "read"
                                                  ? "bg-blue-100 text-blue-800"
                                                  : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {getStatusText(selectedMessage.status)}
                                    </span>
                                    <span
                                        className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(
                                            selectedMessage.priority,
                                        )}`}
                                    >
                                        {selectedMessage.priority} priority
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t(
                                            "messages.yourMessage",
                                            "Your Message",
                                        )}
                                    </label>
                                    <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                                        <RichTextDisplay
                                            content={
                                                selectedMessage.messageHtml ||
                                                selectedMessage.message
                                            }
                                            className="text-sm text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t("messages.sentOn", "Sent On")}
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {new Date(
                                                selectedMessage.createdAt,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t("messages.context", "Context")}
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 capitalize">
                                            {selectedMessage.context}
                                        </p>
                                    </div>
                                </div>

                                {selectedMessage.adminResponse && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t(
                                                "messages.ourResponse",
                                                "Our Response",
                                            )}
                                        </label>
                                        <div className="mt-1 p-3 border border-green-300 rounded-md bg-green-50">
                                            <p className="text-sm text-gray-900">
                                                {/* {selectedMessage.adminResponse} */}
                                                <RichTextDisplay
                                                    content={
                                                        selectedMessage.adminResponse
                                                    }
                                                    className="text-sm text-gray-900"
                                                />
                                            </p>
                                            {selectedMessage.respondedAt && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {t(
                                                        "messages.respondedOn",
                                                        "Responded on",
                                                    )}{" "}
                                                    {new Date(
                                                        selectedMessage.respondedAt,
                                                    ).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t("common.close", "Close")}
                                </button>
                                {selectedMessage.status !== "responded" && (
                                    <Link
                                        to="/dashboard/messages/new"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        {t(
                                            "messages.another_one",
                                            "Send another one",
                                        )}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMessages;
