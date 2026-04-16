import jsPDF from "jspdf";
import { fabric } from "fabric";
import {
  Award,
  Calendar,
  Download,
  Eye,
  Link as LinkIcon,
  QrCode,
  Star,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { EnrollmentAPI } from "../API/Enrollment";
import { useAppContext } from "../AppContext";
import generatePDFCertificate from "../components/certificate/generatePDFCertificate";
import apiClient from "../utils/apiClient";
import { useCourse } from "../hooks/useCourse";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

export default function Certificate() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const certificateRef = useRef(null);
  const { courseId } = useParams();
  const { user } = useAppContext();
  const { courseData, loading } = useCourse(courseId);
  const course = courseData?.course;

  // DB-issued certificate state
  const [dbCertificate, setDbCertificate] = useState(null);
  const [isIssuingCertificate, setIsIssuingCertificate] = useState(false);
  const [certError, setCertError] = useState(null);

  // Admin certificate template (Fabric.js)
  const fabricCanvasRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const fabricInstanceRef = useRef(null);
  const [certTemplate, setCertTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [certImageUrl, setCertImageUrl] = useState(null);
  const [canvasRendered, setCanvasRendered] = useState(false);

  // Redirect if quiz score is not enough to unlock certificate
  useEffect(() => {
    // Try to get score from localStorage (most recent)
    const storedScore = localStorage.getItem(`course_${courseId}_quiz_score`);
    const score = storedScore ? parseInt(storedScore) : quizScore;
    // Only redirect if score < 50 AND we haven't loaded yet (first check)
    // For section-based courses, allow access even without quiz
    if (score < 50 && !storedScore) {
      // Don't redirect if this is a section-based course (no quiz required)
      // Just stay on the page
    }
  }, [courseId, quizScore, navigate]);

  // Load quiz score from localStorage and backend
  useEffect(() => {
    const loadQuizScore = async () => {
      // First try localStorage (most recent)
      const storedScore = localStorage.getItem(`course_${courseId}_quiz_score`);
      if (storedScore) {
        setQuizScore(parseInt(storedScore));
        return;
      }

      // Fallback to backend
      try {
        const response = await EnrollmentAPI.getCourseProgress(courseId);
        if (response?.data?.progress?.quizScore !== undefined) {
          setQuizScore(response.data.progress.quizScore);
        }
      } catch (error) {
        // Use localStorage fallback again
        const stored = localStorage.getItem(`course_${courseId}_progress`);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.quizScore !== undefined) {
            setQuizScore(data.quizScore);
          }
        }
      }
    };
    if (courseId) {
      loadQuizScore();
    }
  }, [courseId]);

  // Issue certificate via backend (idempotent  safe to call multiple times)
  useEffect(() => {
    const issueCert = async () => {
      if (!courseId || !user) return;
      if (!course) return;

      if (course.uploadType === "zip" || course.certificate !== true) {
        setCertError(
          t(
            "certificate.notAvailable",
            "This course does not offer a certificate",
          ),
        );
        return;
      }

      const studentName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.FirstName
            ? `${user.FirstName} ${user.LastName || ""}`.trim()
            : user.name || "";

      if (!studentName) return; // Can't issue without a name

      try {
        setIsIssuingCertificate(true);
        setCertError(null);
        const response = await EnrollmentAPI.issueCertificate(
          courseId,
          studentName,
        );
        if (response.success && response.data) {
          setDbCertificate(response.data);
          // Fix 0% bug: set score from server metadata
          const avgScore = response.data?.metadata?.averageQuizScore;
          setQuizScore(avgScore != null ? avgScore : 100);
          // If cert was already generated before, show stored image
          if (response.data?.metadata?.imagePath) {
            setCertImageUrl(
              `/enrollment/certificates/${response.data.certificateId}/image`,
            );
          }
        } else {
          setCertError(response.message || "Could not issue certificate");
        }
      } catch (err) {
        setCertError("Failed to connect to certificate service");
      } finally {
        setIsIssuingCertificate(false);
      }
    };

    if (courseId && user && courseData?.course) {
      issueCert();
    }
  }, [courseId, user, courseData, course, t]);

  // Fetch admin certificate template (Fabric.js JSON) for this course
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        if (course?.uploadType === "zip" || course?.certificate !== true) {
          return;
        }
        const res = await apiClient.get(
          `/certificate-templates/public/for-course/${courseId}`,
        );
        const data = res.data;
        if (data.success && data.template) {
          setCertTemplate(data.template);
        }
      } catch {
        // No template found — fallback to built-in design
      } finally {
        setTemplateLoading(false);
      }
    };
    if (courseId) fetchTemplate();
  }, [courseId, course]);

  // Build certificate data from real course and user data
  const certificateData = {
    studentName:
      user?.name ||
      (user?.firstName && user?.lastName
        ? user.firstName + " " + user.lastName
        : "") ||
      "Étudiant",
    courseName: courseData?.course?.title || "Formation",
    completionDate: new Date().toISOString().split("T")[0],
    instructor:
      courseData?.course?.instructor?.name ||
      courseData?.course?.instructorName ||
      "Instructeur",
    grade:
      quizScore >= 80 ? "Excellence" : quizScore >= 65 ? "Très Bien" : "Bien",
    courseHours: (() => {
      // Calculate total video duration
      const videos = courseData?.course?.videos || [];

      if (videos.length === 0) {
        return (
          courseData?.course?.duration || courseData?.course?.hours || "N/A"
        );
      }

      let totalSeconds = 0;
      videos.forEach((video) => {
        // Video duration might be in different formats: "HH:MM:SS", "MM:SS", or seconds
        const duration =
          video.duration ||
          video.videoDuration ||
          video.length ||
          video.time ||
          0;

        if (typeof duration === "string") {
          const parts = duration.split(":").map((p) => parseInt(p) || 0);
          if (parts.length === 3) {
            // HH:MM:SS
            const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            totalSeconds += seconds;
          } else if (parts.length === 2) {
            // MM:SS
            const seconds = parts[0] * 60 + parts[1];
            totalSeconds += seconds;
          } else {
            const seconds = duration || 0;
            totalSeconds += seconds;
          }
        } else if (typeof duration === "number") {
          totalSeconds += duration;
        }
      });

      // Convert total seconds to hours (rounded to 1 decimal)
      const hours = (totalSeconds / 3600).toFixed(1);
      return hours;
    })(),
    certificateId:
      dbCertificate?.certificateId ||
      `CERT-${new Date().getFullYear()}-${courseId}-${user?.id || "000"}`,
    verificationUrl:
      dbCertificate?.verificationUrl ||
      `${window.location.origin}/verify/certificate/${dbCertificate?.certificateId || ""}`,
    institution: "healthpathglobal",
    quizScore: quizScore, // Add quiz score to certificate data
  };

  // Initialize Fabric.js canvas when admin template is ready
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!certTemplate || !fabricCanvasRef.current) return;

    // Dispose any previous fabric instance
    if (fabricInstanceRef.current) {
      try {
        fabricInstanceRef.current.dispose();
      } catch {}
      fabricInstanceRef.current = null;
    }

    const fw = certTemplate.canvasWidth || 900;
    const fh = certTemplate.canvasHeight || 630;

    const canvas = new fabric.Canvas(fabricCanvasRef.current, {
      width: fw,
      height: fh,
      selection: false,
      interactive: false,
      renderOnAddRemove: false,
    });
    fabricInstanceRef.current = canvas;

    const { studentName, courseName, verificationUrl } = certificateData;
    const issueDate = new Date().toLocaleDateString("fr-FR");

    canvas.loadFromJSON(certTemplate.fabricJson, () => {
      const objects = canvas.getObjects();

      // Make all objects non-interactive
      objects.forEach((obj) => {
        obj.set({
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
      });

      const qrPromises = [];

      objects.forEach((obj) => {
        const ct = obj.get("customType");
        if (!ct) return;

        if (ct === "STUDENT_NAME") {
          obj.set({ text: studentName || "" });
        } else if (ct === "COURSE_TITLE") {
          obj.set({ text: courseName || "" });
        } else if (ct === "ISSUE_DATE") {
          obj.set({ text: issueDate });
        } else if (ct === "VERIFICATION_URL") {
          obj.set({ text: verificationUrl || "" });
        } else if (ct === "QR_CODE") {
          const qrUrl = qrCanvasRef.current?.toDataURL?.("image/png");
          if (qrUrl) {
            const pos = {
              left: obj.left,
              top: obj.top,
              w: obj.width * (obj.scaleX || 1) || 110,
              h: obj.height * (obj.scaleY || 1) || 110,
            };
            canvas.remove(obj);
            qrPromises.push(
              new Promise((resolve) => {
                fabric.Image.fromURL(
                  qrUrl,
                  (img) => {
                    img.set({
                      left: pos.left,
                      top: pos.top,
                      scaleX: pos.w / img.width,
                      scaleY: pos.h / img.height,
                      selectable: false,
                      evented: false,
                    });
                    canvas.add(img);
                    resolve();
                  },
                  { crossOrigin: "" },
                );
              }),
            );
          }
        }
      });

      Promise.all(qrPromises).then(() => {
        canvas.renderAll();
        setCanvasRendered(true);
      });
    });

    return () => {
      if (fabricInstanceRef.current) {
        try {
          fabricInstanceRef.current.dispose();
        } catch {}
        fabricInstanceRef.current = null;
      }
    };
    // Re-run when template or key cert data changes
  }, [
    certTemplate,
    certificateData.studentName,
    certificateData.courseName,
    certificateData.verificationUrl,
  ]);

  // Upload certificate snapshot to server after first render (idempotent)
  useEffect(() => {
    if (!canvasRendered || !dbCertificate || !fabricInstanceRef.current) return;
    if (dbCertificate.metadata?.imagePath) return; // already uploaded previously
    const doUpload = async () => {
      try {
        const dataUrl = fabricInstanceRef.current.toDataURL({
          format: "png",
          multiplier: 2,
        });
        const blob = await (await fetch(dataUrl)).blob();
        const fd = new FormData();
        fd.append("image", blob, "certificate.png");
        const res = await apiClient.patch(
          `/enrollment/courses/${courseId}/certificate/image`,
          fd,
        );
        if (res.data?.success) {
          setCertImageUrl(
            `/enrollment/certificates/${dbCertificate.certificateId}/image`,
          );
        }
      } catch {
        // silent — snapshot is non-critical
      }
    };
    doUpload();
  }, [canvasRendered, dbCertificate, courseId]);

  // Upload certificate snapshot for default HTML design (no admin template)
  useEffect(() => {
    if (templateLoading || certTemplate) return; // only when no admin template
    if (!dbCertificate || dbCertificate.metadata?.imagePath) return; // guard
    if (!certificateData.studentName || !certificateData.courseName) return; // wait for data
    let cancelled = false;
    const doUpload = async () => {
      try {
        const canvas = await generatePDFCertificate(certificateData);
        if (cancelled) return;
        canvas.toBlob(async (blob) => {
          if (!blob || cancelled) return;
          const fd = new FormData();
          fd.append("image", blob, "certificate.png");
          const res = await apiClient.patch(
            `/enrollment/courses/${courseId}/certificate/image`,
            fd,
          );
          const json = res.data;
          if (json.success && !cancelled) {
            setCertImageUrl(
              `/enrollment/certificates/${dbCertificate.certificateId}/image`,
            );
          }
        }, "image/png");
      } catch {
        // silent — snapshot is non-critical
      }
    };
    doUpload();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    templateLoading,
    certTemplate,
    dbCertificate,
    courseId,
    certificateData.studentName,
    certificateData.courseName,
    certificateData.certificateId,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du certificat...</p>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      // Show loading alert
      Swal.fire({
        title: t(
          "alerts.certificate.generatingTitle",
          "Generating Certificate",
        ),
        html: t(
          "alerts.certificate.generatingText",
          "Please wait while your certificate is being created...",
        ),
        allowOutsideClick: false,
      });

      // Generate PDF: prefer the frozen stored image (keeps icons & design),
      // fall back to the live Fabric canvas, then to the plain HTML canvas.
      let imgData;
      if (certImageUrl) {
        // certImageUrl is the authoritative snapshot — Fabric canvas is not in
        // the DOM at this point so fabricInstanceRef.current would be null.
        const resp = await apiClient.get(certImageUrl, {
          responseType: "blob",
        });
        const blob = resp.data;
        imgData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } else if (fabricInstanceRef.current) {
        imgData = fabricInstanceRef.current.toDataURL({
          format: "jpeg",
          quality: 0.8,
          multiplier: 2,
        });
      } else {
        const canvas = await generatePDFCertificate(certificateData);
        imgData = canvas.toDataURL("image/jpeg", 0.7);
      }

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add the Image to the PDF
      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

      // Close the loading dialog
      Swal.close();

      // Show success alert
      await Swal.fire({
        title: t("alerts.certificate.successTitle", "Download Successful!"),
        text: t(
          "alerts.certificate.successText",
          "Your certificate has been generated successfully.",
        ),
        icon: "success",
        confirmButtonText: t("common.ok", "OK"),
      });

      // Safe filename generation
      const fileName = certificateData?.studentName
        ? `certificat-${certificateData.studentName
            .replace(/\s+/g, "-")
            .toLowerCase()}.pdf`
        : "certificat.pdf";

      // Save the PDF
      pdf.save(fileName);
    } catch (error) {
      Swal.fire({
        title: t("alerts.certificate.errorTitle", "Error"),
        text: t(
          "alerts.certificate.errorText",
          "An error occurred while generating the certificate.",
        ),
        icon: "error",
        confirmButtonText: t("common.ok", "OK"),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl relative mx-auto">
        {/* Congratulations Banner */}
        <div className="text-center mb-4 md:mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-4 md:p-8 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-lg md:shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-2 md:mb-4">
                <div className="bg-yellow-400 p-2 md:p-4 rounded-full">
                  <Award className="w-6 h-6 md:w-12 md:h-12 text-yellow-800" />
                </div>
              </div>
              <h1 className="text-xl md:text-4xl font-bold mb-1 md:mb-2">
                {" "}
                Félicitations Exceptionnelles!
              </h1>
              <p className="text-sm md:text-xl mb-2 md:mb-4">
                Vous avez brillamment terminé votre formation
              </p>
              <h2 className="text-lg md:text-2xl font-semibold mb-2 md:mb-4 text-yellow-200">
                {certificateData.courseName}
              </h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-sm md:text-lg">
                <div className="flex items-center gap-1 md:gap-2">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                  <span>Mention: {certificateData.grade}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-200" />
                  <span>
                    {new Date(
                      certificateData.completionDate,
                    ).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white rounded-xl md:rounded-3xl shadow-lg md:shadow-2xl p-4 md:p-8 mb-4 md:mb-8 border border-gray-100">
          {certTemplate ? (
            certImageUrl ? (
              /* Frozen stored image — exact snapshot at issue time */
              <div className="flex justify-center overflow-auto py-2">
                <img
                  src={certImageUrl}
                  alt="Certificat"
                  style={{ maxWidth: "100%", display: "block" }}
                />
              </div>
            ) : (
              /* Admin Fabric.js template — renders dynamically */
              <div className="relative flex justify-center overflow-auto py-2">
                {/* Hidden QR canvas — used by Fabric.js to fill the QR placeholder */}
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={
                    certificateData.verificationUrl || window.location.href
                  }
                  size={110}
                  style={{
                    position: "absolute",
                    top: -9999,
                    left: -9999,
                  }}
                />
                <div style={{ maxWidth: "100%", overflow: "auto" }}>
                  <canvas ref={fabricCanvasRef} style={{ display: "block" }} />
                </div>
              </div>
            )
          ) : (
            <div
              ref={certificateRef}
              className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-12 rounded-xl md:rounded-2xl border-4 md:border-8 border-transparent bg-clip-padding"
              style={{
                background:
                  "linear-gradient(white, white) padding-box, linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981) border-box",
              }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4 w-8 h-8 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md md:shadow-lg">
                <Award className="w-4 h-4 md:w-8 md:h-8 text-white" />
              </div>

              <div className="absolute top-2 md:top-4 left-2 md:left-4 w-6 h-6 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>

              <div className="text-center relative z-10">
                {/* Header */}
                <div className="mb-4 md:mb-8">
                  <h1 className="text-xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1 md:mb-2">
                    CERTIFICAT D'EXCELLENCE
                  </h1>
                  <div className="w-16 h-0.5 md:w-32 md:h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-2 md:mb-4"></div>
                  <p className="text-sm md:text-xl text-gray-600 font-medium">
                    est décerné à
                  </p>
                </div>

                {/* Student Name */}
                <div className="mb-4 md:mb-8">
                  <div className="text-xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-1 md:mb-2">
                    {certificateData.studentName}
                  </div>
                  <div className="w-24 h-0.5 md:w-48 md:h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto"></div>
                </div>

                {/* Course Description */}
                <div className="mb-4 md:mb-8">
                  <p className="text-xs md:text-lg text-gray-700 mb-2 md:mb-4">
                    pour avoir terminé avec succès le programme de formation
                  </p>
                  <h2 className="text-lg md:text-3xl font-bold text-gray-800 leading-tight">
                    {certificateData.courseName}
                  </h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
                  <div className="bg-white/80 backdrop-blur-sm p-2 md:p-4 rounded-lg md:rounded-xl shadow-md md:shadow-lg">
                    <div className="text-base md:text-2xl font-bold text-blue-600">
                      {quizScore}% - {certificateData.grade}
                    </div>
                    <div className="text-xs md:text-base text-gray-600 font-medium">
                      Résultat Obtenu
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-2 md:p-4 rounded-lg md:rounded-xl shadow-md md:shadow-lg">
                    <div className="text-base md:text-2xl font-bold text-teal-600">
                      {new Date(
                        certificateData.completionDate,
                      ).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="text-xs md:text-base text-gray-600 font-medium">
                      Date d'Obtention
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mt-6 md:mt-12 space-y-4 md:space-y-0">
                  <div className="text-center">
                    <div className="w-16 md:w-32 h-0.5 bg-gray-400 mb-1 md:mb-2"></div>
                    <div className="text-sm md:text-base font-semibold text-gray-800">
                      {certificateData.instructor}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      Instructeur Certifié
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 md:w-32 h-0.5 bg-gray-400 mb-1 md:mb-2"></div>
                    <div className="text-sm md:text-base font-semibold text-gray-800">
                      {certificateData.institution}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      Institution
                    </div>
                  </div>
                </div>

                {/* Certificate ID + QR Code */}
                <div className="flex items-end justify-between mt-2 md:mt-4 gap-2">
                  <div className="flex flex-col items-center gap-1">
                    {certificateData.verificationUrl ? (
                      <>
                        <QRCodeSVG
                          value={certificateData.verificationUrl}
                          size={60}
                          level="M"
                          className="border border-gray-200 rounded p-0.5"
                        />
                        <span className="text-xs text-gray-400">
                          Scan to verify
                        </span>
                      </>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      ID: {certificateData.certificateId}
                    </div>
                    {certificateData.verificationUrl && (
                      <div className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate">
                        {certificateData.verificationUrl}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 md:gap-4 mt-4 md:mt-8 max-w-md mx-auto">
            {/* Download Certificate Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex gap-2 md:gap-3 justify-center items-center px-4 py-2 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl md:rounded-2xl transition-all duration-300 font-semibold shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl transform hover:-translate-y-0.5 md:hover:-translate-y-1 text-sm md:text-base"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
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
                  <span>Génération en cours...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Télécharger le Certificat PDF</span>
                </>
              )}
            </button>

            {/* View Certificate Button */}
            <button
              onClick={() => setShowCertificate(!showCertificate)}
              className="flex gap-2 md:gap-3 justify-center items-center px-4 py-2 md:px-8 md:py-3 text-blue-600 hover:text-purple-600 underline font-semibold transition-colors duration-300 text-sm md:text-base"
            >
              <Eye className="w-4 h-4 md:w-5 md:h-5" />
              <span>
                {showCertificate
                  ? "Masquer les Détails"
                  : "Voir les Détails du Certificat"}
              </span>
            </button>

            {/* Verification Link */}
            {dbCertificate?.verificationUrl && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(dbCertificate.verificationUrl);
                  Swal.fire({
                    icon: "success",
                    title: "Lien copié !",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                  });
                }}
                className="flex gap-2 md:gap-3 justify-center items-center px-4 py-2 md:px-8 md:py-3 text-green-600 hover:text-green-700 underline font-semibold transition-colors duration-300 text-sm md:text-base"
              >
                <LinkIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span>Copier le lien de vérification</span>
              </button>
            )}

            {/* Certificate issuance status */}
            {isIssuingCertificate && (
              <p className="text-center text-sm text-gray-400 animate-pulse">
                Enregistrement du certificat...
              </p>
            )}
            {certError && (
              <p className="text-center text-sm text-red-400">{certError}</p>
            )}
          </div>
        </div>

        {/* Certificate Details (expandable) */}
        {showCertificate && (
          <div className="bg-white rounded-lg md:rounded-2xl shadow-md md:shadow-lg p-4 md:p-6 mb-4 md:mb-8 border border-gray-100">
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-3 md:mb-6 flex items-center gap-2 md:gap-3">
              <User className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              Détails Complets du Certificat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2 md:space-y-4">
                <div>
                  <label className="font-semibold text-gray-700 text-sm md:text-base">
                    Bénéficiaire:
                  </label>
                  <p className="text-gray-600 text-sm md:text-base">
                    {certificateData.studentName}
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 text-sm md:text-base">
                    Formation:
                  </label>
                  <p className="text-gray-600 text-sm md:text-base">
                    {certificateData.courseName}
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 text-sm md:text-base">
                    Institution:
                  </label>
                  <p className="text-gray-600 text-sm md:text-base">
                    {certificateData.institution}
                  </p>
                </div>
              </div>
              <div className="space-y-2 md:space-y-4">
                <div>
                  <label className="font-semibold text-gray-700 text-sm md:text-base">
                    Date d'obtention:
                  </label>
                  <p className="text-gray-600 text-sm md:text-base">
                    {new Date(
                      certificateData.completionDate,
                    ).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 text-sm md:text-base">
                    Mention:
                  </label>
                  <p className="text-gray-600 text-sm md:text-base">
                    {certificateData.grade}
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 text-sm md:text-base">
                    Instructeur:
                  </label>
                  <p className="text-gray-600 text-sm md:text-base">
                    {certificateData.instructor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
