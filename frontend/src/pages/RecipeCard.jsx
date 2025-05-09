import "./RecipeCard.css";
import { useState } from "react";
import apiClient from "../services/apiClient";
import { useUser } from "@clerk/clerk-react";

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const RecipeCard = ({ recipe }) => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState(recipe.comments || []);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likes, setLikes] = useState(recipe.likes || []);

  const handleModalOpen = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      alert("You need to be logged in to comment!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/api/recipes/${recipe._id}/comments`,
        {
          userId: user.id,
          username: user.username || "Anonymous",
          text: newComment,
        }
      );

      setComments([...comments, response.data.comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error.message);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      alert("You need to be logged in to like posts!");
      return;
    }

    const previousLikes = [...likes];
    let updatedLikes;

    if (likes.includes(user.id)) {
      updatedLikes = likes.filter((id) => id !== user.id);
    } else {
      updatedLikes = [...likes, user.id];
    }

    setLikes(updatedLikes); // Optimistic UI

    try {
      await apiClient.post(`/api/like-recipe/${recipe._id}`, {
        userId: user.id,
      });
    } catch (error) {
      console.error("Error liking recipe:", error.message);
      setLikes(previousLikes); // Rollback on error
    }
  };

  const isLiked = user && likes.includes(user.id);

  const instructions =
    typeof recipe.instructions === "string" ? recipe.instructions : "";
  const splitInstructions = instructions
    .split(".")
    .map((instruction) => instruction.trim())
    .filter((instruction) => instruction.length > 0);

  return (
    <div
      className="card mb-4 shadow-lg bg-dark text-light"
      style={{ borderRadius: "15px" }}
    >
      <div className="row g-0">
        <div className="col-md-4">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="img-fluid rounded-start h-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="col-md-5">
          <div className="card-body">
            <h2 className="card-title">{recipe.title}</h2>
            <p className="card-text">{recipe.description}</p>

            <h4>Ingredients:</h4>
            <div className="row">
              {chunkArray(recipe.ingredients, 6).map((chunk, index) => (
                <div key={index} className="col-6">
                  <ul className="list-unstyled">
                    {chunk.map((ingredient, idx) => (
                      <li key={idx}>
                        {ingredient.item}: {ingredient.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button className="btn btn-primary my-3" onClick={handleModalOpen}>
              View Instructions
            </button>

            <div className="d-flex align-items-center mb-2">
              <button
                className="btn btn-outline-light me-2"
                onClick={handleLikeToggle}
              >
                {isLiked ? "❤️ Liked" : "🤍 Like"} ({likes.length})
              </button>
              <small className="text-muted">By {recipe.username}</small>
            </div>
          </div>
        </div>

        <div className="col-md-3 border-start">
          <div className="p-3">
            <h4>Comments:</h4>
            <ul className="list-unstyled">
              {comments.map((comment, index) => (
                <li key={index}>
                  <strong>{comment.username}:</strong> {comment.text}
                </li>
              ))}
            </ul>

            <div className="d-flex mt-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="form-control me-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                onClick={handleAddComment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Instructions</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <ol>
                  {splitInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}.</li>
                  ))}
                </ol>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
