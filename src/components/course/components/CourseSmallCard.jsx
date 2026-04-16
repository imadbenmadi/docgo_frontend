import PropTypes from "prop-types";
import { FaCheckCircle, FaDollarSign, FaPlay } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "../../Common/ImageWithFallback";
import CoursePaymentButton from "../../PaymentHistory/CoursePaymentButton";
import { buildApiUrl } from "../../../utils/apiBaseUrl";

const CourseSmallCard = ({
  course,
  userStatus,
  courseProgress,
  certificate,
  isEnrolled,
  isFree,
  coursePrice,
  currency,
  enrolling,
  handleEnrollClick,
  formatCurrency,
  paymentStatus, // Add payment status prop
}) => {
  const navigate = useNavigate();
  // const { t } = useTranslation(); // Translation removed as not used in this component

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 sticky top-6 border border-gray-100">
      {/* Course Thumbnail */}
      <div className="relative mb-6 group">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center overflow-hidden">
          <ImageWithFallback
            type="course"
            src={buildApiUrl(course.thumbnail || course.Image)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <FaPlay className="text-blue-600 text-xl ml-1" />
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {isFree ? (
            <span className="text-green-600">Free</span>
          ) : (
            <span className="flex items-center justify-center">
              {/* <FaDollarSign className="text-2xl mr-1" /> */}
              {formatCurrency(coursePrice)}
            </span>
          )}
        </div>
        {!isFree && (
          <div className="text-sm text-gray-500">
            One-time payment Lifetime access
          </div>
        )}
      </div>

      {/* Enrollment Status / Button */}
      <div className="mb-6">
        {isEnrolled ? (
          <div className="space-y-4">
            {/* Enrollment Success */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center text-green-700 mb-2">
                <FaCheckCircle className="mr-2" />
                <span className="font-semibold">Enrolled Successfully!</span>
              </div>
              <div className="text-sm text-green-600">
                You have full access to this course
              </div>
            </div>

            {/* Progress Bar */}
            {course?.uploadType !== "zip" && courseProgress && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>
                    {Math.round(courseProgress.OverallProgress || 0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${courseProgress.OverallProgress || 0}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {courseProgress.CompletedVideos || 0} of{" "}
                  {courseProgress.TotalVideos || 0} videos completed
                </div>
              </div>
            )}

            {/* Certificate Status */}
            {certificate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center text-yellow-700 mb-1">
                  <span className="mr-2"></span>
                  <span className="font-semibold">Certificate Available</span>
                </div>
                <div className="text-sm text-yellow-600">
                  Congratulations! You can download your certificate.
                </div>
              </div>
            )}

            {/* Continue Learning Button */}
            <button
              onClick={() =>
                navigate(
                  String(course?.uploadType || "").toLowerCase() === "zip"
                    ? `/Courses/${course.id}/explore`
                    : `/Courses/${course.id}/watch`,
                )
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <FaPlay className="mr-2" />
              Continue Learning
            </button>

            {/* View Payment History Button */}
            {paymentStatus?.status === "approved" && (
              <CoursePaymentButton
                itemId={course.id}
                itemType="course"
                itemTitle={course.Title || course.title || "Course"}
              />
            )}
          </div>
        ) : paymentStatus && paymentStatus.status === "pending" ? (
          // Payment Pending State
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center text-yellow-700 mb-2">
                <span className="mr-2"></span>
                <span className="font-semibold">Payment Under Review</span>
              </div>
              <div className="text-sm text-yellow-600 mb-2">
                Your payment is being verified by our admin team.
              </div>
              <div className="text-xs text-yellow-500 bg-yellow-100 rounded p-2 mt-2">
                <strong>Transaction ID:</strong> {paymentStatus.transactionId}
              </div>
              <div className="text-xs text-yellow-600 mt-2">
                Estimated time: 24-48 hours
              </div>
            </div>
            <button
              disabled
              className="w-full bg-gray-300 text-gray-600 font-semibold py-4 px-6 rounded-xl cursor-not-allowed"
            >
              Enrollment Pending Approval
            </button>
          </div>
        ) : paymentStatus && paymentStatus.status === "rejected" ? (
          // Payment Rejected State
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center text-red-700 mb-2">
                <span className="mr-2"></span>
                <span className="font-semibold">Payment Rejected</span>
              </div>
              <div className="text-sm text-red-600 mb-2">
                <strong>Reason:</strong> {paymentStatus.rejectionReason}
              </div>
              <div className="text-xs text-red-500">
                You can resubmit a new payment screenshot.
              </div>
            </div>
            <button
              onClick={handleEnrollClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2"></span>
              Resubmit Payment
            </button>
          </div>
        ) : paymentStatus && paymentStatus.status === "deleted" ? (
          // Payment Deleted State
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
              <div className="flex items-center text-gray-700 mb-2">
                <span className="mr-2"></span>
                <span className="font-semibold">Payment Deleted</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Your payment has been removed by the administrator.
              </div>
              {paymentStatus.rejectionReason && (
                <div className="text-xs text-gray-500 bg-gray-100 rounded p-2 mt-2">
                  <strong>Reason:</strong> {paymentStatus.rejectionReason}
                </div>
              )}
              <div className="text-xs text-gray-600 mt-2">
                You can submit a new payment application.
              </div>
            </div>
            <button
              onClick={handleEnrollClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2"></span>
              {isFree
                ? "Enroll for Free"
                : `Enroll for ${coursePrice} ${currency}`}
            </button>
          </div>
        ) : (
          // Normal Enroll Button
          <button
            onClick={handleEnrollClick}
            disabled={enrolling}
            className={`
                            w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center
                            ${
                              enrolling
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : isFree
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                            }
                        `}
          >
            {enrolling ? (
              <>
                <IoMdRefresh className="animate-spin mr-2" />
                Enrolling...
              </>
            ) : (
              <>
                <span className="mr-2">{isFree ? "" : ""}</span>
                {isFree
                  ? "Enroll for Free"
                  : `Enroll for ${formatCurrency(coursePrice)}`}
              </>
            )}
          </button>
        )}
      </div>

      {/* Course Features */}
      {/* <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="mr-3"></span>
          <span>Lifetime access</span>
        </div>
        <div className="flex items-center">
          <span className="mr-3"></span>
          <span>Mobile and desktop access</span>
        </div>
        <div className="flex items-center">
          <span className="mr-3"></span>
          <span>Certificate of completion</span>
        </div>
        <div className="flex items-center">
          <span className="mr-3"></span>
          <span>30-day money-back guarantee</span>
        </div>
        {userStatus?.hasDownloadAccess && (
          <div className="flex items-center">
            <span className="mr-3"></span>
            <span>Downloadable resources</span>
          </div>
        )}
      </div> */}
    </div>
  );
};

CourseSmallCard.propTypes = {
  course: PropTypes.object.isRequired,
  userStatus: PropTypes.object,
  courseProgress: PropTypes.object,
  certificate: PropTypes.object,
  isEnrolled: PropTypes.bool.isRequired,
  isFree: PropTypes.bool.isRequired,
  coursePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  enrolling: PropTypes.bool.isRequired,
  handleEnrollClick: PropTypes.func.isRequired,
  paymentStatus: PropTypes.shape({
    status: PropTypes.string,
    transactionId: PropTypes.string,
    rejectionReason: PropTypes.string,
  }),
};

export default CourseSmallCard;
