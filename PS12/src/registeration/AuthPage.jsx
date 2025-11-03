import React from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import "./login.css";

export default function AuthPage({ onLogin, onSignUp, onSignUpWithGoogle }) {
  return (
    <div className="auth-root">
      <div className="auth-container">
        <div className="auth-card-wrapper">
          <Login onLogin={onLogin} />
        </div>
        <div className="auth-card-wrapper">
          <SignUp onSignUp={onSignUp} onSignUpWithGoogle={onSignUpWithGoogle} />
        </div>
      </div>
    </div>
  );
}
