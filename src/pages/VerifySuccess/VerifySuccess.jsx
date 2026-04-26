import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./VerifySuccess.css";

export default function VerifySuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email") || "";

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-checkmark">✓</div>

        <h2 className="success-title">Account Verified!</h2>

        <p className="success-text">
          Your account has been successfully verified.  
          You can now sign in.
        </p>

        <button
          className="success-button"
          onClick={() => navigate(`/auth?verified=true&email=${email}`)}
        >
          Continue to Sign In
        </button>
      </div>
    </div>
  );
}
