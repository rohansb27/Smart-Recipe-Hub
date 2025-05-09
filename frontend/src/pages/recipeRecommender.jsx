import React, { useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import apiClient from "../services/apiClient";
import Markdown from "react-markdown";
import {
  Container,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Card,
  Modal,
} from "react-bootstrap";
import Loader from "./Loader";

// RecipeCard Component
const RecipeCard = ({ recipe }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="mb-4 shadow-lg">
        <Row className="g-0">
          {/* Recipe Image */}
          {
            <Col xs={12} md={4}>
              <Card.Img
                src={
                  recipe.image
                    ? recipe.image
                    : "https://via.placeholder.com/300"
                }
                alt={recipe?.title || "Recipe Image"}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "200px",
                  borderRadius: "8px 8px 0 0",
                }}
              />
            </Col>
          }

          {/* Recipe Details */}
          <Col
            xs={12}
            md={recipe?.image ? 8 : 12}
            className="p-4 d-flex flex-column"
          >
            <Card.Body className="p-0">
              <Card.Title className="fw-bold mb-3">
                {recipe?.title || "No Title"}
              </Card.Title>
              <h6 className="mb-2">Instructions:</h6>
              {recipe?.steps ? (
                <div
                  style={{
                    maxHeight: "100px",
                    overflowY: "scroll",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {recipe.steps.split("\n").map((step, index) => (
                    <p key={index} className="mb-1">
                      <Markdown>{step}</Markdown>
                    </p>
                  ))}
                </div>
              ) : (
                <p>No instructions available.</p>
              )}
            </Card.Body>

            <Button
              variant="outline-primary"
              size="sm"
              className="mt-auto"
              onClick={() => setShowModal(true)}
            >
              View Recipe
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Full-Screen Recipe Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{recipe?.title || "Recipe Details"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {/* Modal Image */}
            {recipe?.image && (
              <Col xs={12} md={4} className="mb-3">
                <img
                  src={recipe.image}
                  alt={recipe?.title || "Recipe Image"}
                  className="img-fluid rounded"
                />
              </Col>
            )}
            {/* Recipe Content */}
            <Col xs={12} md={recipe?.image ? 8 : 12}>
              <h5>Instructions:</h5>
              {recipe?.steps ? (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {recipe.steps.split("\n").map((step, index) => (
                    <p key={index}>
                      <Markdown>{step}</Markdown>
                    </p>
                  ))}
                </div>
              ) : (
                <p>No instructions available.</p>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// RecipeRecommender Component
const RecipeRecommender = () => {
  const { user } = useUser();
  const [cuisine, setCuisine] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const response = await apiClient.post("/api/gemini-recommend", {
        clerkUserId: user.id,
        cuisine,
        ingredients: ingredients.split(",").map((item) => item.trim()),
      });

      console.log("Raw API Response:", response.data);

      // Clean up the response
      const cleanedRecommendations = response.data.recommendations.map(
        (rec) => {
          return {
            ...rec,
            title: rec.title.replace(/\*\*Recipe\s\*\*\s?/i, "").trim(), // Remove "**Recipe **"
            steps: rec.steps
              .replace(/\*\*Recipe Title:\*\*\s.*?\n/i, "") // Remove "**Recipe Title:** ..."
              .trim(),
            image: rec.image,
          };
        }
      );

      setRecommendations(cleanedRecommendations);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch recipe recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (videoUrl) => {
    const urlMatch = videoUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([^&?/\s]+)/
    );
    return urlMatch ? `https://www.youtube.com/embed/${urlMatch[1]}` : null;
  };

  return (
    <>
      {loading && <Loader />}
      <Container fluid className="py-5">
        <Row>
          {/* Left Panel: AI Recommender Inputs */}
          <Col md={5} className="border-end">
            <h2 className="text-center mb-4 text-white fw-bold">
              AI Recipe Recommender
            </h2>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Cuisine Type</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter cuisine (e.g., Italian, Indian)"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ingredients</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter ingredients (comma-separated)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
              </Form.Group>
              <div className="d-grid">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={fetchRecommendations}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Get Recipes"
                  )}
                </Button>
              </div>
            </Form>
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Col>

          {/* Right Panel: Recommended Recipes */}
          <Col md={7} className="p-4">
            <h3 className="text-center mb-4 text-white fw-bold">
              Recommended Recipes
            </h3>
            {recommendations.length > 0 ? (
              <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {recommendations.map((rec, index) => (
                  <RecipeCard key={index} recipe={rec} />
                ))}
              </div>
            ) : (
              <p className="text-center text-white fw-semibold">
                No recipes to display. Please submit your preferences!
              </p>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default RecipeRecommender;
