import FAQSection from "../components/FAQ/FAQSection";
import Container from "../components/Container";
import { useTranslation } from "react-i18next";

const FAQPage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Container>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {t("faq_data.title", "Frequently Asked Questions")}
                        </h1>
                        <p className="text-xl text-gray-600">
                            {t("faq_data.intro", "Find answers to common questions about our courses and programs.")}
                        </p>
                    </div>

                    <FAQSection type="home" />
                </div>
            </Container>
        </div>
    );
};

export default FAQPage;
