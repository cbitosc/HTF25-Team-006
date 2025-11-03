import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, provider } from "../firebase"; // fixed path to top-level firebase.js

function SignUp({ onSignUpWithGoogle }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!email) {
      setError("Email is required");
      return false;
    }
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setError("Enter a valid email");
      return false;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      // ✅ Firebase Email + Password Signup
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      alert("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // If a parent provided a handler, call it (e.g. AuthPage or App)
      if (onSignUpWithGoogle) {
        await onSignUpWithGoogle();
      } else {
        // ✅ Firebase Google Sign-up
        await signInWithPopup(auth, provider);
      }
      alert("Signed up with Google!");
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Google sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="login-card"
      onSubmit={handleSubmit}
      aria-label="signup form"
    >
      <h2 className="login-title">Create account</h2>

      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      <label className="login-label">
        <span>Full name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="login-input"
          required
          autoComplete="name"
        />
      </label>

      <label className="login-label">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="login-input"
          required
          autoComplete="email"
        />
      </label>

      <label className="login-label">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="login-input"
          required
          autoComplete="new-password"
        />
      </label>

      <label className="login-label">
        <span>Confirm password</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          className="login-input"
          required
          autoComplete="new-password"
        />
      </label>

      <label className="login-remember">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span>Remember me</span>
      </label>

      <button
        className="login-google"
        type="button"
        onClick={handleGoogleSignUp}
        disabled={loading}
      >
        {loading ? (
          "Signing with Google..."
        ) : (
          <>
            <svg
              className="icon"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-18.5-1.5-36.3-4.3-53.6H272v101.5h146.9c-6.3 34.1-25 63-53.5 82.2v68.2h86.5c50.6-46.6 81.6-115.5 81.6-198.3z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c72.6 0 133.6-24.1 178.1-65.6l-86.5-68.2c-24.1 16.2-55 25.8-91.6 25.8-70.4 0-130.1-47.6-151.5-111.6H31.5v69.9C75.9 481.2 168.6 544.3 272 544.3z"
              />
              <path
                fill="#FBBC05"
                d="M120.6 327.6c-5.8-17.1-9.1-35.2-9.1-54s3.3-36.9 9.1-54V149.7H31.5C11.2 188.3 0 229.6 0 272s11.2 83.7 31.5 122.3l89.1-66.7z"
              />
              <path
                fill="#EA4335"
                d="M272 107.3c38.8 0 73.6 13.3 101.1 39.6l75.8-75.8C405.9 24.7 346.9 0 272 0 168.6 0 75.9 63.1 31.5 149.7l89.1 66.9C141.9 154.9 201.6 107.3 272 107.3z"
              />
            </svg>
            <span>Sign up with Google</span>
          </>
        )}
      </button>

      <div style={{ height: 8 }} />

      <button className="login-submit" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </button>

      <div className="login-links">
        <Link to="/login" className="login-link">
          Already have an account?
        </Link>
      </div>
    </form>
  );
}

export default SignUp;
