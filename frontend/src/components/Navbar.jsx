import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Smart Recipe Hub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/add-recipe">
              Add Recipe
            </Nav.Link>
            <Nav.Link as={Link} to="/recommend">
              AI Recommendations
            </Nav.Link>
            <Nav.Link as={Link} to="/profile">
              Profile
            </Nav.Link>
          </Nav>
          <Nav>
            <SignedOut>
              {/* Redirect to the dedicated sign-in and sign-up pages */}
              <SignInButton redirectUrl="/sign-in">
                <button className="btn btn-outline-light me-2">Sign In</button>
              </SignInButton>
              <SignUpButton redirectUrl="/sign-up">
                <button className="btn btn-outline-light">Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              {/* Show the UserButton when signed in */}
              <UserButton />
            </SignedIn>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
