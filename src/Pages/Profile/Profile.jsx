import apiClient from "../../utils/apiClient";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext";
import { getApiErrorMessage } from "../../utils/apiErrorTranslate";
import ProfileInfoSection from "../../components/userProfile/ProfileInfoSection";
import MainLoading from "../../MainLoading";
import UserDriveLinkDisplay from "../../components/UserDriveLinkDisplay";
const Profile = () => {
  const Navigate = useNavigate();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAppContext();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userId = user?.id;

      if (!userId) {
        setError("Authentication required");
        return;
      }

      const response = await apiClient.get(`/Users/${userId}/Profile`);

      // Backend returns the data in response.data.data structure
      if (response.data.success) {
        // Combine user info with profile data
        const combinedData = {
          user: response.data.user,
          ...response.data.data,
        };
        setProfileData(combinedData);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch profile data",
        );
      }
    } catch (error) {
      setError(getApiErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <MainLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            {t("error", "Error")}: {error}
          </p>
          <button
            onClick={fetchProfileData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("retry", "Retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{t("no_data", "No data available")}</p>
      </div>
    );
  }

  // Transform backend data to match component expectations
  const transformedProfile = {
    name: `${profileData.user.firstName} ${profileData.user.lastName}`,
    firstName: profileData.user.firstName,
    lastName: profileData.user.lastName,
    email: profileData.user.email,
    avatar: profileData.user.profile_pic_link || null,
    country: profileData.user.country,
    studyDomain: profileData.user.studyDomain,
    phoneNumber: profileData.user.phoneNumber,
    university: profileData.user.university,
    specialty: profileData.user.specialty,
    academicAverage: profileData.user.academicAverage,
    currentAcademicLevel: profileData.user.currentAcademicLevel,
    hasRedoubledYear: profileData.user.hasRedoubledYear,
    professionalStatus: profileData.user.professionalStatus,
    academicStatus: profileData.user.academicStatus,
    yearsOfExperience: profileData.user.yearsOfExperience,
    currentJobTitle: profileData.user.currentJobTitle,
    stats: profileData.statistics,
  };

  return (
    <div className="min-h-screen relative bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <button
          onClick={() => Navigate("/profile/edit")}
          className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r
                     from-blue-600 to-blue-500 text-white rounded-full shadow-md hover:from-blue-700
                      hover:to-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                       focus:ring-offset-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="text-sm font-semibold tracking-wide">
            {t("edit_profile", "Edit profile") || "Edit Profile"}
          </span>
        </button>
        <ProfileInfoSection profile={transformedProfile} />
        <UserDriveLinkDisplay />
      </div>
    </div>
  );
};

export default Profile;
