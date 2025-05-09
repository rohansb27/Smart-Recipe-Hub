import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

const SignUpSuccessPage = () => {
  
  const { user } = useUser(); // Get Clerk user data
  const navigate = useNavigate(); // For redirection
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const saveUserToDatabase = async () => {
      if (!user) return;

      try {
        const payload = {
          clerkUserId: user.id,
          email: user.primaryEmailAddress.emailAddress,
          name: user.username || "Anonymous",
        };

        const response = await apiClient.post("/api/save-user", payload);
        console.log("✅ User saved:", response.data);

        // Redirect to homepage after successful save
        setStatusMessage("User data saved successfully!");
        setTimeout(() => {
          navigate("/"); // Redirect to homepage
        }, 1000);
      } catch (error) {
        console.error("❌ Failed to save user:", error.message);
        setStatusMessage("Failed to save user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    saveUserToDatabase();
  }, [user, navigate]);

  return (
    <div className="signUpSuccess">
      {loading ? (
        <p>Saving user data...</p>
      ) : (
        <p>{statusMessage}</p>
      )}
    </div>
  );
};

export default SignUpSuccessPage;
