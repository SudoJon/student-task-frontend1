import React, { useState } from "react";
import {
  CognitoUserPool,
  CognitoUser,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "../../cognitoConfig";
import { useNavigate, useLocation } from "react-router-dom";
import "./VerifyAccount.css";

const pool = new CognitoUserPool({
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId,
});

export default function VerifyAccount() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const emailFromURL = queryParams.get("email") || "";

  const [email, setEmail] = useState(emailFromURL);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const setStatusMessage = (msg, error = false) => {
    setStatus(msg);
    setIsError(error);
  };

  const handleVerify = () => {
    if (!email || !code) {
      setStatusMessage("Please enter your email and verification code.", true);
      return;
    }

    setLoading(true);

    const user = new CognitoUser({ Username: email, Pool: pool });

    // ⭐ FIXED: Cognito requires a callback function, not an object
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        setStatusMessage(err.message || "Verification failed.", true);
        setLoading(false);
        return;
      }

      // Success
      navigate(`/verify-success?email=${email}`);
    });
  };

  const handleResend = () => {
    if (!email) {
      setStatusMessage("Please enter your email.", true);
      return;
    }

    setLoading(true);

    const user = new CognitoUser({ Username: email, Pool: pool });

    user.resendConfirmationCode((err) => {
      if (err) {
        setStatusMessage(err.message || "Error resending code.", true);
        setLoading(false);
        return;
      }

      setStatusMessage("A new verification code has been sent.");
      setLoading(false);
    });
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <h2 className="verify-title">Verify Your Account</h2>

        <input
          className="verify-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="verify-input"
          type="text"
          placeholder="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          className="verify-button"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Account"}
        </button>

        <div className="verify-resend">
          Didn’t get a code?{" "}
          <span className="verify-resend-link" onClick={handleResend}>
            Resend
          </span>
        </div>

        {status && (
          <div
            className={`verify-status ${isError ? "error" : "success"}`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
