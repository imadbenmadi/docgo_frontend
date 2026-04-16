import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Pause,
  Play,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaLock } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { EnrollmentAPI } from "../API/Enrollment";
import { useAppContext } from "../AppContext";
import { useCourse } from "../hooks/useCourse";
import useScrollLock from "../hooks/useScrollLock";
import MainLoading from "../MainLoading";
import Certificate from "./Certificate";
import CourseResources from "./CourseResources";
import QuizContent from "./QuizContent";
import Swal from "sweetalert2";
import apiClient from "../utils/apiClient";
import { buildApiUrl, getApiBaseUrl } from "../utils/apiBaseUrl";

export function CourseVideos() {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();

  // Video player states
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResources, setShowResources] = useState(false);

  useScrollLock(sidebarOpen);
  const [showCertificate, setShowCertificate] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState(null);

  // Progress tracking
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [videoProgress, setVideoProgress] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Certificate unlock state - MUST be declared before any conditional logic
  const [isCertificateUnlocked, setIsCertificateUnlocked] = useState(false);
  // Per-item completion tracking (SectionItem IDs)
  const [completedItems, setCompletedItems] = useState(new Set());
  const [totalSectionItems, setTotalSectionItems] = useState(0);

  const {
    courseData,
    loading,
    error,
    hasError,
    isEnrolled,
    canAccessContent,
    hasData,
  } = useCourse(courseId);

  // Load certificate unlock status - check both quiz completion and score
  useEffect(() => {
    const quizCompleted = localStorage.getItem(
      `course_${courseId}_quiz_completed`,
    );

    // Certificate is unlocked only if quiz is passed (localStorage value is 'true')
    if (quizCompleted === "true") {
      setIsCertificateUnlocked(true);
    } else {
      setIsCertificateUnlocked(false);
    }

    // Also listen for storage changes (when quiz is completed in the same tab)
    const handleStorageChange = () => {
      const completed = localStorage.getItem(
        `course_${courseId}_quiz_completed`,
      );
      if (completed === "true") {
        setIsCertificateUnlocked(true);
      } else {
        setIsCertificateUnlocked(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Check immediately
    handleStorageChange();

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [courseId]);

  // Load per-item completion status from backend
  useEffect(() => {
    const loadItemProgress = async () => {
      try {
        const response = await EnrollmentAPI.getCourseProgress(courseId);
        if (response.success && response.data) {
          const ids = response.data.completedItemIds || [];
          const idSet = new Set(ids.map(String));
          setCompletedItems(idSet);
          // completedVideos uses the same SectionItem IDs — populate from DB
          setCompletedVideos(idSet);
          setTotalSectionItems(response.data.totalItems || 0);
          setLastSyncTime(response.data.lastUpdated || null);
          // If all items done, unlock certificate
          if (
            response.data.totalItems > 0 &&
            ids.length >= response.data.totalItems
          ) {
            setIsCertificateUnlocked(true);
          }
        }
      } catch {
        // silent - expected 404 for new users
      }
    };
    if (courseId && user) loadItemProgress();
  }, [courseId, user]);

  // Redirect only when the user cannot access the content.
  useEffect(() => {
    if (hasData && !canAccessContent) {
      navigate(`/Courses/${courseId}`);
    }
  }, [hasData, canAccessContent, courseId, navigate]);

  // Get video URL with API base
  const getVideoPath = useCallback((video) => {
    if (!video) {
      return null;
    }

    const videoPath =
      video.streamUrl ||
      video.stream_url ||
      video.videoUrl ||
      video.video_url ||
      video.url ||
      video.VideoUrl ||
      video.path ||
      video.videoPath ||
      video.Video ||
      video.video;

    if (!videoPath) {
      return null;
    }

    return videoPath;
  }, []);

  useEffect(() => {
    let isActive = true;

    const resolveVideoUrl = async () => {
      const currentPath = getVideoPath(
        courseData?.course?.videos?.[currentVideoIndex],
      );

      if (!currentPath) {
        setResolvedVideoUrl(null);
        return;
      }

      if (typeof currentPath === "string" && currentPath.startsWith("http")) {
        setResolvedVideoUrl(currentPath);
        return;
      }

      const filename = String(currentPath)
        .split("?")[0]
        .split("#")[0]
        .split("/")
        .filter(Boolean)
        .pop();

      if (!filename) {
        setResolvedVideoUrl(buildApiUrl(currentPath));
        return;
      }

      try {
        const response = await apiClient.get(
          `/media/signed-url/video/${filename}`,
        );
        if (isActive) {
          setResolvedVideoUrl(response.data?.url || null);
        }
      } catch {
        if (isActive) {
          setResolvedVideoUrl(
            `${getApiBaseUrl()}/media/stream/video/${encodeURIComponent(filename)}`,
          );
        }
      }
    };

    resolveVideoUrl();

    return () => {
      isActive = false;
    };
  }, [courseData, currentVideoIndex, getVideoPath]);

  // Attach HLS when the backend returns an .m3u8 URL
  // Must be declared before any conditional returns to keep hook order stable.
  useEffect(() => {
    const course = courseData?.course;
    const videos = course?.videos || [];
    const currentVideo = videos[currentVideoIndex];

    const url = resolvedVideoUrl;
    const videoEl = videoRef.current;

    if (!videoEl || !url) return;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = url.includes(".m3u8");

    if (!isHls) {
      // Native playback for MP4/others
      if (videoEl.src !== url) {
        videoEl.src = url;
      }
      return;
    }

    // Safari can play HLS natively
    if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.src = url;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoEl);
      hls.on(Hls.Events.ERROR, (_evt, data) => {});
    } else {
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [resolvedVideoUrl]);

  if (loading) return <MainLoading />;

  if (hasError || !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || t("Error loading course", "Error loading course")}
          </p>
          <button
            onClick={() => navigate(`/Courses/${courseId}`)}
            className="text-blue-600 hover:underline"
          >
            {t("Go back to course", "Go back to course")}
          </button>
        </div>
      </div>
    );
  }

  if (!courseData?.course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {t(
              "Course data is incomplete. Please try again.",
              "Course data is incomplete. Please try again.",
            )}
          </p>
          <button
            onClick={() => navigate(`/Courses/${courseId}`)}
            className="text-blue-600 hover:underline"
          >
            {t("Go back to course", "Go back to course")}
          </button>
        </div>
      </div>
    );
  }

  const course = courseData.course;
  const videos = course?.videos || [];
  const currentVideo = videos[currentVideoIndex];

  // Fix: Quiz data is an array, check if it has items
  const hasQuiz = Array.isArray(course.quiz) && course.quiz.length > 0;
  const hasCertificate = course?.certificate === true;

  // Video player handlers
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const handleToggle = () => {
    isPlaying ? handlePause() : handlePlay();
  };

  // Time formatting
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Handle video time updates
  const handleTimeUpdate = (e) => {
    const current = e.target.currentTime;
    const total = e.target.duration;
    setCurrentTime(current);

    // Track progress percentage for current video
    if (total > 0) {
      const progressPercent = (current / total) * 100;
      const videoId = videos[currentVideoIndex]?.id || currentVideoIndex;

      setVideoProgress((prev) => ({
        ...prev,
        [videoId]: progressPercent,
      }));

      // Mark as completed if watched 90% or more
      if (progressPercent >= 90 && !completedVideos.has(videoId)) {
        const newCompleted = new Set(completedVideos);
        newCompleted.add(videoId);
        setCompletedVideos(newCompleted);

        // Also mark as completed on the server (SectionItem-based)
        const currentVid = videos[currentVideoIndex];
        if (currentVid?.source === "SectionItem" && currentVid?.id) {
          EnrollmentAPI.markItemComplete(courseId, currentVid.id, {
            watchedDuration: Math.round(current),
            timeSpent: Math.round(current),
          }).then((res) => {
            if (res.success) {
              setCompletedItems((prev) => new Set([...prev, currentVid.id]));
              const newTotal = res.data?.totalItems || totalSectionItems;
              const newDone =
                res.data?.completedItems || completedItems.size + 1;
              if (newTotal > 0 && newDone >= newTotal) {
                setIsCertificateUnlocked(true);
              }
            }
          });
        }
      }
    }
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  // Handle timeline scrubbing
  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current && !isNaN(time)) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Handle video selection
  const handleVideoSelect = (index) => {
    setCurrentVideoIndex(index);
    setCurrentTime(0);
    setSidebarOpen(false);
    setShowQuiz(false);
    setShowResources(false);
    setShowCertificate(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Handle previous video
  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      handleVideoSelect(currentVideoIndex - 1);
    }
  };

  // Handle next video
  const handleNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      handleVideoSelect(currentVideoIndex + 1);
    }
  };

  // Handle video ended - auto play next
  const handleVideoEnded = () => {
    const videoId = videos[currentVideoIndex]?.id || currentVideoIndex;
    const video = videos[currentVideoIndex];

    // Mark as completed
    const newCompleted = new Set(completedVideos);
    newCompleted.add(videoId);
    setCompletedVideos(newCompleted);

    // Mark as completed on the server (SectionItem-based)
    if (video?.source === "SectionItem" && video?.id) {
      EnrollmentAPI.markItemComplete(courseId, video.id, {
        watchedDuration: Math.round(videoRef.current?.duration || 0),
        timeSpent: Math.round(videoRef.current?.duration || 0),
      }).then((res) => {
        if (res.success) {
          setCompletedItems((prev) => new Set([...prev, video.id]));
          const newTotal = res.data?.totalItems || totalSectionItems;
          const newDone = res.data?.completedItems || completedItems.size + 1;
          if (newTotal > 0 && newDone >= newTotal) {
            setIsCertificateUnlocked(true);
          }
        }
      });
    }

    // Auto play next video
    if (currentVideoIndex < videos.length - 1) {
      handleVideoSelect(currentVideoIndex + 1);
    }
  };

  // Check if all videos are completed
  const allVideosCompleted =
    videos.length > 0 && completedVideos.size >= videos.length;

  // Certificate click handler - shows real-name warning then navigates
  const handleCertificateClick = async () => {
    const studentName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.name || user?.FirstName
          ? `${user.FirstName} ${user.LastName}`
          : "";

    const result = await Swal.fire({
      title:
        t("certificate.realNameTitle", "Your Certificate Name") ||
        "Certificate Name",
      html: `
                <p style="margin-bottom:10px;color:#374151">
                    ${t("certificate.realNameWarning", "Your full name will appear on the certificate exactly as entered. Please make sure it is correct.") || "Your certificate will be issued under your real name. This cannot be changed later."}
                </p>
                <p style="font-weight:700;font-size:1.1em;color:#7c3aed;padding:8px 16px;background:#f3e8ff;border-radius:8px;display:inline-block">
                    ${studentName || t("certificate.noName", "your name") || "Name not set"}
                </p>
                ${
                  !studentName
                    ? `<p style="margin-top:10px;color:#dc2626;font-size:0.9em">${t("certificate.goSetName", "Go set your name in profile") || "Please update your profile with your real name first."}</p>`
                    : ""
                }
            `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#6b7280",
      confirmButtonText:
        t("certificate.proceed", "Get Certificate") || "Get Certificate",
      cancelButtonText: t("certificate.cancel", "Cancel") || "Cancel",
      focusCancel: !studentName,
    });

    if (result.isConfirmed && studentName) {
      navigate(`/Courses/${courseId}/watch/certificate`);
    } else if (result.isConfirmed && !studentName) {
      navigate("/profile/edit");
    }
  };

  // Check if quiz is unlocked - unlock when all videos completed
  const isQuizUnlocked = allVideosCompleted;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            {t("No videos available", "No videos available")}
          </p>
          <button
            onClick={() => navigate(`/Courses/${courseId}`)}
            className="mt-4 text-blue-600 hover:underline"
          >
            {t("Go back to course", "Go back to course")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" w-full flex-col bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Mobile Header with Sidebar Toggle */}
      <div className="md:hidden bg-transparent mx-auto px-4 py-3 sticky bottom-0 z-[998]">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            aria-label="Toggle course menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[997]"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Container */}
      <div className="flex-1 w-full  max-w-[1360px] mx-auto  ">
        <div className="flex   gap-0 h-full">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block md:w-80 lg:w-96 flex-shrink-0">
            <div className="flex flex-col items-start pr-6 pl-8 border-r border-gray-200 min-h-screen bg-white shadow-sm">
              <button
                onClick={() => navigate(`/Courses/${courseId}`)}
                className="mt-6 mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-all group"
              >
                <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                {t("Back to course", "Back to course")}
              </button>

              <h1 className="text-2xl font-bold leading-9 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                {course.Title}
              </h1>

              {/* Progress Indicator */}
              <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm w-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {t("Progress", "Progress")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round((completedVideos.size / videos.length) * 100)}
                      %
                    </span>
                    {isSyncing && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${(completedVideos.size / videos.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    {completedVideos.size} / {videos.length}{" "}
                    {t("videos completed", "Videos completed")}
                  </p>
                  {lastSyncTime && !isSyncing && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <svg
                        className="w-3 h-3 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("Synced", "Synced") || "Synced"}
                    </p>
                  )}
                </div>
              </div>

              {/* Video List Navigation */}
              <section className="w-full  ">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  {t("Course Content", "Course Content")}
                </h2>
                <nav className="space-y-2 ">
                  {videos.map((video, index) => {
                    const isActive = index === currentVideoIndex;
                    const videoId = video.id || index;
                    const isCompleted = completedVideos.has(videoId);
                    const progress = videoProgress[videoId] || 0;
                    const hasProgress = progress > 0 && progress < 90;

                    return (
                      <div key={video.id || index} className="relative">
                        <button
                          onClick={() => handleVideoSelect(index)}
                          className={`flex gap-3 items-center p-4 w-full rounded-xl border-2 transition-all duration-200 text-left group ${
                            isCompleted
                              ? "border-green-500 bg-green-50 hover:bg-green-100 hover:shadow-md"
                              : isActive
                                ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 ${
                              isCompleted ? "animate-pulse" : ""
                            }`}
                          >
                            {isCompleted ? (
                              <FaCheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isActive
                                    ? "border-blue-600 bg-blue-100"
                                    : "border-gray-300"
                                }`}
                              >
                                <span
                                  className={`text-xs font-semibold ${
                                    isActive ? "text-blue-600" : "text-gray-500"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Title and Progress */}
                          <div className="flex-1">
                            <span
                              className={`font-medium block ${
                                isCompleted
                                  ? "text-green-700"
                                  : isActive
                                    ? "text-blue-700"
                                    : "text-gray-700 group-hover:text-blue-600"
                              }`}
                            >
                              {video.title}
                            </span>

                            {/* Progress bar for partially watched videos */}
                            {hasProgress && !isCompleted && (
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Status Icon */}
                          {isActive ? (
                            <Play className="w-4 h-4 text-blue-600 animate-pulse flex-shrink-0" />
                          ) : (
                            !isCompleted && (
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                            )
                          )}
                        </button>
                      </div>
                    );
                  })}
                </nav>
              </section>

              {/* Quiz and Certificate Section */}
              <section className="w-full space-y-3">
                {/* Resources Button - Always show */}
                <button
                  onClick={() => {
                    setShowResources(true);
                    setShowQuiz(false);
                    setShowCertificate(false);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-orange-700 block">
                        {t("Resources", "Resources")}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-600" />
                  </div>
                </button>

                {/* Show quiz section only if course has quiz */}
                {hasQuiz && (
                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isQuizUnlocked
                        ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {isQuizUnlocked ? (
                      <button
                        onClick={() => {
                          setShowQuiz(true);
                          setShowResources(false);
                          setShowCertificate(false);
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-green-700 hover:text-green-800 font-semibold"
                      >
                        <FaCheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
                        <span className="flex-1">
                          {t("Quiz unlocked", "Quiz unlocked")}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-400">
                        <FaLock className="w-5 h-5" />
                        <span className="flex-1 text-sm">
                          {t("Quiz (locked)", "Quiz (locked)")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {hasCertificate && (
                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCertificateUnlocked
                        ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {isCertificateUnlocked ? (
                      <button
                        onClick={handleCertificateClick}
                        className="w-full flex items-center gap-3 text-purple-700 hover:text-purple-800 font-semibold"
                      >
                        <FaCheckCircle className="w-5 h-5 text-purple-600 animate-bounce" />
                        <span className="flex-1">
                          {t("Certificate", "certificate")}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-400">
                        <FaLock className="w-5 h-5" />
                        <span className="flex-1 text-sm">
                          {t("Certificate (locked)", "Certificate (locked)")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </aside>

          {/* Mobile Sidebar */}
          <div
            className={`md:hidden mt-20 fixed top-0 left-0 h-[100dvh] w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[999] overscroll-contain ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="h-full overflow-y-auto pt-16 px-6">
              <button
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
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

              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                {t("Course Content", "Course Content")}
              </h2>

              <nav className="space-y-4">
                {videos.map((video, index) => {
                  const isActive = index === currentVideoIndex;
                  const videoId = video.id || index;
                  const isCompleted = completedVideos.has(videoId);
                  const progress = videoProgress[videoId] || 0;
                  const hasProgress = progress > 0 && progress < 90;

                  return (
                    <div key={video.id || index} className="relative">
                      <button
                        onClick={() => handleVideoSelect(index)}
                        className={`flex gap-4 items-center p-4 w-full rounded-xl border-2 transition-all duration-200 text-left group ${
                          isCompleted
                            ? "border-green-500 bg-green-50 hover:bg-green-100 hover:shadow-md"
                            : isActive
                              ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 ${
                            isCompleted ? "animate-pulse" : ""
                          }`}
                        >
                          {isCompleted ? (
                            <FaCheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isActive
                                  ? "border-blue-600 bg-blue-100"
                                  : "border-gray-300"
                              }`}
                            >
                              <span
                                className={`text-xs font-semibold ${
                                  isActive ? "text-blue-600" : "text-gray-500"
                                }`}
                              >
                                {index + 1}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title and Progress */}
                        <div className="flex-1">
                          <span
                            className={`font-medium block ${
                              isCompleted
                                ? "text-green-700"
                                : isActive
                                  ? "text-blue-700"
                                  : "text-gray-700 group-hover:text-blue-600"
                            }`}
                          >
                            {video.title}
                          </span>

                          {/* Progress bar for partially watched videos */}
                          {hasProgress && !isCompleted && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Status Icon */}
                        {isActive ? (
                          <Play className="w-4 h-4 text-blue-600 animate-pulse flex-shrink-0" />
                        ) : (
                          !isCompleted && (
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          )
                        )}
                      </button>
                    </div>
                  );
                })}
              </nav>

              {/* Quiz and Certificate - Mobile */}
              <div className="mt-8 space-y-4">
                {/* Resources Button - Mobile - Always show */}
                <button
                  onClick={() => {
                    setShowResources(true);
                    setShowQuiz(false);
                    setShowCertificate(false);
                    setSidebarOpen(false);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:border-orange-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-orange-700 block">
                        {t("Resources", "Resources")}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-600" />
                  </div>
                </button>

                {/* Show quiz section only if course has quiz */}
                {hasQuiz && (
                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isQuizUnlocked
                        ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {isQuizUnlocked ? (
                      <button
                        onClick={() => {
                          setShowQuiz(true);
                          setShowResources(false);
                          setShowCertificate(false);
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 text-green-700 font-semibold"
                      >
                        <FaCheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
                        <span className="flex-1">
                          {t("Quiz unlocked", "Quiz unlocked")}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-400">
                        <FaLock className="w-5 h-5" />
                        <span className="flex-1 text-sm">
                          {t("Quiz (locked)", "Quiz (locked)")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isCertificateUnlocked
                      ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {isCertificateUnlocked ? (
                    <button
                      onClick={handleCertificateClick}
                      className="w-full flex items-center gap-3 text-purple-700 font-semibold"
                    >
                      <FaCheckCircle className="w-5 h-5 text-purple-600 animate-bounce" />
                      <span className="flex-1">
                        {t("Certificate", "certificate")}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaLock className="w-5 h-5" />
                      <span className="flex-1 text-sm">
                        {t("Certificate (locked)", "Certificate (locked)")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Video Content */}
          <main className="flex-1 min-w-0 ml-5 w-[72%] max-md:ml-0 max-md:w-full">
            {showCertificate ? (
              <div className="flex flex-col w-full max-md:mt-8 max-md:max-w-full">
                {/* Mobile Sidebar */}
                <div
                  className={`md:hidden fixed top-0 left-0 h-[100dvh] w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[999] overscroll-contain ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                  }`}
                >
                  <div className="h-full overflow-y-auto pt-16 px-6">
                    <button
                      onClick={toggleSidebar}
                      className="absolute top-4 right-4 p-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
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

                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <Play className="w-5 h-5 text-blue-600" />
                      {t("Course Content", "Course Content")}
                    </h2>

                    <nav className="space-y-4">
                      {videos.map((video, index) => {
                        const isActive = index === currentVideoIndex;
                        const videoId = video.id || index;
                        const isCompleted = completedVideos.has(videoId);
                        const progress = videoProgress[videoId] || 0;
                        const hasProgress = progress > 0 && progress < 90;

                        return (
                          <div key={video.id || index} className="relative">
                            <button
                              onClick={() => handleVideoSelect(index)}
                              className={`flex gap-4 items-center p-4 w-full rounded-xl border-2 transition-all duration-200 text-left group ${
                                isCompleted
                                  ? "border-green-500 bg-green-50 hover:bg-green-100 hover:shadow-md"
                                  : isActive
                                    ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                              }`}
                            >
                              {/* Icon */}
                              <div
                                className={`flex-shrink-0 ${
                                  isCompleted ? "animate-pulse" : ""
                                }`}
                              >
                                {isCompleted ? (
                                  <FaCheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      isActive
                                        ? "border-blue-600 bg-blue-100"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    <span
                                      className={`text-xs font-semibold ${
                                        isActive
                                          ? "text-blue-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {index + 1}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Title and Progress */}
                              <div className="flex-1">
                                <span
                                  className={`font-medium block ${
                                    isCompleted
                                      ? "text-green-700"
                                      : isActive
                                        ? "text-blue-700"
                                        : "text-gray-700 group-hover:text-blue-600"
                                  }`}
                                >
                                  {video.title}
                                </span>

                                {/* Progress bar for partially watched videos */}
                                {hasProgress && !isCompleted && (
                                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${progress}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Status Icon */}
                              {isActive ? (
                                <Play className="w-4 h-4 text-blue-600 animate-pulse flex-shrink-0" />
                              ) : (
                                !isCompleted && (
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                )
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </nav>

                    {/* Quiz and Certificate - Mobile */}
                    <div className="mt-8 space-y-4">
                      {/* Resources Button - Mobile - Always show */}
                      <button
                        onClick={() => {
                          setShowResources(true);
                          setShowQuiz(false);
                          setShowCertificate(false);
                          setSidebarOpen(false);
                        }}
                        className="w-full p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:border-orange-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-orange-600" />
                          <div className="flex-1 text-left">
                            <span className="font-semibold text-orange-700 block">
                              {t("Resources", "Resources")}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-orange-600" />
                        </div>
                      </button>

                      {/* Show quiz section only if course has quiz */}
                      {hasQuiz && (
                        <div
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isQuizUnlocked
                              ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          {isQuizUnlocked ? (
                            <button
                              onClick={() => {
                                setShowQuiz(true);
                                setShowResources(false);
                                setShowCertificate(false);
                                setSidebarOpen(false);
                              }}
                              className="w-full flex items-center gap-3 text-green-700 font-semibold"
                            >
                              <FaCheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
                              <span className="flex-1">
                                {t("Quiz unlocked", "Quiz unlocked")}
                              </span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-3 text-gray-400">
                              <FaLock className="w-5 h-5" />
                              <span className="flex-1 text-sm">
                                {t("Quiz (locked)", "Quiz (locked)")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isCertificateUnlocked
                            ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {isCertificateUnlocked ? (
                          <button
                            onClick={handleCertificateClick}
                            className="w-full flex items-center gap-3 text-purple-700 font-semibold"
                          >
                            <FaCheckCircle className="w-5 h-5 text-purple-600 animate-bounce" />
                            <span className="flex-1">
                              {t("Certificate", "certificate")}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-400">
                            <FaLock className="w-5 h-5" />
                            <span className="flex-1 text-sm">
                              {t(
                                "Certificate (locked)",
                                "Certificate (locked)",
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Certificate Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold text-zinc-800">
                    {t("Course Certificate", "Course Certificate")}
                  </h1>
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>{t("Back to Videos", "Back to Videos")}</span>
                  </button>
                </div>

                {/* Certificate Content */}
                <div className="overflow-hidden w-full">
                  <Certificate />
                </div>
              </div>
            ) : showResources ? (
              <div className="flex flex-col w-full max-md:mt-8 max-md:max-w-full">
                {/* Resources Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold text-zinc-800">
                    {t("Course Resources", "Course Resources")}
                  </h1>
                  <button
                    onClick={() => setShowResources(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>{t("Back to Videos", "Back to Videos")}</span>
                  </button>
                </div>

                {/* Resources Content */}
                <div className="overflow-hidden w-full">
                  <CourseResources />
                </div>
              </div>
            ) : showQuiz ? (
              <div className="flex flex-col w-full max-md:mt-8 max-md:max-w-full">
                {/* Quiz Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold text-zinc-800">
                    {t("Course Quiz", "Course Quiz")}
                  </h1>
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>{t("Back to Videos", "Back to Videos")}</span>
                  </button>
                </div>

                {/* Quiz Content */}
                <div className="overflow-hidden w-full">
                  <QuizContent
                    quizData={course.quiz}
                    onQuizResult={(passed) => {
                      if (passed) {
                        setIsCertificateUnlocked(true);
                        setShowQuiz(false);
                        setShowResources(false);
                        setSidebarOpen(false);
                        // Navigate to certificate page with warning
                        handleCertificateClick();
                      } else {
                        setShowCertificate(false);
                        setShowQuiz(false);
                        setShowResources(false);
                        setSidebarOpen(false);
                        window.location.reload();
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full max-md:mt-8 max-md:max-w-full">
                <section>
                  <header>
                    <h1 className="text-2xl font-semibold text-zinc-800">
                      {currentVideo.title}
                    </h1>
                    {currentVideo.description && (
                      <p className="mt-2 text-base leading-relaxed text-neutral-600">
                        {currentVideo.description}
                      </p>
                    )}
                  </header>

                  {/* Video Player */}
                  <div className="py-6">
                    <div className="relative mx-auto mt-6 w-full max-w-[860px] overflow-hidden rounded-2xl bg-black shadow-2xl transition duration-300 hover:shadow-3xl border border-gray-200">
                      {resolvedVideoUrl ? (
                        <>
                          <video
                            className="w-full aspect-video object-contain"
                            ref={videoRef}
                            src={resolvedVideoUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setPlaying(true)}
                            onPause={() => setPlaying(false)}
                            onEnded={handleVideoEnded}
                            onError={(e) => {}}
                          />

                          {/* Play/Pause Button Overlay */}
                          <div
                            role="button"
                            onClick={handleToggle}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity hover:from-black/50"
                          >
                            <div
                              className={`z-20 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all duration-300 md:h-24 md:w-24 hover:from-blue-600 hover:to-purple-700 hover:scale-110 shadow-2xl ${
                                isPlaying
                                  ? "invisible select-none opacity-0"
                                  : ""
                              }`}
                            >
                              {isPlaying ? (
                                <Pause className="h-10 w-10 md:h-12 md:w-12" />
                              ) : (
                                <Play className="h-10 w-10 md:h-12 md:w-12" />
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full aspect-video flex items-center justify-center bg-gray-900 text-white">
                          <div className="text-center p-8">
                            <div className="text-6xl mb-4"></div>
                            <h3 className="text-xl font-semibold mb-2">
                              {t("Video not available", "Video not available")}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {t(
                                "This video source is not configured properly",
                              )}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              Video ID: {currentVideo?.id || "N/A"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video Controls */}
                    <div className="w-full mt-6 px-2 md:px-0 max-w-[860px] mx-auto">
                      <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-md border border-gray-100">
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.1}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer
                                   [&::-webkit-slider-thumb]:appearance-none 
                                   [&::-webkit-slider-thumb]:w-4 
                                   [&::-webkit-slider-thumb]:h-4 
                                   [&::-webkit-slider-thumb]:rounded-full 
                                   [&::-webkit-slider-thumb]:bg-gradient-to-r 
                                   [&::-webkit-slider-thumb]:from-blue-500 
                                   [&::-webkit-slider-thumb]:to-purple-600
                                   [&::-webkit-slider-thumb]:shadow-lg
                                   [&::-webkit-slider-thumb]:transition-transform
                                   [&::-webkit-slider-thumb]:hover:scale-125
                                   [&::-moz-range-thumb]:w-4 
                                   [&::-moz-range-thumb]:h-4 
                                   [&::-moz-range-thumb]:rounded-full 
                                   [&::-moz-range-thumb]:bg-gradient-to-r 
                                   [&::-moz-range-thumb]:from-blue-500 
                                   [&::-moz-range-thumb]:to-purple-600
                                   [&::-moz-range-thumb]:border-0
                                   [&::-moz-range-thumb]:shadow-lg
                                   [&::-moz-range-thumb]:transition-transform
                                   [&::-moz-range-thumb]:hover:scale-125"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #9333ea ${
                                (currentTime / duration) * 100
                              }%, #d1d5db ${
                                (currentTime / duration) * 100
                              }%, #d1d5db 100%)`,
                            }}
                          />
                          <div className="flex justify-between text-sm text-gray-600 font-medium mt-2">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-center gap-6">
                          <button
                            onClick={handlePrevious}
                            disabled={currentVideoIndex === 0}
                            className="p-3 rounded-full bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed 
                                   transition-all hover:scale-110 active:scale-95 shadow-md border border-gray-200"
                            title="Previous video"
                          >
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                          </button>

                          <button
                            onClick={handleToggle}
                            className="p-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
                                   hover:from-blue-600 hover:to-purple-700 
                                   transition-all hover:scale-110 active:scale-95 shadow-xl"
                            title={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? (
                              <Pause className="w-8 h-8 text-white" />
                            ) : (
                              <Play className="w-8 h-8 text-white" />
                            )}
                          </button>

                          <button
                            onClick={handleNext}
                            disabled={currentVideoIndex === videos.length - 1}
                            className="p-3 rounded-full bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed 
                                   transition-all hover:scale-110 active:scale-95 shadow-md border border-gray-200"
                            title="Next video"
                          >
                            <ChevronRight className="w-6 h-6 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CourseVideos;
