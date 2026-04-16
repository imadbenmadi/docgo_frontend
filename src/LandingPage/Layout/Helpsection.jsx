import { useTranslation } from "react-i18next";
import { Mail, MessageSquare, Phone, Sparkles, MapPin } from "lucide-react";
import PropTypes from "prop-types";
import contactus from "../../../src/assets/beautiful girl contact us.png";
import Container from "../../components/Container";
import ContactForm from "../../components/contact/ContactForm";
function HelpSection({ contactInfo }) {
  const { t } = useTranslation();
  return (
    <section
      id="contact"
      className="scroll-mt-20 relative overflow-hidden bg-white py-16 md:py-24"
    >
      {/* Animated Background Elements - Hidden for clean white design */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-400/15 rounded-full filter blur-3xl animate-pulse"></div>

        {/* Floating Shapes */}
        <div className="absolute top-20 right-1/4 w-16 h-16 border-4 border-blue-300/30 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 border-4 border-indigo-300/30 rounded-full animate-float animation-delay-3000"></div>
      </div>

      <Container style="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <div className="mb-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-gray-600 animate-pulse" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Entrer en Contact
            </h2>
            <Sparkles className="w-6 h-6 text-gray-600 animate-pulse animation-delay-2000" />
          </div>
          <div className="h-1.5 w-48 mx-auto bg-gray-300 rounded-full mb-6"></div>
          <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {t(
              "contact.helpText",
              "Have questions? Our team is here to help. Send us a message and we'll get back to you as soon as possible.",
            )}
          </p>
        </div>

        <div className="rounded-3xl shadow-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-3xl transition-shadow duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left side - Image and Contact Info */}
            <div className="relative bg-gray-800 p-8 md:p-12 flex flex-col justify-between min-h-[600px] overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full filter blur-2xl"></div>

              {/* Contact Information */}
              <div className="relative z-10 space-y-6 mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
                  {t(
                    "contact.getInTouch",
                    "Let us know if you have any questions",
                  )}
                </h3>

                {contactInfo?.email && (
                  <div className="group flex items-start space-x-4 text-white bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:translate-x-2">
                    <div className="bg-gray-700 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1 text-gray-200">
                        {t("Email", "Email")}
                      </p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-white hover:text-gray-300 transition-colors font-medium"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}

                {contactInfo?.phone && (
                  <div className="group flex items-start space-x-4 text-white bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:translate-x-2">
                    <div className="bg-gray-700 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1 text-gray-200">
                        {t("contact.phone", "Phone")}
                      </p>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-white hover:text-gray-300 transition-colors font-medium"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                {contactInfo?.address && (
                  <div className="group flex items-start space-x-4 text-white bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:translate-x-2">
                    <div className="bg-gray-700 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1 text-gray-200">
                        {t("contact.address", "Address")}
                      </p>
                      <a
                        href={`tel:${contactInfo.address}`}
                        className="text-white hover:text-gray-300 transition-colors font-medium"
                      >
                        {contactInfo.address}
                      </a>
                    </div>
                  </div>
                )}

                <div className="group flex items-start space-x-4 text-white bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:translate-x-2">
                  <div className="bg-gray-700 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1 text-gray-200">
                      {t("contact.supportTitle", "Support")}
                    </p>
                    <p className="text-white/90">
                      {t(
                        "contact.supportDesc",
                        "Available 7 days a week to answer your questions",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Image - Enhanced */}
              <div className="relative z-10 mt-auto">
                <div
                  className="absolute inset-0 bg-gradient-to-t from-transparent
                                 to-white/10 rounded-lg"
                ></div>
                <img
                  src={contactus}
                  alt="contact us"
                  className="w-full h-auto max-h-[400px] object-contain
                                    rounded-lg transform  transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right side - Contact Form */}
            <div className="relative p-8 md:p-12 bg-white">
              {/* Decorative corner elements - hidden */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200/10 rounded-bl-full hidden"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-200/10 rounded-tr-full hidden"></div>

              <div className="relative z-10">
                <ContactForm
                  context="landing"
                  showTitle={false}
                  className="bg-transparent shadow-none p-0"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

HelpSection.propTypes = {
  contactInfo: PropTypes.shape({
    email: PropTypes.string,
    phone: PropTypes.string,
  }),
};

export default HelpSection;
