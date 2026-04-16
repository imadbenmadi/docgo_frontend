import { CheckCircle, XCircle } from "lucide-react";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import EnrollmentAPI from "../API/Enrollment";

// Question Components

const MultipleChoiceQuestion = ({
    question,
    selectedAnswer,
    onAnswerChange,
}) => (
    <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
        <div className="mt-4 space-y-3">
            {question.options.map((option) => (
                <label
                    key={option.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                    <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={selectedAnswer === option.id}
                        onChange={(e) =>
                            onAnswerChange(question.id, e.target.value)
                        }
                        className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
            ))}
        </div>
    </div>
);

const TrueFalseQuestion = ({ question, selectedAnswer, onAnswerChange }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800">
                {question.text}
            </h3>
            <div className="mt-4 flex space-x-4">
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex-1 justify-center">
                    <input
                        type="radio"
                        name={question.id}
                        value="True"
                        checked={selectedAnswer === "True"}
                        onChange={(e) =>
                            onAnswerChange(question.id, e.target.value)
                        }
                        className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700">
                        {t("quiz_page.true", "True")}
                    </span>
                </label>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex-1 justify-center">
                    <input
                        type="radio"
                        name={question.id}
                        value="False"
                        checked={selectedAnswer === "False"}
                        onChange={(e) =>
                            onAnswerChange(question.id, e.target.value)
                        }
                        className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700">
                        {t("quiz_page.false", "False")}
                    </span>
                </label>
            </div>
        </div>
    );
};

