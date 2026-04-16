import React from "react";

/**
 * ProfilePictureAvatar Component
 * Displays user profile picture or fallback avatar with initials
 *
 * @param {Object} user - User object with profile_pic_link, firstName, lastName
 * @param {string} size - Size class: 'xs' (24), 'sm' (32), 'md' (40), 'lg' (48), 'xl' (64)
 * @param {boolean} showBorder - whether to show a border around the avatar
 * @param {string} borderColor - Tailwind color class for border (e.g., 'border-blue-500')
 * @param {function} onImageError - callback when image fails to load
 * @returns {JSX.Element} Avatar component
 */
export const ProfilePictureAvatar = ({
  user,
  size = "md",
  showBorder = false,
  borderColor = "border-white",
  className = "",
  onImageError,
}) => {
  const sizeMap = {
    xs: { container: "w-6 h-6", text: "text-xs", icon: "w-3 h-3" },
    sm: { container: "w-8 h-8", text: "text-sm", icon: "w-4 h-4" },
    md: { container: "w-10 h-10", text: "text-base", icon: "w-5 h-5" },
    lg: { container: "w-12 h-12", text: "text-lg", icon: "w-6 h-6" },
    xl: { container: "w-16 h-16", text: "text-2xl", icon: "w-8 h-8" },
  };

  const sizeClasses = sizeMap[size] || sizeMap.md;
  const initials = `${(user?.firstName?.[0] || "U").toUpperCase()}${(user?.lastName?.[0] || "").toUpperCase()}`;

  const borderClass = showBorder ? `border-2 ${borderColor}` : "";

  // If user has profile picture
  if (user?.profile_pic_link) {
    return (
      <img
        src={user.profile_pic_link}
        alt={`${user.firstName} ${user.lastName}`}
        className={`
          ${sizeClasses.container}
          rounded-full
          object-cover
          flex-shrink-0
          ${borderClass}
          shadow-sm
          ${className}
        `}
        onError={(e) => {
          // Fallback to initials if image fails to load
          e.target.style.display = "none";
          e.target.nextSibling?.style?.removeProperty("display");
          // Notify parent component about the error
          if (onImageError) {
            onImageError();
          }
        }}
      />
    );
  }

  // Fallback to gradient avatar with initials
  return (
    <div
      className={`
        ${sizeClasses.container}
        rounded-full
        bg-gradient-to-br
        from-blue-400
        to-blue-600
        flex
        items-center
        justify-center
        flex-shrink-0
        ${borderClass}
        shadow-sm
        ${className}
      `}
    >
      <span className={`${sizeClasses.text} font-semibold text-white`}>
        {initials}
      </span>
    </div>
  );
};

/**
 * Get profile picture URL or fallback
 * @param {Object} user - User object
 * @returns {string|null} Profile picture URL or null
 */
export const getProfilePictureUrl = (user) => {
  return user?.profile_pic_link || null;
};

/**
 * Get user initials
 * @param {Object} user - User object
 * @returns {string} User initials
 */
export const getUserInitials = (user) => {
  return `${(user?.firstName?.[0] || "U").toUpperCase()}${(user?.lastName?.[0] || "").toUpperCase()}`;
};

export default ProfilePictureAvatar;
