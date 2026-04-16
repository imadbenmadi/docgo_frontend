import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import { toast } from "react-toastify";
import { fetchUserOptions } from "../../API/UserOptions";
import { User } from "lucide-react";
import apiClient from "../../utils/apiClient";
import { useTranslation } from "react-i18next";
import ValidationErrorPanel from "../../components/Common/FormValidation/ValidationErrorPanel";
import { useFormValidation } from "../../components/Common/FormValidation/useFormValidation";
import { getApiErrorMessage } from "../../utils/apiErrorTranslate";
import CountryFlagSelector from "../../components/CountryFlagSelector";
import { BILINGUAL_COUNTRIES } from "../../utils/countryCodeMap";

const EditProfile = () => {
  const { user, updateUserProfile } = useAppContext();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [options, setOptions] = useState({
    userOriginCountries: [],
    userSpecialties: [],
    professionalStatuses: [],
    academicStatuses: [],
  });
  const {
    errors: validationErrors,
    showPanel,
    validate,
    hidePanel,
  } = useFormValidation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    studyDomain: "",
    phoneNumber: "",
    university: "",
    professionalStatus: "",
    academicStatus: "",
    specialty: "",
    academicAverage: "",
    currentAcademicLevel: "",
    hasRedoubledYear: false,
    yearsOfExperience: "",
    currentJobTitle: "",
    profile_pic_link: "",
  });
  const API_URL =
    import.meta.env.VITE_API_URL || "https://backend.healthpathglobal.com";

  // Function to get country name based on current language
  const getCountryDisplayName = (countryString) => {
    const country = BILINGUAL_COUNTRIES[countryString];
    if (!country) return countryString;
    return i18n.language === "ar" ? country.ar : country.fr;
  };
  // Function to get placeholder text based on language
  const getSelectCountryText = () => {
    return t("editProfile.selectCountry", "Select country") || "Select Country";
  };
  const getFields = (optionString) => {
    const [english_french, arabic] = optionString.split(" / ");
    return i18n.language === "ar" ? arabic : english_french;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const ProfilePic = e.target.files[0];
    if (!ProfilePic) return;

    // Validate file type
    if (!ProfilePic.type.startsWith("image/")) {
      validate([
        {
          field: "Profile Picture",
          message: "Please select a valid image file (JPG, PNG, etc.)",
          section: "Profile Picture",
          scrollToId: "profile-pic-input",
          condition: true,
        },
      ]);
      return;
    }

    // Validate file size (5MB max)
    if (ProfilePic.size > 5 * 1024 * 1024) {
      validate([
        {
          field: "Profile Picture",
          message: "Image size must be less than 5MB",
          section: "Profile Picture",
          scrollToId: "profile-pic-input",
          condition: true,
        },
      ]);
      return;
    }

    setUploadingImage(true);

    try {
      const formDataImage = new FormData();
      formDataImage.append("profilePic", ProfilePic);

      const response = await apiClient.post(
        `${import.meta.env.VITE_API_URL}/upload/User/ProfilePic`,
        formDataImage,
        {
          withCredentials: true,
        },
      );

      const data = response.data;

      if (response.status === 200 || data.success) {
        setFormData((prev) => ({
          ...prev,
          profile_pic_link: data.fileLink,
        }));
        toast.success(
          t(
            "editProfile.uploadSuccess",
            "Profile picture uploaded successfully!",
          ),
        );
      } else {
        toast.error(getApiErrorMessage({ response: { data } }, t));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, t));
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerImageUpload = () => {
    document.getElementById("profile-pic-input").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validate([
      {
        field: "First Name",
        message: "First Name is required (min 3 characters)",
        section: "Personal Information",
        scrollToId: "firstName",
        condition:
          !formData.firstName?.trim() || formData.firstName.trim().length < 3,
      },
      {
        field: "Last Name",
        message: "Last Name is required (min 3 characters)",
        section: "Personal Information",
        scrollToId: "lastName",
        condition:
          !formData.lastName?.trim() || formData.lastName.trim().length < 3,
      },
      {
        field: "Email",
        message: "Please enter a valid email address",
        section: "Personal Information",
        scrollToId: "email",
        condition:
          !formData.email?.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()),
      },
      {
        field: "Phone Number",
        message: "Invalid phone number format",
        section: "Personal Information",
        scrollToId: "phoneNumber",
        condition:
          !!formData.phoneNumber?.trim() &&
          !/^[+]?[\d\s\-().]{6,20}$/.test(formData.phoneNumber.trim()),
      },
    ]);
    if (!isValid) return;

    setLoading(true);

    try {
      const response = await apiClient.put(
        `${import.meta.env.VITE_API_URL}/Users/${user.id}/Profile`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;

      if (response.status === 200 && data?.user) {
        // Update user in context
        if (updateUserProfile) {
          updateUserProfile(data.user);
        }

        toast.success(
          t("editProfile.updateSuccess", "Profile updated successfully!"),
        );
        navigate("/profile");
      } else {
        toast.error(getApiErrorMessage({ response: { data } }, t));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };
  const fetch_data = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `${import.meta.env.VITE_API_URL}/Users/${user.id}/Profile`,
        {
          withCredentials: true,
        },
      );

      const data = response.data;
      if (data?.success && data?.user) {
        setFormData((prev) => ({
          ...prev,
          ...data.user,
        }));
      } else {
        toast.error(
          t("apiErrors.failedToLoad", "Failed to load data. Please try again."),
        );
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Fetch dropdown options from API on component mount
    const loadOptions = async () => {
      const fetchedOptions = await fetchUserOptions();
      setOptions({
        userOriginCountries: fetchedOptions.userOriginCountries || [],
        userSpecialties: fetchedOptions.userSpecialties || [],
        professionalStatuses: fetchedOptions.professionalStatuses || [],
        academicStatuses: fetchedOptions.academicStatuses || [],
      });
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (user) {
      fetch_data();
    }
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        country: user.country || "",
        studyDomain: user.studyDomain || "",
        phoneNumber: user.phoneNumber || "",
        university: user.university || "",
        professionalStatus: user.professionalStatus || "",
        academicStatus: user.academicStatus || "",
        specialty: user.specialty || "",
        academicAverage:
          user.academicAverage === null || user.academicAverage === undefined
            ? ""
            : String(user.academicAverage),
        currentAcademicLevel: user.currentAcademicLevel || "",
        hasRedoubledYear: !!user.hasRedoubledYear,
        yearsOfExperience:
          user.yearsOfExperience === null ||
          user.yearsOfExperience === undefined
            ? ""
            : String(user.yearsOfExperience),
        currentJobTitle: user.currentJobTitle || "",
        profile_pic_link: user.profile_pic_link || "",
      });
    } else {
      navigate("/login");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ValidationErrorPanel
        errors={validationErrors}
        isVisible={showPanel}
        onClose={hidePanel}
        title="Please fix profile errors"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("editProfile.title", "Edit Profile") || "Edit Profile"}
            </h1>
            <button
              onClick={() => navigate("/profile")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {formData.profile_pic_link ? (
                    <img
                      src={`${API_URL}${formData.profile_pic_link}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 lg:w-20 lg:h-20 text-gray-400" />
                  )}
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="profile-pic-input"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerImageUpload}
                disabled={uploadingImage}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingImage
                  ? t("editProfile.uploadingImage", "Uploading...") ||
                    "Uploading Image..."
                  : t(
                      "editProfile.uploadProfileImage",
                      "Upload profile photo",
                    ) || "Upload profile Image"}
              </button>
            </div>
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("editProfile.firstName", "First Name") || "First Name"} *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("editProfile.lastName", "Last Name") || "Last Name"} *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("editProfile.email", "Email address") || "Email Address"} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("editProfile.phoneNumber", "Phone number") || "Phone Number"}
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("editProfile.country", "Country") || "Country"}
              </label>
              <CountryFlagSelector
                value={formData.country}
                onChange={(country) =>
                  setFormData((prev) => ({ ...prev, country }))
                }
                countries={options.userOriginCountries}
                placeholder={
                  t("editProfile.selectCountry", "Select Country") ||
                  "Select Country"
                }
                showLabel={false}
              />
            </div>
            {/* Academic Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t("editProfile.academicInformation", "Academic Information") ||
                  "Academic Information"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="studyDomain"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("editProfile.studyDomain", "Study Domain") ||
                      "Study Domain"}
                  </label>
                  <select
                    id="studyDomain"
                    name="studyDomain"
                    value={formData.studyDomain}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      direction: i18n.language === "ar" ? "rtl" : "ltr",
                      textAlign: i18n.language === "ar" ? "right" : "left",
                    }}
                  >
                    <option value="">
                      {t(
                        "editProfile.selectStudyDomain",
                        "Select Study Domain",
                      )}
                    </option>
                    {options.userSpecialties.map((field) => (
                      <option key={field} value={field}>
                        {getFields(field)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="specialty"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("editProfile.specialty", "Specialty") || "Specialty"}
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t(
                      "editProfile.specialtyPlaceholder",
                      "e.g., Medicine, Pharmacy, Dentistry",
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="academicAverage"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("editProfile.academicAverage", "Academic Average") ||
                        "Academic Average"}
                    </label>
                    <input
                      type="number"
                      id="academicAverage"
                      name="academicAverage"
                      value={formData.academicAverage}
                      onChange={handleChange}
                      min={0}
                      max={20}
                      step={0.01}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t("editProfile.academicAverageHint", "0-20")}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="currentAcademicLevel"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t(
                        "editProfile.currentAcademicLevel",
                        "Current Academic Level",
                      ) || "Current Academic Level"}
                    </label>
                    <input
                      type="text"
                      id="currentAcademicLevel"
                      name="currentAcademicLevel"
                      value={formData.currentAcademicLevel}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t(
                        "editProfile.currentAcademicLevelPlaceholder",
                        "e.g., L3, M1, Intern",
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="hasRedoubledYear"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("editProfile.redoubledYear", "Redoubled Year") ||
                      "Redoubled Year"}
                  </label>
                  <select
                    id="hasRedoubledYear"
                    name="hasRedoubledYear"
                    value={formData.hasRedoubledYear ? "true" : "false"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasRedoubledYear: e.target.value === "true",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="false">{t("common.no", "No")}</option>
                    <option value="true">{t("common.yes", "Yes")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t(
                  "editProfile.professionalInformation",
                  "Professional Information",
                ) || "Professional Information"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="university"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("editProfile.university", "University / Institution") ||
                      "University / Institution"}
                  </label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder={
                      t(
                        "editProfile.universityPlaceholder",
                        "Enter your university or institution name",
                      ) || "Enter your university or institution name"
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="professionalStatus"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t(
                      "editProfile.professionalStatus",
                      "Professional Status",
                    ) || "Professional Status"}
                  </label>
                  <select
                    id="professionalStatus"
                    name="professionalStatus"
                    value={formData.professionalStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {t(
                        "editProfile.selectProfessionalStatus",
                        "Select Professional Status",
                      )}
                    </option>
                    {options.professionalStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status === "student"
                          ? t("editProfile.student", "Student")
                          : status === "worker"
                            ? t("editProfile.worker", "Working Professional")
                            : t("editProfile.other", "Other")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="academicStatus"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("editProfile.academicStatus", "Academic Status") ||
                      "Academic Status"}
                  </label>
                  <select
                    id="academicStatus"
                    name="academicStatus"
                    value={formData.academicStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {t(
                        "editProfile.selectAcademicStatus",
                        "Select Academic Status",
                      )}
                    </option>
                    {options.academicStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status === "student"
                          ? t("editProfile.currentStudent", "Current Student")
                          : status === "graduated"
                            ? t("editProfile.graduated", "Graduated")
                            : t("editProfile.other", "Other")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="yearsOfExperience"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t(
                        "editProfile.yearsOfExperience",
                        "Years Of Experience",
                      ) || "Years Of Experience"}
                    </label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min={0}
                      max={80}
                      step={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t(
                        "editProfile.yearsOfExperiencePlaceholder",
                        "e.g., 3",
                      )}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="currentJobTitle"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("editProfile.currentJobTitle", "Current Job Title") ||
                        "Current Job Title"}
                    </label>
                    <input
                      type="text"
                      id="currentJobTitle"
                      name="currentJobTitle"
                      value={formData.currentJobTitle}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t(
                        "editProfile.currentJobTitlePlaceholder",
                        "e.g., Pharmacist",
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("editProfile.saving", "Saving...") || "Saving..."}
                  </div>
                ) : (
                  t("editProfile.saveChanges", "Save Changes") || "Save Changes"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                {t("editProfile.cancel", "Cancel") || "Cancel"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
