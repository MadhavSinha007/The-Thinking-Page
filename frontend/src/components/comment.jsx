import React, { useState } from "react";
import { 
  FiMessageSquare, 
  FiSend, 
  FiThumbsUp, 
  FiUser,
  FiCalendar,
  FiStar
} from "react-icons/fi";

const Comments = ({ comments = [], onAddComment }) => {
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        text: newComment,
        rating,
        author: "You", // In real app, get from user context
        date: new Date().toISOString(),
      };

      await onAddComment(commentData);
      setNewComment("");
      setRating(5);
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FiMessageSquare className="mr-2" />
          Add Your Review
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <FiStar
                    size={24}
                    className={`${
                      star <= rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-gray-300"
                    } hover:scale-110 transition-transform`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating}.0 out of 5
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this book..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <FiSend size={18} />
                Submit Review
              </>
            )}
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 mb-4">
          Reviews ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FiMessageSquare className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Comment Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <FiUser className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{comment.author}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-1" size={12} />
                      {new Date(comment.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center">
                  <div className="flex text-amber-500 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={16}
                        className={i < Math.floor(comment.rating || 0) ? "fill-current" : ""}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {comment.rating?.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-gray-700 mb-4">{comment.text}</p>

              {/* Comment Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button className="flex items-center text-sm text-gray-500 hover:text-purple-600 transition-colors">
                  <FiThumbsUp className="mr-2" />
                  Helpful ({comment.likes || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;