import { FaStar, FaRegStar } from "react-icons/fa";
import PropTypes from "prop-types";
import { useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import reviewsAPI from "../../API/Reviews";

const StarPicker = ({ value, onChange, disabled = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => onChange(star)}
        className="text-2xl focus:outline-none disabled:cursor-not-allowed"
        aria-label={`${star} star`}
      >
        {star <= value ? (
          <FaStar className="text-yellow-400" />
        ) : (
          <FaRegStar className="text-gray-300 hover:text-yellow-300 transition-colors" />
        )}
      </button>
    ))}
  </div>
);
StarPicker.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

const ProgramReviews = ({
  programId,
  reviews: initialReviews,
  isEnrolled,
  userReview: initialUserReview,
}) => {
  const reviews = initialReviews || [];
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + Number(r.Rate || 0), 0) / totalReviews
      : 0;

  const [showAllModal, setShowAllModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userReview, setUserReview] = useState(initialUserReview || null);
  const [rateValue, setRateValue] = useState(initialUserReview?.Rate || 0);
  const [comment, setComment] = useState(initialUserReview?.Comment || "");

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => Math.round(r.Rate) === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const renderStars = (rating, size = "text-sm") => (
    <div className={`flex items-center ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rateValue) {
      toast.error("Please select a rating.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await reviewsAPI.submitProgramReview(programId, {
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
      await reviewsAPI.deleteProgramReview(programId);
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

  const ReviewCard = ({ review }) => {
    const fullName = review.user
      ? `${review.user.firstName || ""} ${review.user.lastName || ""}`.trim() ||
        "Anonymous"
      : "Anonymous";
    const initial = fullName.charAt(0).toUpperCase();
    return (
      <div className="border-b border-gray-100 pb-5 last:border-b-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden">
              {review.user?.profile_pic_link ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || ""}${review.user.profile_pic_link}`}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">
                {fullName}
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>
          {renderStars(review.Rate)}
        </div>
        {review.Comment && (
          <p className="text-gray-700 text-sm leading-relaxed">
            {review.Comment}
          </p>
        )}
      </div>
    );
  };
  ReviewCard.propTypes = { review: PropTypes.object.isRequired };

  const reviewForm = (
    <form
      onSubmit={handleSubmit}
      className="bg-blue-50 rounded-xl p-5 border border-blue-100 mt-4"
    >
      <h4 className="font-semibold text-gray-800 mb-3">
        {userReview ? "Edit your review" : "Write a review"}
      </h4>
      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarPicker value={rateValue} onChange={setRateValue} />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          placeholder="Share your experience with this program..."
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
        {userReview && (
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
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Student Reviews</h3>

      {totalReviews > 0 ? (
        <>
          {/* Summary */}
          <div className="flex items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(averageRating, "text-lg mt-1")}
              <div className="text-xs text-gray-500 mt-1">
                {totalReviews} {totalReviews !== 1 ? "reviews" : "review"}
              </div>
            </div>
            <div className="flex-1">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-gray-500 w-3">{rating}</span>
                  <FaStar className="text-yellow-400 text-xs shrink-0" />
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-yellow-400 h-1.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 */}
          <div className="space-y-5">
            {reviews.slice(0, 5).map((review, i) => (
              <ReviewCard key={review.id || i} review={review} />
            ))}
          </div>

          {reviews.length > 5 && (
            <div className="text-center mt-5">
              <button
                onClick={() => setShowAllModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline underline-offset-2"
              >
                View all {totalReviews} reviews
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <FaRegStar className="text-4xl mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm">Be the first to review this program!</p>
        </div>
      )}

      {/* Enrolled user section */}
      {isEnrolled && (
        <div className="mt-8 border-t border-gray-100 pt-6">
          {userReview && !editMode ? (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Your Review</h4>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                {renderStars(userReview.Rate, "text-base mb-2")}
                {userReview.Comment && (
                  <p className="text-sm text-gray-700">{userReview.Comment}</p>
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
            </div>
          ) : (
            reviewForm
          )}
        </div>
      )}

      {/* View All Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <h3 className="text-lg font-bold text-gray-900">
                All Reviews ({totalReviews})
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5">
              {reviews.map((review, i) => (
                <ReviewCard key={review.id || i} review={review} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProgramReviews.propTypes = {
  programId: PropTypes.string.isRequired,
  reviews: PropTypes.array,
  isEnrolled: PropTypes.bool,
  userReview: PropTypes.object,
};

export default ProgramReviews;
