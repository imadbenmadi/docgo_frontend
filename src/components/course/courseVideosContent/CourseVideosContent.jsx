import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Play, Pause } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  showSimpleSuccess,
  showSimpleError,
} from "../../../utils/sweetAlertHelper";

// TestimonialCard component
function TestimonialCard({
  testimonial,
  author,
  role,
  avatar,
  rating,
  date,
  showDate = true,
  showRating = true,
}) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-start gap-4">
        <img
          src={avatar}
          alt={author}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              author,
            )}&background=0ea5e9&color=fff`;
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 truncate">{author}</h4>
            {showRating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{role}</p>
          <p className="text-gray-800 text-sm leading-relaxed">{testimonial}</p>
          {showDate && (
            <p className="text-xs text-gray-500 mt-3">{formatDate(date)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom Slider component
function CustomSlider({ children, slidesToShow = 2 }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShowResponsive, setSlidesToShowResponsive] =
    useState(slidesToShow);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShowResponsive(1);
      } else {
        setSlidesToShowResponsive(slidesToShow);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [slidesToShow]);

  const totalSlides = children.length;
  const maxSlide = Math.max(0, totalSlides - slidesToShowResponsive);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${
              currentSlide * (100 / slidesToShowResponsive)
            }%)`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2"
              style={{
                width: `${100 / slidesToShowResponsive}%`,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {totalSlides > slidesToShowResponsive && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: maxSlide + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentSlide ? "bg-cyan-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function CourseVideosContent() {
  // Translation fallback
  const { t } = useTranslation();

  // Video player states
  const videoRef = useRef(null);
  const [isPlaying, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Feedback states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Data state
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockBackendData = {
    id: "video_001",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail:
      "https://Images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    duration: 1800,
    title: "Introduction au Développement Web",
    description:
      "Apprenez les fondamentaux du développement web avec ce cours complet",

    statistics: {
      totalViews: 15420,
      totalStudents: 3240,
      averageRating: 4.7,
      totalReviews: 892,
    },

    testimonials: [
      {
        id: 1,
        testimonial:
          "Grâce à un accompagnement personnalisé, je me sens accompagné à chaque étape du processus. Le contenu est très bien structuré et facile à suivre.",
        author: "Mohamed Yan",
        role: "Étudiante en France",
        avatar:
          "https://Images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        rating: 5,
        date: "2024-01-15",
        courseId: "course_001",
      },
      {
        id: 2,
        testimonial:
          "Le service m'a énormément aidé à comprendre les démarches d'admission et visa. Les explications sont claires et détaillées.",
        author: "Fatima Zohra",
        role: "Étudiante en Allemagne",
        avatar:
          "https://Images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        rating: 4,
        date: "2024-01-10",
        courseId: "course_001",
      },
      {
        id: 3,
        testimonial:
          "Excellent accompagnement ! Je recommande pour toute personne qui veut étudier à l'étranger. L'équipe est très professionnelle.",
        author: "Karim Belkacem",
        role: "Étudiant au Canada",
        avatar:
          "https://Images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        rating: 5,
        date: "2024-01-08",
        courseId: "course_001",
      },
      {
        id: 4,
        testimonial:
          "Simple, rapide et efficace. L'équipe est disponible à tout moment. Les ressources fournies sont de grande qualité.",
        author: "Lina Haddad",
        role: "Étudiante en Belgique",
        avatar:
          "https://Images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        rating: 4,
        date: "2024-01-05",
        courseId: "course_001",
      },
      {
        id: 5,
        testimonial:
          "Formation complète avec beaucoup d'exemples pratiques. J'ai pu appliquer directement ce que j'ai appris.",
        author: "Ahmed Bouali",
        role: "Développeur Full Stack",
        avatar:
          "https://Images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        rating: 5,
        date: "2024-01-01",
        courseId: "course_001",
      },
      {
        id: 6,
        testimonial:
          "Interface intuitive et contenu de qualité. Support technique très réactif en cas de problème.",
        author: "Yasmine Alami",
        role: "Designer UX/UI",
        avatar:
          "https://Images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
        rating: 4,
        date: "2023-12-28",
        courseId: "course_001",
      },
    ],
  };

  // Simulate API call
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCourseData(mockBackendData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, []);

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

  // Fixed time formatting
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Handle video time updates
  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
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

  // Handle feedback submission
  const handleFeedbackSubmit = async () => {
    if (!rating || !comment.trim()) return;

    try {
      await showSimpleSuccess(
        `${t("course_data.thankYou", "Thank you!")}\n${t("course.rating", "Rating")}: ${rating}\n${t("course_data.comment", "Comment")}: ${comment}`,
      );
      setComment("");
      setRating(0);
      setShowFeedbackForm(false);
    } catch (error) {
      await showSimpleError(
        "Erreur lors de la soumission. Veuillez réessayer.",
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
        <div className="flex flex-col w-full max-md:mt-8 max-md:max-w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-6"></div>
            <div className="h-64 md:h-80 lg:h-[420px] bg-gray-300 rounded-[48px] mb-8"></div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (!courseData) {
    return (
      <main className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
        <div className="flex flex-col w-full max-md:mt-8 max-md:max-w-full">
          <div className="text-center py-8">
            <p className="text-red-600">
              Erreur lors du chargement des données. Veuillez réessayer.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
      <div className="flex flex-col w-full max-md:mt-8 max-md:max-w-full">
        <section>
          <header>
            <h1 className="text-2xl font-semibold text-zinc-800">
              {courseData.title}
            </h1>
            <p className="mt-2 text-base leading-relaxed text-neutral-600">
              {courseData.description}
            </p>

            {/* Course Statistics */}
            <div className="flex gap-6 mt-4 text-sm text-neutral-600 flex-wrap">
              <span>
                {courseData.statistics.totalViews.toLocaleString()}{" "}
                {t("course_data.views", "Views")}
              </span>
              <span>
                {courseData.statistics.totalStudents.toLocaleString()}{" "}
                {t("course_data.students", "Students")}
              </span>
              <span>
                â... {courseData.statistics.averageRating} (
                {courseData.statistics.totalReviews}{" "}
                {t("course_data.course_reviews", "Course reviews")})
              </span>
            </div>
          </header>

          {/* Video Player */}
          <div className="py-6">
            <div className="relative mx-auto mt-6 h-64 w-full max-w-[860px] overflow-hidden rounded-[48px] bg-gray-200 shadow-md transition duration-300 hover:shadow-lg md:h-80 lg:h-[420px]">
              <video
                className="h-full w-full object-cover"
                ref={videoRef}
                src={courseData.url}
                poster={courseData.thumbnail}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />

              {/* Play/Pause Button Overlay */}
              <div
                role="button"
                onClick={handleToggle}
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-20 transition-opacity hover:bg-opacity-30"
              >
                <div
                  className={`z-20 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-white transition-all duration-300 md:h-20 md:w-20 hover:bg-cyan-600 hover:scale-110 ${
                    isPlaying ? "invisible select-none opacity-0" : ""
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 md:h-10 md:w-10" />
                  ) : (
                    <Play className="h-8 w-8 md:h-10 md:w-10 ml-1" />
                  )}
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="w-full mt-4 px-2 md:px-0 max-w-[860px] mx-auto">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={handleToggle}
                  className="text-cyan-500 hover:text-cyan-600 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500 slider"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="mt-10">
          <div className="flex gap-2 flex-wrap items-center text-zinc-800">
            <button
              onClick={() => setShowFeedbackForm(false)}
              className={`px-6 py-2 rounded-lg border text-base font-medium transition-colors ${
                !showFeedbackForm
                  ? "bg-cyan-500 text-white border-cyan-500"
                  : "bg-white text-zinc-800 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("course_data.readComments", "Read comments")} (
              {courseData.testimonials.length})
            </button>
            <button
              className={`px-6 py-2 rounded-lg border text-base font-medium transition-colors ${
                showFeedbackForm
                  ? "bg-cyan-500 text-white border-cyan-500"
                  : "bg-white text-cyan-500 border-cyan-500 hover:bg-cyan-50"
              }`}
              onClick={() => setShowFeedbackForm(true)}
            >
              {t("course_data.writeFeedback", "Write your own comment")}
            </button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <div className="mt-6 border p-6 rounded-xl bg-gray-50">
              <h3 className="text-lg font-semibold text-zinc-800 mb-4">
                {t("course_data.leaveFeedback", "Leave your feedback")}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-600">
                  {t("course_data.rating", "Rating")}:
                </span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-all hover:scale-110 ${
                      rating >= star
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  >
                    â...
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({rating}/5)
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t(
                  "course_data.commentPlaceholder",
                  "Your comment...",
                )}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setComment("");
                    setRating(0);
                    setShowFeedbackForm(false);
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!rating || !comment.trim()}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {t("course_data.submit", "Submit")}
                </button>
              </div>
            </div>
          )}

          {/* Testimonials Section */}
          {!showFeedbackForm && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-zinc-800 mb-6">
                {t("course_data.testimonials", "Student Reviews")}(
                {courseData.testimonials.length})
              </h3>

              {courseData.testimonials.length > 0 ? (
                <CustomSlider slidesToShow={2}>
                  {courseData.testimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      {...testimonial}
                      showDate={true}
                      showRating={true}
                    />
                  ))}
                </CustomSlider>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    Aucun avis pour le moment. Soyez le premier à laisser un
                    avis !
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default CourseVideosContent;
