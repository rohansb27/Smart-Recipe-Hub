import React from "react";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="signUpPage">
      <SignUp
        path="/sign-up"
        signInUrl="/sign-in"
        signUpForceRedirectUrl="/sign-up-success" // Redirect after successful sign-up
      />
    </div>
  );
};


export default SignUpPage;
