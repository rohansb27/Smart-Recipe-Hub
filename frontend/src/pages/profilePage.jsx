import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import apiClient from "../services/apiClient";
import "./ProfilePage.css"; // Import updated styles

const ProfilePage = () => {
  const { user } = useUser(); // Fetch the logged-in user
  const [userRecipes, setUserRecipes] = useState([]); // State to hold user recipes

  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (user) {
        try {
          const response = await apiClient.get(
            `/api/recipes/user/${user.id}`
          );
          setUserRecipes(response.data.recipes);
        } catch (error) {
          console.error("Error fetching recipes:", error.message);
        }
      }
    };
    fetchUserRecipes();
  }, [user]);

  const handleDeleteRecipe = async (id) => {
    try {
      const response = await apiClient.delete(
        `/api/recipes/${id}`
      );
      if (response.status === 200) {
        setUserRecipes(userRecipes.filter((recipe) => recipe._id !== id));
      }
    } catch (error) {
      console.error("Error deleting recipe:", error.message);
    }
  };

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="profile-page">
      {/* User Information Card */}
      <div className="card user-info interactive-card">
        <h2 className="card-title">User Information</h2>
        <p className="card-content">
          <strong>Username:</strong> {user.username}
        </p>
      </div>

      {/* Uploaded Recipes */}
      <div className="card user-recipes">
        <h2>Uploaded Recipes</h2>
        <div className="user-recipes">
          {userRecipes.map((recipe) => (
            <div className="card" key={recipe._id}>
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="img-fluid"
              />
              <div className="card-footer">
                <h5 className="card-title">{recipe.title}</h5>
                <button
                  onClick={() => handleDeleteRecipe(recipe._id)}
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
