import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./registeration/home";
import Login from "./registeration/Login";
import SignUp from "./registeration/SignUp";
import AuthLayout from "./registeration/AuthLayout";
import Dashboard from "./registeration/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
  {/* Root shows the public Home page with links to login/signup */}
  <Route path="/" element={<Home />} />
  {/* Login and Signup routes (selected from Home) */}
  <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
  <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />
        {/* Final dashboard from registration folder */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Legacy temporary dashboard route — redirect to new dashboard */}
        <Route path="/old-dashboard" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
