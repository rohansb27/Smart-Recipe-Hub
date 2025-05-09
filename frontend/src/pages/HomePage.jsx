import React, { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard";
import apiClient from "../services/apiClient";


const HomePage = () => {
  const [recipes, setRecipes] = useState([]); // State to store recipes
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await apiClient.get("/api/all-recipes");
        setRecipes(response.data.recipes); // Store recipes in state
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recipes:", error.message);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">All Recipes</h2>
      {loading ? (
        <p className="text-center">Loading recipes...</p>
      ) : recipes?.length > 0 ? (
        <div className="row">
          {recipes?.map((recipe, index) => (
            <div key={index} className=" mb-4">
              <RecipeCard recipe={recipe}  />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No recipes found.</p>
      )}
    </div>
  );
};

export default HomePage;
