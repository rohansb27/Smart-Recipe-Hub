import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import apiClient from "../services/apiClient";
import "bootstrap/dist/css/bootstrap.min.css";

const AddRecipe = () => {
  const { user } = useUser(); // Fetch the logged-in user
  const [recipeData, setRecipeData] = useState({
    title: "",
    description: "",
    instructions: "",
    ingredients: [{ item: "", quantity: "" }],
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipeData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipeData.ingredients];
    newIngredients[index][field] = value;
    setRecipeData((prevState) => ({
      ...prevState,
      ingredients: newIngredients,
    }));
  };

  const handleAddMoreIngredients = () => {
    setRecipeData((prevState) => ({
      ...prevState,
      ingredients: [...prevState.ingredients, { item: "", quantity: "" }],
    }));
  };

  const handleImageChange = (e) => {
    setRecipeData((prevState) => ({
      ...prevState,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify the file is selected
    if (!recipeData.image) {
      alert("Please upload an image.");
      return;
    }

    // Construct FormData for API submission
    const formData = new FormData();
    formData.append("title", recipeData.title);
    formData.append("description", recipeData.description);
    formData.append("instructions", recipeData.instructions);
    formData.append("ingredients", JSON.stringify(recipeData.ingredients));
    formData.append("image", recipeData.image);
    formData.append("userId", user.id);
    formData.append("username", user.username);

    try {
      console.log("Submitting Recipe Data:", formData);

      const response = await apiClient.post("/api/add-recipe", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Axios will handle the boundary
        },
      });

      console.log("Recipe added successfully:", response.data);
      alert("Recipe added successfully!");
    } catch (error) {
      console.error(
        "Error submitting recipe:",
        error.response || error.message
      );
      alert(
        `Failed to add recipe: ${
          error.response?.data?.message || "Server error, please try again."
        }`
      );
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center my-5">
      <div
        className="card shadow-lg bg-dark text-light p-4"
        style={{ width: "1000px", borderRadius: "15px" }}
      >
        <h2 className="card-title text-center text-warning mb-4">
          Add New Recipe
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title:
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              placeholder="Enter recipe title"
              value={recipeData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description:
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              placeholder="Enter recipe description"
              rows="3"
              value={recipeData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="instructions" className="form-label">
              Instructions:
            </label>
            <textarea
              className="form-control"
              id="instructions"
              name="instructions"
              placeholder="Enter step-by-step instructions"
              rows="4"
              value={recipeData.instructions}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Ingredients:</label>
            {recipeData.ingredients.map((ingredient, index) => (
              <div key={index} className="mb-2 row gx-2">
                <div className="col">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Ingredient ${index + 1}`}
                    value={ingredient.item}
                    onChange={(e) =>
                      handleIngredientChange(index, "item", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Quantity ${index + 1}`}
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, "quantity", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={handleAddMoreIngredients}
            >
              Add More Ingredients
            </button>
          </div>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              Upload Image:
            </label>
            <input
              type="file"
              className="form-control"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-success">
              Submit Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;
