import React from "react";
import { Link, Outlet } from "react-router-dom";
import NavigationBar from "../components/Navbar";
import {
  ClerkProvider,
} from "@clerk/clerk-react";
import { Container } from "react-bootstrap";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("Publishable Key:", PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const MainLayout = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} signUpForceRedirectUrl="/sign-up-success"  afterSignOutUrl="/">
      <div className="d-flex flex-column vh-100">
        {/* Sticky Navbar */}
        <header>
          <NavigationBar />
        </header>

        {/* Main Content */}
        <Container as="main" className="flex-grow-1 py-4">
          <Outlet />
        </Container>

        {/* Sticky Footer */}
        <footer className="bg-dark text-white text-center py-3 mt-auto">
          © 2024 Smart Recipe Hub
        </footer>
      </div>{" "}
    </ClerkProvider>
  );
};

export default MainLayout;
