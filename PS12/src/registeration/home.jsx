import React from "react";
import { Link } from "react-router-dom";
// The hero image and logo live in the same `registeration` folder
import hero from "./image.png";
import logo from "./download.png";
import "./home.css";

export default function Home() {
  return (
    <div className="hf-root">
      <header className="hf-header">
        <div className="hf-left">
          <div className="hf-logo">
            <img src={logo} alt="AudioFlow logo" className="hf-logo-image" />
          </div>
          <div className="hf-brand">AudioFlow</div>
        </div>
        <nav className="hf-nav">
          <Link to="#">Home</Link>
          <Link to="#about">About</Link>
          <Link to="#contact">Contact</Link>
          <Link to="#feedback">Feedback</Link>
        </nav>
      </header>

      <main className="hf-main">
        <section className="hf-hero">
          <div className="hf-hero-left">
            <h1>AI-Powered Podcast Generation</h1>
            <p className="hf-lead">
              The AI-Powered Podcast Generation Platform converts uploaded notes
              or textbooks into concise audio podcasts so students can revise
              efficiently on the go.
            </p>

            {/* PS12 statement removed per request */}

            <div className="hf-cta">
              <Link to="/login" className="btn outline">
                Login
              </Link>
              <Link to="/signup" className="btn primary">
                Sign up
              </Link>
            </div>
          </div>

          <div className="hf-hero-right">
            <img src={hero} alt="hero" className="hf-hero-image" />
          </div>
        </section>
      </main>
    </div>
  );
}
