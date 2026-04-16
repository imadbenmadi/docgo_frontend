import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  HelpCircle,
  Play,
  Video,
  X,
} from "lucide-react";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaLock, FaStar, FaRegStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { EnrollmentAPI } from "../API/Enrollment";
import reviewsAPI from "../API/Reviews";
import apiClient from "../services/apiClient";
import VideoPlayer from "../components/Common/VideoPlayer";
import RichTextDisplay from "../components/Common/RichTextEditor/RichTextDisplay";
import { useAppContext } from "../AppContext";
import { useCourse } from "../hooks/useCourse";
import useScrollLock from "../hooks/useScrollLock";
import MainLoading from "../MainLoading";
import { buildApiUrl, getApiBaseUrl } from "../utils/apiBaseUrl";
import Certificate from "./Certificate";

// ─────────────────────────────────────────────────────────────────────────────
// Item type icon helper
// ─────────────────────────────────────────────────────────────────────────────
ItemTypeIcon.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
};
function ItemTypeIcon({ type, className = "w-4 h-4" }) {
  switch (type) {
    case "video":
      return <Video className={`${className} text-blue-500`} />;
    case "pdf":
      return <FileText className={`${className} text-red-500`} />;
    case "text":
      return <BookOpen className={`${className} text-green-500`} />;
    case "quiz":
      return <HelpCircle className={`${className} text-purple-500`} />;
    default:
      return <FileText className={`${className} text-gray-400`} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Section Quiz – renders quizData JSON from a SectionItem
// ─────────────────────────────────────────────────────────────────────────────
SectionQuiz.propTypes = {
  item: PropTypes.object.isRequired,
  courseId: PropTypes.string,
  onComplete: PropTypes.func.isRequired,
  isCompleted: PropTypes.bool,
};
function SectionQuiz({ item, courseId, onComplete, isCompleted }) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [attempts, setAttempts] = useState(0);

  let quizData = item.quizData;
  if (typeof quizData === "string") {
    try {
      quizData = JSON.parse(quizData);
    } catch {
      quizData = null;
    }
  }

  const questions =
    quizData?.questions || (Array.isArray(quizData) ? quizData : []);
  const passingScore = item.quizPassingScore ?? 80;
  const maxAttempts = item.maxAttempts ?? 3;

  const getCorrectAnswer = (q) =>
    q?.correctAnswer ?? q?.correct_answer ?? q?.correctOptionId ?? null;

  const normalizeQuestionType = (q) => {
    const raw = q?.type || q?.questionType || q?.question_type || null;
    if (raw === "multiple-choice" || raw === "multiple_choice")
      return "multiple_choice";
    if (raw === "true-false" || raw === "true_false") return "true_false";
    if (raw === "short-answer" || raw === "short_answer") return "short_answer";

    // Heuristics for older data
    const opts = q?.options;
    if (Array.isArray(opts)) {
      const labels = opts.map((o) =>
        typeof o === "string"
          ? o
          : o?.label || o?.text || o?.value || o?.id || "",
      );
      const normalized = labels.map((s) => String(s).toLowerCase());
      if (
        normalized.includes("true") ||
        normalized.includes("false") ||
        normalized.includes("vrai") ||
        normalized.includes("faux")
      ) {
        return "true_false";
      }
      return "multiple_choice";
    }
    return "true_false";
  };

  const getOptionId = (opt) => {
    if (opt && typeof opt === "object") {
      return opt.id || opt.value || opt.label || opt.text || null;
    }
    return opt ?? null;
  };

  const getOptionLabel = (opt) => {
    if (opt && typeof opt === "object") {
      return opt.label || opt.text || opt.value || opt.id || "";
    }
    return String(opt ?? "");
  };

  const handleAnswer = (questionId, value) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleCheckboxAnswer = (questionId, optId) => {
    if (submitted) return;
    setAnswers((prev) => {
      const prevVal = prev[questionId];
      const arr = Array.isArray(prevVal) ? [...prevVal] : [];
      const idx = arr.indexOf(optId);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(optId);
      return { ...prev, [questionId]: arr };
    });
  };

  const normalizeBoolFr = (val) => {
    if (val === true || val === "true" || val === "True") return "Vrai";
    if (val === false || val === "false" || val === "False") return "Faux";
    if (val === "Vrai" || val === "Faux") return val;
    return val;
  };

  const normalizeText = (val) =>
    String(val ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const handleSubmit = async () => {
    if (questions.length === 0) return;

    let correct = 0;
    questions.forEach((q, idx) => {
      const qId = q.id || q._id || String(q.order ?? idx);
      const qType = normalizeQuestionType(q);

      if (qType === "short_answer") {
        const expected = normalizeText(getCorrectAnswer(q));
        const actual = normalizeText(answers[qId]);
        if (expected && actual && expected === actual) correct++;
        return;
      }

      if (qType === "true_false") {
        const expected = normalizeBoolFr(getCorrectAnswer(q));
        const actual = normalizeBoolFr(answers[qId]);
        if (expected && actual && String(expected) === String(actual))
          correct++;
        return;
      }

      // multiple_choice (supports multi-correct)
      const expectedMulti = Array.isArray(q?.correctAnswers)
        ? q.correctAnswers.map((x) => String(x))
        : null;
      const expectedSingle = getCorrectAnswer(q);
      const expected =
        expectedMulti && expectedMulti.length > 0
          ? expectedMulti
          : expectedSingle
            ? [String(expectedSingle)]
            : [];
      const actualVal = answers[qId];
      const actual = Array.isArray(actualVal)
        ? actualVal.map((x) => String(x))
        : actualVal
          ? [String(actualVal)]
          : [];

      const expSorted = [...new Set(expected)].sort();
      const actSorted = [...new Set(actual)].sort();
      const sameLength = expSorted.length === actSorted.length;
      const same =
        sameLength && expSorted.every((v, i2) => v === actSorted[i2]);
      if (same && expSorted.length > 0) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    setAttempts((a) => a + 1);

    const passed = pct >= passingScore;
    if (!passed) return;

    const res = await EnrollmentAPI.markItemComplete(courseId, item.id, {
      quizScore: pct,
      quizPassed: true,
      timeSpent: 0,
    });

    if (res?.success) onComplete(item.id);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>{t("No quiz questions available", "No quiz questions available")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <h2 className="text-xl font-bold text-purple-800 mb-1">{item.title}</h2>
        <p className="text-sm text-purple-600">
          {t("Passing score", "Passing score")}: {passingScore}% &nbsp;|&nbsp;
          {t("Attempts", "Attempts")}: {attempts}/{maxAttempts}
        </p>
      </div>

      {/* Result */}
      {submitted && (
        <div
          className={`mb-6 p-4 rounded-xl border text-center ${
            score >= passingScore
              ? "bg-green-50 border-green-300 text-green-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <p className="text-2xl font-bold mb-1">{score}%</p>
          <p className="font-medium">
            {score >= passingScore
              ? t("Quiz passed! Great job.", "Quiz passed! Great job.")
              : t("Quiz failed. Try again.", "Quiz failed. Try again.")}
          </p>
          {score < passingScore && attempts < maxAttempts && (
            <button
              onClick={handleRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              {t("Retry", "Retry")}
            </button>
          )}
        </div>
      )}

      {/* Questions */}
      {!submitted && (
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const qId = q.id || q._id || String(q.order ?? idx);
            const qType = normalizeQuestionType(q);
            return (
              <div
                key={qId}
                className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <p className="font-semibold text-gray-800 mb-4">
                  {idx + 1}. {q.text || q.question}
                </p>
                {qType === "short_answer" ? (
                  <div>
                    <input
                      type="text"
                      value={answers[qId] || ""}
                      onChange={(e) => handleAnswer(qId, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder=""
                    />
                  </div>
                ) : qType === "true_false" ? (
                  <div className="flex gap-4">
                    {["Vrai", "Faux"].map((val) => (
                      <label
                        key={val}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          answers[qId] === val
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${qId}`}
                          value={val}
                          checked={answers[qId] === val}
                          onChange={() => handleAnswer(qId, val)}
                          className="text-purple-600"
                        />
                        <span className="font-medium">{t(val)}</span>
                      </label>
                    ))}
                  </div>
                ) : Array.isArray(q.options) ? (
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const optId =
                        getOptionId(opt) ?? `${qId}_opt_${optIndex}`;
                      const optLabel = getOptionLabel(opt);
                      const displayedLabel =
                        optLabel === "True" || optLabel === "False"
                          ? t(optLabel)
                          : optLabel;
                      const checked = Array.isArray(answers[qId])
                        ? answers[qId].includes(optId)
                        : answers[qId] === optId;
                      return (
                        <label
                          key={optId}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            checked
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name={`q_${qId}_${optId}`}
                            value={optId}
                            checked={checked}
                            onChange={() => toggleCheckboxAnswer(qId, optId)}
                            className="text-purple-600"
                          />
                          <span className="text-gray-700">
                            {displayedLabel}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500" />
                )}
              </div>
            );
          })}

          <button
            onClick={handleSubmit}
            disabled={questions.some((q, idx) => {
              const qId = q.id || q._id || String(q.order ?? idx);
              const qType = normalizeQuestionType(q);
              const val = answers[qId];
              if (qType === "short_answer") return !String(val || "").trim();
              if (qType === "true_false") return !val;
              // multiple_choice
              return !Array.isArray(val) || val.length === 0;
            })}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {t("Submit Quiz", "Submit Quiz")}
          </button>
        </div>
      )}

      {/* Already completed */}
      {isCompleted && !submitted && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700 text-sm text-center">
          <FaCheckCircle className="inline mr-2" />
          {t(
            "You have already completed this quiz",
            "You have already completed this quiz",
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Viewer
// ─────────────────────────────────────────────────────────────────────────────
PdfViewer.propTypes = {
  item: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  isCompleted: PropTypes.bool,
};
function PdfViewer({ item, onComplete, isCompleted }) {
  const { t } = useTranslation();
  const [marked, setMarked] = useState(isCompleted);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    setMarked(isCompleted);
  }, [isCompleted]);

  const handleMark = async () => {
    if (marking || marked) return;
    setMarking(true);
    try {
      const res = await onComplete(item.id);
      if (res?.success) setMarked(true);
    } finally {
      setMarking(false);
    }
  };

  // Route through the media stream endpoint (direct /Courses_PDFs/ access
  // is blocked by the media protection middleware).
  const url = item.pdfUrl;
  const _pdfBasename = url?.split("/").pop();
  const embedUrl = url?.startsWith("http")
    ? url
    : _pdfBasename
      ? `${getApiBaseUrl()}/media/stream/pdf/${encodeURIComponent(_pdfBasename)}`
      : buildApiUrl(url);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{item.title}</h2>
        {!marked ? (
          <button
            onClick={handleMark}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <FaCheckCircle /> {t("Mark as Read", "Mark as Read")}
          </button>
        ) : (
          <span className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <FaCheckCircle /> {t("Completed", "Completed")}
          </span>
        )}
      </div>
      {item.description && (
        <p className="text-gray-600 text-sm">{item.description}</p>
      )}
      {url ? (
        <iframe
          src={embedUrl}
          className="w-full rounded-xl border border-gray-200 shadow-sm"
          style={{ height: "75vh" }}
          title={item.title}
        />
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
          <p>{t("PDF not available", "PDF not available")}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Text Reader
// ─────────────────────────────────────────────────────────────────────────────
TextReader.propTypes = {
  item: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  isCompleted: PropTypes.bool,
};
function TextReader({ item, onComplete, isCompleted }) {
  const { t, i18n } = useTranslation();
  const [marked, setMarked] = useState(isCompleted);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    setMarked(isCompleted);
  }, [isCompleted]);
  const content =
    i18n.language === "ar" && item.textContent_ar
      ? item.textContent_ar
      : item.textContent || "";

  const handleMark = async () => {
    if (marking || marked) return;
    setMarking(true);
    try {
      const res = await onComplete(item.id);
      if (res?.success) setMarked(true);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{item.title}</h2>
        {!marked ? (
          <button
            onClick={handleMark}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <FaCheckCircle /> {t("Mark as Read", "Mark as Read")}
          </button>
        ) : (
          <span className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <FaCheckCircle /> {t("Completed", "Completed")}
          </span>
        )}
      </div>
      <div className="prose prose-gray max-w-none p-6 bg-white rounded-xl border border-gray-200 shadow-sm leading-relaxed">
        {content ? (
          <RichTextDisplay content={content} className="max-w-none" />
        ) : (
          <p>{t("No content available", "No content available")}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Player
// ─────────────────────────────────────────────────────────────────────────────
VideoItemPlayer.propTypes = {
  item: PropTypes.object.isRequired,
  courseId: PropTypes.string,
  onComplete: PropTypes.func.isRequired,
  isCompleted: PropTypes.bool,
};
function VideoItemPlayer({ item, courseId, onComplete, isCompleted }) {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(0);
  const completedRef = useRef(isCompleted);
  const completingRef = useRef(false);
  const lastAttemptRef = useRef(0);
  completedRef.current = isCompleted;

  // Fetch a signed delivery URL from the server instead of redirecting
  // <video> through the stream endpoint. This avoids the CORS failure that
  // happens when crossOrigin="use-credentials" + CDN 302 redirect interact.
  const _videoPath = item.videoUrl;
  const _videoBasename = _videoPath?.split("/").pop();
  const [resolvedUrl, setResolvedUrl] = useState(null);

  useEffect(() => {
    if (!_videoBasename) return;
    if (_videoPath?.startsWith("http")) {
      setResolvedUrl(_videoPath);
      return;
    }
    apiClient
      .get(`/media/signed-url/video/${_videoBasename}`)
      .then((res) => setResolvedUrl(res.data?.url || null))
      .catch(() => setResolvedUrl(null));
  }, [_videoBasename, _videoPath]);

  // Bunny CDN URLs are direct external URLs — the browser must NOT send
  // credentials to them (Bunny responds with * which blocks credentialed
  // requests). For local server stream URLs, keep crossOrigin so cookies
  // flow and the server can do session binding.
  const isBunnyUrl =
    resolvedUrl &&
    (resolvedUrl.includes(".b-cdn.net") ||
      resolvedUrl.includes("bunnycdn.com") ||
      resolvedUrl.includes("bunny.net"));
  const videoCrossOrigin = isBunnyUrl ? null : "use-credentials";

  const markCompleteOnce = useCallback(
    (watchedSeconds) => {
      if (completedRef.current || completingRef.current) return;
      const now = Date.now();
      if (now - lastAttemptRef.current < 5000) return;
      lastAttemptRef.current = now;
      completingRef.current = true;
      EnrollmentAPI.markItemComplete(courseId, item.id, {
        watchedDuration: Math.round(watchedSeconds || 0),
        timeSpent: Math.round(watchedSeconds || 0),
      })
        .then((res) => {
          if (res.success) {
            completedRef.current = true;
            onComplete(item.id);
          }
        })
        .catch(() => {})
        .finally(() => {
          completingRef.current = false;
        });
    },
    [courseId, item.id, onComplete],
  );

  const handleTimeUpdate = useCallback(
    (cur) => {
      if (!duration || duration <= 0) return;
      if ((cur / duration) * 100 >= 90) {
        markCompleteOnce(cur);
      }
    },
    [duration, markCompleteOnce],
  );

  const handleEnded = useCallback(() => {
    markCompleteOnce(duration || 0);
  }, [duration, markCompleteOnce]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{item.title}</h2>
        {isCompleted && (
          <span className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <FaCheckCircle /> {t("Completed", "Completed")}
          </span>
        )}
      </div>
      {item.description && (
        <p className="text-gray-600 text-sm">{item.description}</p>
      )}

      <div className="relative mx-auto w-full max-w-[860px] overflow-hidden rounded-2xl bg-black shadow-2xl border border-gray-200">
        {resolvedUrl ? (
          <VideoPlayer
            src={resolvedUrl}
            crossOrigin={videoCrossOrigin}
            title={item.title}
            className="aspect-video"
            onDurationChange={(d) => setDuration(d)}
            onTimeUpdate={(cur) => handleTimeUpdate(cur)}
            onEnded={handleEnded}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center p-8">
              <p className="text-gray-400 text-sm">
                {t("Video not available", "Video not available")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline review widget for the watch page
// ─────────────────────────────────────────────────────────────────────────────
CourseReviewWidget.propTypes = {
  courseId: PropTypes.string,
  courseData: PropTypes.object,
};
function CourseReviewWidget({ courseId, courseData }) {
  const { t } = useTranslation();
  const initial = courseData?.userReview || null;
  const [userReview, setUserReview] = useState(initial);
  const [rateValue, setRateValue] = useState(initial?.Rate || 0);
  const [comment, setComment] = useState(initial?.Comment || "");
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          className={
            s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rateValue) {
      toast.error("Please select a rating.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await reviewsAPI.submitCourseReview(courseId, {
        rate: rateValue,
        comment,
      });
      setUserReview(res.data.review);
      setEditMode(false);
      toast.success(res.data.message || "Review submitted!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "Are you sure you want to delete your review permanently?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      setDeleting(true);
      await reviewsAPI.deleteCourseReview(courseId);
      setUserReview(null);
      setRateValue(0);
      setComment("");
      await Swal.fire({
        title: "Success!",
        text: "Review deleted.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      toast.success("Review deleted.");
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err?.response?.data?.message || "Failed to delete review.",
        icon: "error",
      });
      toast.error(err?.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-[860px] mx-auto mt-10 mb-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          {t("Rate this course", "Rate this course") || "Rate this course"}
        </h3>

        {userReview && !editMode ? (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            {renderStars(userReview.Rate)}
            {userReview.Comment && (
              <p className="text-sm text-gray-700 mt-2">{userReview.Comment}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setRateValue(userReview.Rate);
                  setComment(userReview.Comment || "");
                  setEditMode(true);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-medium bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-60 transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRateValue(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= rateValue ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-300 hover:text-yellow-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Saving..." : "Submit Review"}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Course Support / Report-a-problem widget
// ─────────────────────────────────────────────────────────────────────────────
CourseSupportWidget.propTypes = {
  courseId: PropTypes.string,
  currentItem: PropTypes.object,
  user: PropTypes.object,
};
function CourseSupportWidget({ courseId, currentItem, user }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const name =
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.FirstName
            ? `${user.FirstName} ${user.LastName}`
            : user?.name || "User";
      const email = user?.email || "";
      const itemLabel = currentItem?.title ? ` — ${currentItem.title}` : "";

      const res = await apiClient.post("/contact/auth-user", {
        name,
        email,
        message: `[Course Issue${itemLabel}]\n${message}`,
        messagePlain: `[Course Issue${itemLabel}]\n${message}`,
        context: "course",
        courseId,
        priority: "high",
      });
      if (res.status === 201 || res.data?.success) {
        setSent(true);
        setMessage("");
        setTimeout(() => setSent(false), 4000);
      } else {
        toast.error("Failed to send report. Please try again.");
      }
    } catch {
      toast.error("Failed to send report. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-[860px] mx-auto mt-4 mb-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-base font-bold text-gray-900">
            {t("Report a problem", "Report a problem") || "Report a problem"}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {open && (
          <div className="mt-4">
            {sent ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm font-medium">
                <FaCheckCircle className="w-4 h-4 flex-shrink-0" />
                {t("Report sent", "Report sent") ||
                  "Your report has been sent. We'll look into it soon!"}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-sm text-gray-500">
                  {t(
                    "report_desc",
                    "Describe the problem you encountered with this lesson or content.",
                  ) ||
                    "Describe the issue with this lesson (e.g. video not loading, wrong content, etc.) and we'll fix it as soon as possible."}
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                  placeholder={
                    t(
                      "report_placeholder",
                      "e.g. Video won't play, audio is out of sync, subtitle error…",
                    ) ||
                    "e.g. The video is not loading / The content is incorrect…"
                  }
                />
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  {sending
                    ? t("Sending…", "Sending…") || "Sending…"
                    : t("Send report", "Send report") || "Send report"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CourseSections component
// ─────────────────────────────────────────────────────────────────────────────
export function CourseSections() {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [currentItem, setCurrentItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);

  // Progress
  const [completedItems, setCompletedItems] = useState(new Set());
  const [totalItems, setTotalItems] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const initialItemSet = useRef(false);

  const {
    courseData,
    loading,
    error,
    hasError,
    isEnrolled,
    canAccessContent,
    hasData,
  } = useCourse(courseId);

  // Redirect only when the user cannot access the content.
  useEffect(() => {
    if (hasData && !canAccessContent) {
      navigate(`/Courses/${courseId}`);
    }
  }, [hasData, canAccessContent, courseId, navigate]);

  // ZIP courses don't use the watch experience.
  useEffect(() => {
    const uploadType = String(
      courseData?.course?.uploadType || "",
    ).toLowerCase();
    if (hasData && uploadType === "zip") {
      navigate(`/Courses/${courseId}/explore`, { replace: true });
    }
  }, [hasData, courseData?.course?.uploadType, courseId, navigate]);

  // Load progress from backend
  useEffect(() => {
    if (!courseId || !user) return;
    EnrollmentAPI.getCourseProgress(courseId)
      .then((res) => {
        if (res.success && res.data) {
          const ids = res.data.completedItemIds || [];
          setCompletedItems(new Set(ids.map((x) => String(x))));
          setTotalItems(res.data.totalItems || 0);
        }
      })
      .catch(() => {})
      .finally(() => setProgressLoaded(true));
  }, [courseId, user]);

  // Auto-expand all sections and select first item
  useEffect(() => {
    const course = courseData?.course;
    if (!course) return;

    const rawSects = course.sections || [];
    const legVids = course.videos || [];
    const activeSections =
      rawSects.length > 0
        ? rawSects
        : legVids.length > 0
          ? [
              {
                id: "legacy",
                title: "Course Content",
                items: legVids.map((v) => ({
                  id: v.id,
                  title: v.title,
                  type: "video",
                  videoUrl: v.video || v.videoUrl || v.VideoUrl,
                  isRequired: true,
                })),
              },
            ]
          : [];

    if (!activeSections.length) return;

    const expanded = {};
    activeSections.forEach((s) => {
      expanded[s.id] = true;
    });
    setExpandedSections(expanded);

    // Update total items count from sections
    const total = activeSections.reduce(
      (sum, s) => sum + (s.items?.length || 0),
      0,
    );
    if (total > 0) setTotalItems((prev) => (prev === 0 ? total : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseData]);

  // Resume to the first incomplete item once both course data and progress are ready
  useEffect(() => {
    if (initialItemSet.current) return;
    const course = courseData?.course;
    if (!course || !progressLoaded) return;

    const rawSects = course.sections || [];
    const legVids = course.videos || [];
    const activeSections =
      rawSects.length > 0
        ? rawSects
        : legVids.length > 0
          ? [
              {
                id: "legacy",
                title: "Course Content",
                items: legVids.map((v) => ({
                  id: v.id,
                  title: v.title,
                  type: "video",
                  videoUrl: v.video || v.videoUrl || v.VideoUrl,
                  isRequired: true,
                })),
              },
            ]
          : [];

    const allItems = activeSections.flatMap((s) => s.items || []);
    if (!allItems.length) return;

    const firstIncomplete = allItems.find(
      (item) => !completedItems.has(String(item.id)),
    );
    setCurrentItem(firstIncomplete || allItems[0]);
    initialItemSet.current = true;
  }, [courseData, progressLoaded, completedItems]);

  const handleItemComplete = useCallback(async (itemId) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      next.add(String(itemId));
      return next;
    });
  }, []);

  // Mark current item complete then advance to next
  const handleNextWithComplete = useCallback(
    (nextItem) => {
      if (currentItem && !completedItems.has(String(currentItem.id))) {
        // Fire-and-forget: mark complete but don't block navigation
        EnrollmentAPI.markItemComplete(courseId, currentItem.id, {
          watchedDuration: 0,
        }).then((res) => {
          if (res.success) handleItemComplete(currentItem.id);
        });
      }
      setCurrentItem(nextItem);
    },
    [currentItem, completedItems, courseId, handleItemComplete],
  );

  const handleCertificateClick = async () => {
    const studentName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.FirstName
          ? `${user.FirstName} ${user.LastName}`
          : user?.name || "";

    const result = await Swal.fire({
      title:
        t("certificate.realNameTitle", "Your Certificate Name") ||
        "Certificate Name",
      html: `
                <p style="margin-bottom:10px;color:#374151">
                    ${
                      t(
                        "certificate.realNameWarning",
                        "Your full name will appear on the certificate exactly as entered. Please make sure it is correct.",
                      ) ||
                      "Your certificate will be issued under your real name. This cannot be changed later."
                    }
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

  // ── Early returns ──────────────────────────────────────────────────────
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

  const course = courseData?.course;

  // Build sections: prefer course.sections; fall back to synthetic section from course.videos
  const rawSections = course?.sections || [];
  const legacyVideos = course?.videos || [];
  const hasSections = rawSections.length > 0;
  const hasLegacyVideos = !hasSections && legacyVideos.length > 0;

  const sections = hasSections
    ? rawSections
    : hasLegacyVideos
      ? [
          {
            id: "legacy",
            title: t("Course Content", "Course Content"),
            items: legacyVideos.map((v) => ({
              id: v.id,
              title: v.title,
              type: "video",
              videoUrl: v.video || v.videoUrl || v.VideoUrl,
              videoDuration: v.duration,
              description: v.description,
              isRequired: true,
            })),
          },
        ]
      : [];

  // If genuinely no content at all, show the full shell (sidebar + empty
  // main area) so the user can still leave a review and report a problem.
  if (!hasSections && !hasLegacyVideos) {
    return (
      <div className="w-full flex-col bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between">
          <button
            onClick={() => navigate(`/Courses/${courseId}`)}
            className="flex items-center gap-2 text-gray-600 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            {course?.Title || t("Back to course", "Back to course")}
          </button>
        </div>

        <div className="flex flex-row w-full min-h-screen">
          {/* Sidebar */}
          <aside className="hidden md:flex md:w-80 lg:w-96 flex-shrink-0">
            <div className="flex flex-col px-6 border-r border-gray-200 min-h-screen bg-white shadow-sm w-full overflow-y-auto">
              <button
                onClick={() => navigate(`/Courses/${courseId}`)}
                className="mt-6 mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-all group"
              >
                <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                {t("Back to course", "Back to course")}
              </button>
              <h1 className="text-xl font-bold leading-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-5">
                {course?.Title}
              </h1>
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {t("Progress", "Progress")}
                  </span>
                  <span className="text-lg font-bold text-blue-600">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                    style={{ width: "0%" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  0 / 0 {t("items completed", "Items completed")}
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-12">
                {t("No lessons yet", "No lessons yet")}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 p-6 md:p-8">
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700">
                {t(
                  "This course has no content yet",
                  "This course has no content yet",
                )}
              </h2>
              <p className="text-gray-500 text-sm max-w-xs">
                {t(
                  "Content will appear here once the instructor publishes lessons.",
                )}
              </p>
              <button
                onClick={() => navigate(`/Courses/${courseId}`)}
                className="mt-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
              >
                {t("Go back to course", "Go back to course")}
              </button>
            </div>

            <CourseReviewWidget courseId={courseId} courseData={courseData} />
            <CourseSupportWidget
              courseId={courseId}
              currentItem={null}
              user={user}
            />
          </main>
        </div>
      </div>
    );
  }

  const hasCertificate =
    course?.certificate === true && String(course?.uploadType) !== "zip";
  const isCertificateUnlocked =
    totalItems > 0 && completedItems.size >= totalItems;

  const progressPct =
    totalItems > 0 ? Math.round((completedItems.size / totalItems) * 100) : 0;

  // ── Sidebar section/item list ──────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <button
        onClick={() => navigate(`/Courses/${courseId}`)}
        className="mt-6 mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-all group"
      >
        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        {t("Back to course", "Back to course")}
      </button>

      <h1 className="text-xl font-bold leading-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-5">
        {course.Title}
      </h1>

      {/* Progress */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {t("Progress", "Progress")}
          </span>
          <span className="text-lg font-bold text-blue-600">
            {progressPct}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completedItems.size} / {totalItems}{" "}
          {t("items completed", "Items completed")}
        </p>
      </div>
      {/* Certificate button */}
      {hasCertificate && (
        <div
          className={`my-4 p-4 rounded-xl border-2 transition-all ${
            isCertificateUnlocked
              ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md cursor-pointer"
              : "border-gray-200 bg-gray-50"
          }`}
          onClick={isCertificateUnlocked ? handleCertificateClick : undefined}
        >
          {isCertificateUnlocked ? (
            <div className="flex items-center gap-3 text-purple-700 font-semibold">
              <FaCheckCircle className="w-5 h-5 text-purple-600 animate-bounce" />
              <span className="flex-1">{t("Certificate", "certificate")}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
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
      {/* Sections accordion */}
      <nav className="flex-1 overflow-y-auto space-y-3 pb-4">
        {sections.map((section) => {
          const isExpanded = expandedSections[section.id] !== false;
          const sectionItems = section.items || [];
          const sectionDone = sectionItems.filter((i) =>
            completedItems.has(String(i.id)),
          ).length;

          return (
            <div
              key={section.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Section header */}
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    [section.id]: !isExpanded,
                  }))
                }
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {section.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sectionDone}/{sectionItems.length}{" "}
                    {t("completed", "Completed")}
                  </p>
                </div>
                {sectionItems.length > 0 &&
                sectionDone === sectionItems.length ? (
                  <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                ) : isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                )}
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {sectionItems.map((item) => {
                    const isActive = currentItem?.id === item.id;
                    const isDone = completedItems.has(String(item.id));

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentItem(item);
                          setShowCertificate(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                          isActive
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : isDone
                              ? "bg-green-50 hover:bg-green-100"
                              : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {/* Completion icon */}
                        <div className="flex-shrink-0">
                          {isDone ? (
                            <FaCheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <ItemTypeIcon
                              type={item.type}
                              className="w-5 h-5"
                            />
                          )}
                        </div>
                        {/* Title */}
                        <span
                          className={`text-sm font-medium flex-1 truncate ${
                            isActive
                              ? "text-blue-700"
                              : isDone
                                ? "text-green-700"
                                : "text-gray-700"
                          }`}
                        >
                          {item.title}
                        </span>
                        {isActive && (
                          <Play className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );

  // ── Main content renderer based on item type ───────────────────────────
  const renderMainContent = () => {
    if (showCertificate) {
      return (
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-zinc-800">
              {t("Course Certificate", "Course Certificate")}
            </h1>
            <button
              onClick={() => setShowCertificate(false)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>{t("Back", "Back")}</span>
            </button>
          </div>
          <Certificate />
        </div>
      );
    }

    if (!currentItem) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>
            {t(
              "Select an item from the sidebar to begin",
              "Select an item from the sidebar to begin",
            )}
          </p>
        </div>
      );
    }

    const done = completedItems.has(String(currentItem.id));

    switch (currentItem.type) {
      case "video":
        return (
          <VideoItemPlayer
            key={currentItem.id}
            item={currentItem}
            courseId={courseId}
            onComplete={handleItemComplete}
            isCompleted={done}
          />
        );
      case "pdf":
        return (
          <PdfViewer
            key={currentItem.id}
            item={currentItem}
            onComplete={async (id) => {
              const res = await EnrollmentAPI.markItemComplete(courseId, id, {
                timeSpent: 0,
              });
              if (res.success) handleItemComplete(id);
              return res;
            }}
            isCompleted={done}
          />
        );
      case "text":
        return (
          <TextReader
            key={currentItem.id}
            item={currentItem}
            onComplete={async (id) => {
              const res = await EnrollmentAPI.markItemComplete(courseId, id, {
                timeSpent: 0,
              });
              if (res.success) handleItemComplete(id);
              return res;
            }}
            isCompleted={done}
          />
        );
      case "quiz":
        return (
          <SectionQuiz
            key={currentItem.id}
            item={currentItem}
            courseId={courseId}
            onComplete={handleItemComplete}
            isCompleted={done}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            <p>
              {t("Unknown item type", "Unknown item type")}: {currentItem.type}
            </p>
          </div>
        );
    }
  };

  // ── Navigation helpers ─────────────────────────────────────────────────
  const allItems = sections.flatMap((s) => s.items || []);
  const currentIdx = allItems.findIndex((i) => i.id === currentItem?.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allItems.length - 1;
  // Course can be finished only when ALL quiz items are passed
  const allQuizItems = allItems.filter((i) => i.type === "quiz");
  const canFinishCourse =
    allQuizItems.length === 0 ||
    allQuizItems.every((qi) => completedItems.has(String(qi.id)));

  useScrollLock(sidebarOpen);

  return (
    <div className="w-full flex-col bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-[999] flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
          aria-label="Open menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="font-semibold text-gray-800 truncate max-w-[200px]">
          {currentItem?.title || course?.Title}
        </span>
        <span className="text-sm text-blue-600 font-bold">{progressPct}%</span>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[998]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar panel */}
      <div
        className={`md:hidden fixed top-0 left-0 h-[100dvh] w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[999] overflow-y-auto overscroll-contain px-5 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </div>

      {/* Main layout */}
      <div className="flex-1 w-full max-w-[1360px] mx-auto flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-80 lg:w-96 flex-shrink-0">
          <div className="flex flex-col px-6 border-r border-gray-200 min-h-screen bg-white shadow-sm w-full overflow-y-auto">
            <SidebarContent />
          </div>
        </aside>

        {/* Content area */}
        <main className="flex-1 min-w-0 p-6 md:p-8">
          {renderMainContent()}

          {/* Prev / Next navigation */}
          {!showCertificate && currentItem && (
            <div className="flex items-center justify-between mt-8 max-w-[860px] mx-auto">
              <button
                onClick={() =>
                  hasPrev && setCurrentItem(allItems[currentIdx - 1])
                }
                disabled={!hasPrev}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("Previous", "Previous")}
              </button>

              {hasNext ? (
                <button
                  onClick={() =>
                    handleNextWithComplete(allItems[currentIdx + 1])
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
                >
                  {t("Next", "Next")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : hasCertificate ? (
                <button
                  onClick={canFinishCourse ? handleCertificateClick : undefined}
                  disabled={!canFinishCourse}
                  title={
                    !canFinishCourse
                      ? t(
                          "Pass the quiz to continue",
                          "Pass the quiz to continue",
                        ) || "Pass the quiz to continue"
                      : ""
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm font-medium ${
                    canFinishCourse
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canFinishCourse ? (
                    <FaCheckCircle className="w-4 h-4" />
                  ) : (
                    <FaLock className="w-4 h-4" />
                  )}
                  {t("End of course", "End of course")}
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white shadow-sm font-medium"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  {t("Course completed", "Course completed")}
                </button>
              )}
            </div>
          )}

          {/* Review widget – always visible for enrolled users */}
          {!showCertificate && (
            <CourseReviewWidget courseId={courseId} courseData={courseData} />
          )}

          {/* Support / report-a-problem widget */}
          {!showCertificate && currentItem && (
            <CourseSupportWidget
              courseId={courseId}
              currentItem={currentItem}
              user={user}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default CourseSections;
