import PropTypes from "prop-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBook,
  FaChevronDown,
  FaChevronRight,
  FaClock,
  FaFilePdf,
  FaListUl,
  FaLock,
  FaPlay,
  FaQuestion,
} from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";
import RichTextDisplay from "../../Common/RichTextEditor/RichTextDisplay";
import CourseInfo from "./CourseInfo";
import ZipCourseBrowser from "../../courses/ZipCourseBrowser";

/* ────────── helpers ────────── */
const ITEM_META = {
  video: {
    icon: FaPlay,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "Vidéo",
  },
  pdf: {
    icon: FaFilePdf,
    color: "text-red-600",
    bg: "bg-red-100",
    label: "PDF",
  },
  text: {
    icon: FaBook,
    color: "text-purple-600",
    bg: "bg-purple-100",
    label: "Lecture",
  },
  quiz: {
    icon: FaQuestion,
    color: "text-amber-600",
    bg: "bg-amber-100",
    label: "Quiz",
  },
};

const ItemTypeIcon = ({ type, accessible }) => {
  const meta = ITEM_META[type] || ITEM_META.video;
  const Icon = meta.icon;
  return (
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        accessible ? meta.bg + " " + meta.color : "bg-gray-200 text-gray-400"
      }`}
    >
      {accessible ? (
        <Icon className="text-xs" />
      ) : (
        <FaLock className="text-xs" />
      )}
    </div>
  );
};

/* ────────── Sections curriculum ────────── */
const SectionsCurriculum = ({ sections, isEnrolled, formatDuration }) => {
  const totalItems = sections.reduce(
    (acc, s) => acc + (s.items?.length || 0),
    0,
  );
  const totalVideos = sections.reduce(
    (acc, s) => acc + (s.items?.filter((i) => i.type === "video").length || 0),
    0,
  );
  const totalQuizzes = sections.reduce(
    (acc, s) => acc + (s.items?.filter((i) => i.type === "quiz").length || 0),
    0,
  );

  const [openSections, setOpenSections] = useState(
    () => new Set(sections.map((s) => s.id)),
  );

  const toggle = (id) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 pb-3 border-b border-gray-100">
        <span>
          <strong className="text-gray-700">{sections.length}</strong> sections
        </span>
        <span>•</span>
        <span>
          <strong className="text-gray-700">{totalItems}</strong> éléments
        </span>
        {totalVideos > 0 && (
          <>
            <span>•</span>
            <span>
              <strong className="text-gray-700">{totalVideos}</strong>{" "}
              <FaPlay className="inline mb-0.5 text-blue-500" /> vidéos
            </span>
          </>
        )}
        {totalQuizzes > 0 && (
          <>
            <span>•</span>
            <span>
              <strong className="text-gray-700">{totalQuizzes}</strong>{" "}
              <FaQuestion className="inline mb-0.5 text-amber-500" /> quiz
            </span>
          </>
        )}
      </div>

      {sections.map((section) => {
        const isOpen = openSections.has(section.id);
        const items = section.items || [];
        const sectionDuration = items.reduce(
          (acc, i) => acc + (i.duration || 0),
          0,
        );

        return (
          <div
            key={section.id}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isOpen ? (
                  <FaChevronDown className="text-gray-400 flex-shrink-0" />
                ) : (
                  <FaChevronRight className="text-gray-400 flex-shrink-0" />
                )}
                <span className="font-semibold text-gray-900 truncate">
                  {section.title}
                </span>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0 text-sm text-gray-500">
                <span>
                  {items.length} élément{items.length !== 1 ? "s" : ""}
                </span>
                {sectionDuration > 0 && formatDuration && (
                  <span className="flex items-center gap-1">
                    <FaClock className="text-xs" />
                    {formatDuration(sectionDuration)}
                  </span>
                )}
              </div>
            </button>

            {/* Section items */}
            {isOpen && items.length > 0 && (
              <div className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const accessible = isEnrolled || item.isFree || idx === 0;
                  const meta = ITEM_META[item.type] || ITEM_META.video;

                  return (
                    <div
                      key={item.id || idx}
                      className={`flex items-center gap-4 px-5 py-3 ${
                        accessible ? "hover:bg-blue-50/40" : "bg-gray-50/60"
                      }`}
                    >
                      <ItemTypeIcon type={item.type} accessible={accessible} />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            accessible ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {item.title}
                        </p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            accessible
                              ? meta.bg + " " + meta.color
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {meta.label}
                        </span>
                        {item.isRequired && (
                          <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                            Requis
                          </span>
                        )}
                      </div>
                      {item.duration > 0 && formatDuration && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                          <FaClock className="text-xs" />
                          {formatDuration(item.duration)}
                        </span>
                      )}
                      {!accessible && (
                        <FaLock className="text-gray-300 flex-shrink-0 text-xs" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {isOpen && items.length === 0 && (
              <p className="px-5 py-3 text-sm text-gray-400 italic">
                Aucun élément dans cette section.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ────────── Legacy flat video list ────────── */
const LegacyVideoList = ({
  videos,
  isEnrolled,
  userStatus,
  handleVideoClick,
  formatDuration,
  t,
}) => (
  <div className="space-y-3">
    {videos.map((video, index) => {
      const isAccessible =
        isEnrolled || userStatus?.hasVideoAccess || video.isFree || index === 0;

      return (
        <div
          key={video.id || index}
          className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
            isAccessible
              ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
              : "border-gray-100 bg-gray-50 cursor-not-allowed"
          }`}
          onClick={() => isAccessible && handleVideoClick(video)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                  isAccessible
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isAccessible ? (
                  <FaPlay className="text-sm ml-0.5" />
                ) : (
                  <FaLock className="text-sm" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full mr-3 ${
                      isAccessible
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <h4
                    className={`font-medium flex-1 ${
                      isAccessible ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {video.title}
                  </h4>
                  {video.isFree && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2">
                      {t("course.freePreview", "Free Preview") ||
                        "Free Preview"}
                    </span>
                  )}
                </div>
                {video.description && (
                  <p
                    className={`text-sm mt-1 ${
                      isAccessible ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {video.description}
                  </p>
                )}
              </div>
            </div>
            {video.duration && (
              <div
                className={`flex items-center text-sm ml-4 ${
                  isAccessible ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <FaClock className="mr-1 text-xs" />
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

/* ────────── Main component ────────── */
const CourseContent = ({
  course,
  userStatus,
  isEnrolled,
  handleVideoClick,
  formatDuration,
  courseStats,
  upcomingMeets,
  certificate,
}) => {
  const { t } = useTranslation();

  const hasSections =
    Array.isArray(course.sections) && course.sections.length > 0;
  const hasVideos = Array.isArray(course.videos) && course.videos.length > 0;

  return (
    <div className="space-y-8">
      {/* Prerequisites */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {t("course_data.prerequisites", "Prerequisites") || "Prerequisites"}
        </h3>
        {course.Prerequisites ? (
          <RichTextDisplay
            textClassName=""
            content={course.Prerequisites || course.prerequisites}
          />
        ) : (
          <p className="text-gray-500">
            {t("course_data.no_prerequisites", "No prerequisites") ||
              "No prerequisites"}
          </p>
        )}
      </div>

      {/* Learning Objectives */}
      {course.objectives && course.objectives.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <TbTargetArrow className="text-green-500 text-xl mr-3" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("course_data.whatYouLearn", "What you'll learn") ||
                "What You'll Learn"}
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {course.objectives.map((objective, index) => (
              <div key={index} className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                <span className="text-gray-700">{objective}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <CourseInfo
        courseStats={courseStats}
        upcomingMeets={upcomingMeets}
        certificate={certificate}
        course={course}
        userStatus={userStatus}
      />

      {/* Course Curriculum */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaListUl className="text-blue-500 text-xl mr-3" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("course_data.content", "Course Content") || "Contenu du cours"}
            </h3>
          </div>
          {hasSections && (
            <span className="text-sm text-gray-500">
              {course.sections.length} section
              {course.sections.length !== 1 ? "s" : ""}
            </span>
          )}
          {!hasSections && hasVideos && (
            <span className="text-sm text-gray-500">
              {course.videos.length}{" "}
              {t("course_data.videos", "videos") || "vidéos"}
            </span>
          )}
        </div>

        {/* ZIP Course Content Browser */}
        {course.uploadType === "zip" ? (
          isEnrolled ? (
            <ZipCourseBrowser courseId={course.id || course.ID} />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">
                {t(
                  "enroll_to_access_materials",
                  "Please enroll or purchase to access course materials",
                ) ||
                  "Veuillez vous inscrire ou acheter pour accéder aux matériaux du cours"}
              </p>
            </div>
          )
        ) : hasSections ? (
          <SectionsCurriculum
            sections={course.sections}
            isEnrolled={isEnrolled}
            formatDuration={formatDuration}
          />
        ) : hasVideos ? (
          <LegacyVideoList
            videos={course.videos}
            isEnrolled={isEnrolled}
            userStatus={userStatus}
            handleVideoClick={handleVideoClick}
            formatDuration={formatDuration}
            t={t}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <p className="text-gray-500">
              {t("course_data.noVideos", "No videos available yet") ||
                "Aucun contenu disponible"}
            </p>
          </div>
        )}
      </div>

      {/* Course Materials */}
      {course.materials && course.materials.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <span className="text-purple-500 text-xl mr-3">📎</span>
            <h3 className="text-xl font-bold text-gray-900">
              {t("course_data.materials", "Course materials") ||
                "Course Materials"}
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {course.materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center p-3 border border-gray-200 rounded-lg"
              >
                <span className="text-purple-500 mr-3">📄</span>
                <span className="text-gray-700">{material}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CourseContent.propTypes = {
  course: PropTypes.object.isRequired,
  userStatus: PropTypes.object,
  isEnrolled: PropTypes.bool.isRequired,
  handleVideoClick: PropTypes.func.isRequired,
  formatDuration: PropTypes.func.isRequired,
  courseStats: PropTypes.object,
  upcomingMeets: PropTypes.array,
  certificate: PropTypes.any,
};

export default CourseContent;
