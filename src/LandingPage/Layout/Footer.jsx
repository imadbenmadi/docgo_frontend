import { useTranslation } from "react-i18next";
import { Link as ScrollSmooth } from "react-scroll";
import PropTypes from "prop-types";
import logo from "../../assets/Logo.png";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  MessageCircle,
  Send,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { clientProgramsAPI } from "../../API/Programs";
import { buildApiUrl } from "../../utils/apiBaseUrl";

function Footer({ contactInfo, branding = null }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  // useEffect(() => {
  //   clientProgramsAPI
  //     .getProgramCategories()
  //     .then((res) => {
  //       if (res?.success && Array.isArray(res.data?.categories)) {
  //         setCategories(res.data.categories.filter(Boolean).slice(0, 8));
  //       }
  //     })
  //     .catch(() => {});
  // }, []);

  const brandName = branding?.brandName || "";
  const brandLogoSrc = (() => {
    const logoUrl = branding?.logoUrl;
    if (!logoUrl) return logo;
    const fullUrl = buildApiUrl(logoUrl);
    const updatedAt = branding?.logoUpdatedAt;
    if (!updatedAt) return fullUrl;
    const v = new Date(updatedAt).getTime();
    return `${fullUrl}?v=${v}`;
  })();

  const normalizeUrl = (url) => {
    if (!url || url === "#") return "#";
    if (/^(https?:\/\/|\/\/|mailto:|tel:)/i.test(url)) return url;
    return `https://${url}`;
  };
  const getSocialLink = (type) => normalizeUrl(contactInfo?.[type]);
  const getEmail = () => contactInfo?.email || null;
  const getPhone = () => contactInfo?.phone || null;
  const getAddress = () => contactInfo?.address || null;
  return (
    <footer className="bg-gray-50 px-4 py-12 md:px-8 lg:px-16 max-lg:text-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-28 md:gap-20 sm-sm:gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4 max-lg:justify-center">
              <img
                src={brandLogoSrc}
                alt="Logo"
                className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0"
              />
              {brandName && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight text-gray-900 leading-tight">
                    {brandName}
                  </span>
                  {/* <span className="text-xs text-blue-600 font-medium tracking-wide">
                                        e-learning
                                    </span> */}
                </div>
              )}
            </div>
            <p className="text-gray-600">
              {t(
                "OurPlatform",
                "Our platform offers opportunities to study abroad and innovative online courses.",
              )}
            </p>

            <div className="flex flex-wrap gap-3 max-lg:justify-center">
              {contactInfo?.facebook && (
                <a
                  href={getSocialLink("facebook")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {contactInfo?.instagram && (
                <a
                  href={getSocialLink("instagram")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {contactInfo?.linkedin && (
                <a
                  href={getSocialLink("linkedin")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-700 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {contactInfo?.youtube && (
                <a
                  href={getSocialLink("youtube")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  title="YouTube"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              )}
              {contactInfo?.twitter && (
                <a
                  href={getSocialLink("twitter")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="X / Twitter"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
              {contactInfo?.whatsapp && (
                <a
                  href={getSocialLink("whatsapp")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-6 h-6" />
                </a>
              )}
              {contactInfo?.telegram && (
                <a
                  href={getSocialLink("telegram")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-sky-500 transition-colors"
                  title="Telegram"
                >
                  <Send className="w-6 h-6" />
                </a>
              )}
              {contactInfo?.viber && (
                <a
                  href={getSocialLink("viber")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Viber"
                >
                  <MessageSquare className="w-6 h-6" />
                </a>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-2 text-sm text-gray-600">
              {getEmail() && (
                <a
                  href={`mailto:${getEmail()}`}
                  className="flex items-center gap-2 hover:text-gray-900 max-lg:justify-center"
                >
                  <Mail className="w-4 h-4" />
                  <span>{getEmail()}</span>
                </a>
              )}
              {getPhone() && (
                <a
                  href={`tel:${getPhone()}`}
                  className="flex items-center gap-2 hover:text-gray-900 max-lg:justify-center"
                >
                  <Phone className="w-4 h-4" />
                  <span>{getPhone()}</span>
                </a>
              )}
              {getAddress() && (
                <a
                  href={`${getAddress()}`}
                  className="flex items-center gap-2 hover:text-gray-900 max-lg:justify-center"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{getAddress()}</span>
                </a>
              )}
            </div>
          </div>
          {/* Dynamic program categories */}
          {/* <div className="space-y-2"> */}
          {/* <h3 className="text-lg font-semibold text-gray-900">
              {t("Specialites", "Specialties")}
            </h3>
            {categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat}>
                    <a
                      href={`/programs?status=open&category=${encodeURIComponent(cat)}`}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              // Skeleton while loading
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i}>
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                  </li>
                ))}
              </ul>
            )}

            {categories.length > 4 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 pt-6">
                  {t("OtherSpecialties", "Other Specialties")}
                </h3>
                <ul className="space-y-2">
                  {categories.slice(4).map((cat) => (
                    <li key={cat}>
                      <a
                        href={`/programs?status=open&category=${encodeURIComponent(cat)}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {cat}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )} */}

          {/* View all link */}
          {/* <a
              href="/programs?status=open"
              className="inline-block pt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("StudyAbroad", "Study Abroad")}{" "}
            </a> */}
          {/* </div> */}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("OurServicesLink", "Our Services")}
            </h3>
            <ul className="space-y-2">
              <li>
                <ScrollSmooth
                  to={"aboutUs"}
                  spy={true}
                  smooth={true}
                  hashSpy={true}
                  offset={-100}
                  duration={500}
                  className="text-gray-600 hover:text-gray-900 hover:cursor-pointer"
                >
                  {t("AboutUsLink", "About Us")}
                </ScrollSmooth>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-600 hover:text-gray-900 hover:cursor-pointer"
                >
                  {t("FAQ", "FAQ")}
                </a>
              </li>
              <li>
                <ScrollSmooth
                  to={"Steps"}
                  spy={true}
                  smooth={true}
                  hashSpy={true}
                  offset={-100}
                  duration={500}
                  className="text-gray-600 hover:text-gray-900 hover:cursor-pointer"
                >
                  {t("TheStages", "The Steps")}
                </ScrollSmooth>
              </li>
              <li>
                <ScrollSmooth
                  to="contact"
                  spy={true}
                  smooth={true}
                  hashSpy={true}
                  offset={-100}
                  duration={500}
                  className="text-gray-600 hover:text-gray-900 hover:cursor-pointer"
                >
                  {t("ContactUs", "Contact Us")}
                </ScrollSmooth>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="/programs?status=open"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {t("StudyAbroad", "Study Abroad")}
                </a>
              </li>
              <li>
                <a
                  href="/courses"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {t("OurCourses", "Our Courses")}
                </a>
              </li>
              <li>
                <a
                  href="/Register"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {t("ToRegister", "Register")}
                </a>
              </li>
              <li>
                <a href="/Login" className="text-gray-600 hover:text-gray-900">
                  {t("SignIn", "Sign In")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  contactInfo: PropTypes.object,
  branding: PropTypes.object,
};

export default Footer;
