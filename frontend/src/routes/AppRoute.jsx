import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import AddRecipePage from "../pages/addRecipe";
import AIRecommendationPage from "../pages/recipeRecommender";
import ProfilePage from "../pages/profilePage";
import MainLayout from "../components/MainLayout";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/add-recipe" element={<AddRecipePage />} />
        <Route path="/recommend" element={<AIRecommendationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;
