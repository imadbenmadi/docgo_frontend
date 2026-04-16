import { useState } from "react";
import { GraduationCap, BookOpen, User } from "lucide-react";

/* eslint-disable react/prop-types */

const FALLBACK_CONFIG = {
  program: {
    gradient: "from-purple-500 via-indigo-500 to-blue-600",
    Icon: GraduationCap,
  },
  course: {
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    Icon: BookOpen,
  },
  user: {
    gradient: "from-slate-400 to-slate-600",
    Icon: User,
  },
};

const ImageWithFallback = ({
  src,
  alt,
  className,
  type = "course",
  style,
  ...rest
}) => {
  const [errored, setErrored] = useState(false);
  const config = FALLBACK_CONFIG[type] || FALLBACK_CONFIG.course;
  const { gradient, Icon } = config;

  if (!src || errored) {
    return (
      <div
        className={`bg-gradient-to-br ${gradient} flex items-center justify-center ${className || ""}`}
        style={style}
        role="img"
        aria-label={alt}
      >
        <Icon
          className="text-white opacity-70"
          style={{ width: "35%", height: "35%", minWidth: 20, maxWidth: 72 }}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
};

export default ImageWithFallback;