const CheckboxQuestion = ({ question, selectedAnswers, onAnswerChange }) => {
    const handleCheckboxChange = (optionId) => {
        const newAnswers = selectedAnswers.includes(optionId)
            ? selectedAnswers.filter((id) => id !== optionId)
            : [...selectedAnswers, optionId];
        onAnswerChange(question.id, newAnswers);
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800">
                {question.text}
            </h3>
            {question.instructions && (
                <p className="text-sm text-gray-500 mt-1">
                    {question.instructions}
                </p>
            )}
            <div className="mt-4 space-y-3">
                {question.options.map((option) => (
                    <label
                        key={option.id}
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            value={option.id}
                            checked={selectedAnswers.includes(option.id)}
                            onChange={() => handleCheckboxChange(option.id)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span className="ml-3 text-gray-700">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};

const TextAreaQuestion = ({ question, answer, onAnswerChange }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800">
                {question.text}
            </h3>
            <textarea
                value={answer}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                className="mt-4 w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder={t("quiz_page.textPlaceholder", "Write your answer here...")}
            />
        </div>
    );
};

const QuizResults = ({ results, onRetry, score }) => {
    const { t } = useTranslation();
    const totalQuestions = results.length;
    const correctAnswers = results.filter((r) => r.isCorrect).length;

    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {t("quiz_page.results", "Your Results")}
                </h2>
                <div
                    className="text-4xl font-bold mb-2"
                    style={{
                        color:
                            score >= 70
                                ? "#10b981"
                                : score >= 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                    }}
                >
                    {score}%
                </div>
                <p className="text-gray-600">
                    {correctAnswers} {t("quiz_page.of", "of")} {totalQuestions}{" "}
                    {t("quiz_page.question", "Question")}
                </p>
            </div>

            <div className="space-y-4">
                {results.map((result, index) => (
                    <div
                        key={result.questionId}
                        className="border border-gray-200 rounded-lg p-4"
                    >
                        <div className="flex items-start space-x-3">
                            {result.isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800 mb-2">
                                    Question {index + 1}: {result.questionText}
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>
                                        <strong>Votre réponse:</strong>{" "}
                                        {result.userAnswer}
                                    </p>
                                    {!result.isCorrect && (
                                        <p>
                                            <strong>Réponse correcte:</strong>{" "}
                                            {result.correctAnswer}
                                        </p>
                                    )}
                                    {result.feedback && (
                                        <p className="text-blue-600 mt-2">
                                            {result.feedback}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    {t("quiz_page.backToCourse", "Back to Course")}
                </button>
            </div>
        </div>
    );
};

function QuizContent({ quizData: propQuizData, onQuizResult }) {
    const { courseId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [lastResult, setLastResult] = useState(null);

    React.useEffect(() => {
        const passed = localStorage.getItem(
            `course_${courseId}_quiz_completed`,
        );
        const lastResultStr = localStorage.getItem(
            `course_${courseId}_quiz_last_result`,
        );
        if (passed === "true" && lastResultStr) {
            try {
                setLastResult(JSON.parse(lastResultStr));
            } catch {}
        }
    }, [courseId]);

    // Check if backend quiz format (array) or frontend format (object with sections)
    let normalizedQuizData;

    if (Array.isArray(propQuizData) && propQuizData.length > 0) {
        // Backend format: array of sections
        normalizedQuizData = { sections: propQuizData };
    } else if (
        propQuizData &&
        propQuizData.sections &&
        propQuizData.sections.length > 0
    ) {
        // Frontend format: object with sections property
        normalizedQuizData = propQuizData;
    } else {
        // Default quiz for testing
        normalizedQuizData = {
            sections: [
                {
                    title: "1) Choisissez la bonne réponse",
                    type: "multiple-choice",
                    questions: [
                        {
                            id: "q1",
                            text: "Lequel des éléments suivants N'EST PAS un principe clé du design ?",
                            correctAnswer: "D",
                            options: [
                                { id: "A", label: "Contraste" },
                                { id: "B", label: "Répétition" },
                                { id: "C", label: "Alignement" },
                                { id: "D", label: "Dissonance" },
                            ],
                        },
                    ],
                },
                {
                    title: "Pourquoi la recherche utilisateur est-elle importante dans le processus de design ?",
                    type: "checkbox",
                    instructions:
                        "Vous pouvez sélectionner plus de deux options",
                    questions: [
                        {
                            id: "q2",
                            text: "Pourquoi la recherche utilisateur est-elle importante dans le processus de design ?",
                            correctAnswer: ["B", "D"],
                            options: [
                                { id: "A", label: "Elle est coûteuse" },
                                {
                                    id: "B",
                                    label: "Elle permet de comprendre les besoins réels",
                                },
                                { id: "C", label: "Elle remplace les tests" },
                                {
                                    id: "D",
                                    label: "Elle améliore la satisfaction utilisateur",
                                },
                            ],
                        },
                    ],
                },
                {
                    title: "2) Répondez brièvement à ces questions",
                    type: "text",
                    questions: [
                        {
                            id: "q3",
                            text: "Qu'est-ce que le design thinking ?",
                            correctAnswer:
                                "Une approche centrée sur l'utilisateur pour résoudre des problèmes",
                        },
                        {
                            id: "q4",
                            text: "Citez deux avantages clés du prototypage dans le processus de design ?",
                            correctAnswer:
                                "Permet de tester rapidement les idées et d'identifier les problèmes tôt",
                        },
                    ],
                },
            ],
        };
    }

    const quizData = normalizedQuizData;

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const validateAnswers = async (answers) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const results = [];

        quizData.sections.forEach((section) => {
            section.questions.forEach((question) => {
                const userAnswer = answers[question.id];
                const correctAnswer = question.correctAnswer;
                let isCorrect = false;
                let feedback = "";

                if (section.type === "multiple-choice") {
                    isCorrect = userAnswer === correctAnswer;
                    feedback = isCorrect
                        ? "Bonne réponse !"
                        : `La bonne réponse était "${correctAnswer}".`;
                } else if (section.type === "true-false") {
                    // Accept both English and French values for true/false
                    const normalizeTF = (val) => {
                        if (!val) return "";
                        const v = val.toString().toLowerCase();
                        if (["true", "vrai"].includes(v)) return "true";
                        if (["false", "faux"].includes(v)) return "false";
                        return v;
                    };
                    isCorrect =
                        normalizeTF(userAnswer) === normalizeTF(correctAnswer);
                    feedback = isCorrect
                        ? "Bonne réponse !"
                        : `La bonne réponse était \"${correctAnswer}\".`;
                } else if (section.type === "checkbox") {
                    // Ensure both are arrays
                    const userArr = Array.isArray(userAnswer) ? userAnswer : [];
                    const correctArr = Array.isArray(correctAnswer)
                        ? correctAnswer
                        : [];
                    const userSet = new Set(userArr);
                    const correctSet = new Set(correctArr);
                    isCorrect =
                        userSet.size === correctSet.size &&
                        [...userSet].every((x) => correctSet.has(x));
                    feedback = isCorrect
                        ? "Bonne réponse !"
                        : `Les bonnes réponses étaient: ${correctArr.join(", ")}.`;
                } else if (section.type === "text") {
                    // Robust text comparison: trim, lowercase, ignore accents, require 70% similarity
                    const normalize = (str) =>
                        (str || "")
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                            .replace(/[^a-z0-9 ]/gi, "")
                            .trim();
                    const userNorm = normalize(userAnswer);
                    const correctNorm = normalize(correctAnswer);
                    // Simple similarity: at least 70% of correct answer words must appear in user answer
                    const correctWords = correctNorm.split(" ").filter(Boolean);
                    const userWords = userNorm.split(" ").filter(Boolean);
                    const matchCount = correctWords.filter((w) =>
                        userWords.includes(w),
                    ).length;
                    const similarity =
                        correctWords.length > 0
                            ? matchCount / correctWords.length
                            : 0;
                    isCorrect = similarity >= 0.7;
                    feedback = isCorrect
                        ? "Bonne réponse !"
                        : `Votre réponse pourrait être améliorée. Réponse attendue : ${correctAnswer}`;
                }

                results.push({
                    questionId: question.id,
                    questionText: question.text,
                    userAnswer: Array.isArray(userAnswer)
                        ? userAnswer.join(", ")
                        : userAnswer || "Pas de réponse",
                    correctAnswer: Array.isArray(correctAnswer)
                        ? correctAnswer.join(", ")
                        : correctAnswer,
                    isCorrect,
                    feedback,
                });
            });
        });

        return results;
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const allQuestions = quizData.sections.flatMap(
                (section) => section.questions,
            );
            const unansweredQuestions = allQuestions.filter(
                (q) => !userAnswers[q.id] || userAnswers[q.id].length === 0,
            );

            if (unansweredQuestions.length > 0) {
                await Swal.fire({
                    icon: "warning",
                    title: t("alerts.quiz.incompleteTitle", "Incomplete Quiz"),
                    text: t(
                        "alerts.quiz.incompleteText",
                        "Please answer all questions before submitting",
                    ),
                    confirmButtonColor: "#3b82f6",
                });
                setIsLoading(false);
                return;
            }

            const validationResults = await validateAnswers(userAnswers);
            const correctAnswers = validationResults.filter(
                (r) => r.isCorrect,
            ).length;
            const totalQuestions = validationResults.length;
            const score = Math.round((correctAnswers / totalQuestions) * 100);

            setQuizScore(score);
            setResults(validationResults);
            setIsSubmitted(true);

            const resultToStore = {
                validationResults,
                score,
            };
            localStorage.setItem(
                `course_${courseId}_quiz_last_result`,
                JSON.stringify(resultToStore),
            );

            // Send quiz results to backend
            try {
                await EnrollmentAPI.submitQuizResults(courseId, {
                    score: score,
                    correctAnswers: correctAnswers,
                    totalQuestions: totalQuestions,
                    answers: userAnswers,
                    completedAt: new Date().toISOString(),
                });
            } catch (error) {
                // Don't block the user if backend save fails
            }

            // Save quiz completion to unlock certificate
            if (score >= 50) {
                localStorage.setItem(
                    `course_${courseId}_quiz_completed`,
                    "true",
                );
                localStorage.setItem(
                    `course_${courseId}_quiz_score`,
                    score.toString(),
                );

                // Dispatch custom event to notify CourseVideos to unlock certificate
                window.dispatchEvent(new Event("storage"));

                if (onQuizResult) onQuizResult(true);

                await Swal.fire({
                    icon: "success",
                    title: t("alerts.quiz.successTitle", "Quiz Passed!"),
                    html: `<strong>${t("alerts.quiz.passText", "Congratulations! Your score is {{score}}%").replace("{{score}}", score)}</strong>`,
                    confirmButtonText: t(
                        "alerts.quiz.viewResults",
                        "View Results",
                    ),
                    confirmButtonColor: "#10b981",
                });
            } else {
                localStorage.setItem(
                    `course_${courseId}_quiz_completed`,
                    "false",
                );
                localStorage.setItem(
                    `course_${courseId}_quiz_score`,
                    score.toString(),
                );
                if (onQuizResult) onQuizResult(false);
                await Swal.fire({
                    icon: "info",
                    title: t("alerts.quiz.failTitle", "Quiz Failed"),
                    html: t(
                        "alerts.quiz.failText",
                        "Your score is {{score}}%. You need at least 50% to pass.",
                    ).replace("{{score}}", score),
                    confirmButtonText: t(
                        "alerts.quiz.viewResults",
                        "View Results",
                    ),
                    confirmButtonColor: "#3b82f6",
                });
            }
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: t("alerts.quiz.errorTitle", "Error"),
                text: t(
                    "alerts.quiz.errorText",
                    "An error occurred while submitting your quiz",
                ),
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        setUserAnswers({});
        setIsSubmitted(false);
        setResults([]);
        setLastResult(null);
        localStorage.removeItem(`course_${courseId}_quiz_completed`);
        localStorage.removeItem(`course_${courseId}_quiz_last_result`);
    };

    if (lastResult) {
        return (
            <main className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
                <>
                    <h2 className="text-xl font-bold text-green-700 mb-2">
                        {t("quiz_page.results", "Your Results")}
                    </h2>
                    <div className="mb-4 text-green-800">
                        {t("quiz_page.score", "Score")}: {lastResult.score}%
                    </div>
                    <QuizResults
                        results={lastResult.validationResults}
                        score={lastResult.score}
                        onRetry={handleRetry}
                    />
                </>
            </main>
        );
    }

    if (isSubmitted) {
        return (
            <main className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
                <QuizResults
                    results={results}
                    score={quizScore}
                    onRetry={handleRetry}
                />
            </main>
        );
    }

    return (
        <main className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
            <div className="overflow-hidden w-full max-md:mt-8 max-md:max-w-full">
                {quizData.sections.map((section, idx) => (
                    <section
                        key={idx}
                        className="mt-10 w-full max-md:max-w-full"
                    >
                        <h1 className="text-3xl font-semibold text-zinc-800 max-md:max-w-full">
                            {section.title}
                        </h1>
                        {section.instructions && (
                            <p className="text-base text-gray-600 mt-2">
                                {section.instructions}
                            </p>
                        )}
                        {section.questions.map((question) => {
                            if (section.type === "multiple-choice") {
                                return (
                                    <MultipleChoiceQuestion
                                        key={question.id}
                                        question={question}
                                        selectedAnswer={
                                            userAnswers[question.id] || ""
                                        }
                                        onAnswerChange={handleAnswerChange}
                                    />
                                );
                            }
                            if (section.type === "true-false") {
                                return (
                                    <TrueFalseQuestion
                                        key={question.id}
                                        question={question}
                                        selectedAnswer={
                                            userAnswers[question.id] || ""
                                        }
                                        onAnswerChange={handleAnswerChange}
                                    />
                                );
                            }
                            if (section.type === "checkbox") {
                                return (
                                    <CheckboxQuestion
                                        key={question.id}
                                        question={question}
                                        selectedAnswers={
                                            userAnswers[question.id] || []
                                        }
                                        onAnswerChange={handleAnswerChange}
                                    />
                                );
                            }
                            if (section.type === "text") {
                                return (
                                    <TextAreaQuestion
                                        key={question.id}
                                        question={question}
                                        answer={userAnswers[question.id] || ""}
                                        onAnswerChange={handleAnswerChange}
                                    />
                                );
                            }
                            return null;
                        })}
                    </section>
                ))}

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault && e.preventDefault();
                        handleSubmit();
                    }}
                    disabled={isLoading}
                    className="flex gap-2 justify-center items-center px-8 py-3 mt-10 max-w-full text-base text-white bg-blue-500 rounded-[56px] w-[275px] max-md:px-5 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 text-white"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                ></path>
                            </svg>
                            <span>{t("quiz_page.submitting", "Submitting...")}</span>
                        </>
                    ) : (
                        <span>{t("quiz_page.submit", "Submit Quiz")}</span>
                    )}
                </button>
            </div>
        </main>
    );
}

QuizContent.propTypes = {
    quizData: PropTypes.oneOfType([
        PropTypes.shape({
            sections: PropTypes.arrayOf(
                PropTypes.shape({
                    title: PropTypes.string.isRequired,
                    type: PropTypes.oneOf([
                        "multiple-choice",
                        "checkbox",
                        "text",
                        "true-false",
                    ]).isRequired,
                    instructions: PropTypes.string,
                    questions: PropTypes.arrayOf(
                        PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            text: PropTypes.string.isRequired,
                            correctAnswer: PropTypes.oneOfType([
                                PropTypes.string,
                                PropTypes.arrayOf(PropTypes.string),
                            ]),
                            options: PropTypes.arrayOf(
                                PropTypes.shape({
                                    id: PropTypes.string.isRequired,
                                    label: PropTypes.string.isRequired,
                                }),
                            ),
                        }),
                    ).isRequired,
                }),
            ).isRequired,
        }),
        PropTypes.array, // To support backend format
    ]),
    onQuizResult: PropTypes.func,
};

export default QuizContent;
