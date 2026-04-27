import React, { useEffect, useState } from "react";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import { cognitoConfig } from "../../cognitoConfig";
import { authStyles as styles } from "../../styles/authStyles";

const pool = new CognitoUserPool({
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId,
});

export default function Verify() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    const c = params.get("code");
    if (e) setEmail(e);
    if (c) setCode(c);
  }, []);

  const handleVerify = () => {
    if (!email || !code) {
      setMessage("Missing email or verification code.");
      return;
    }

    setLoading(true);
    const user = new CognitoUser({ Username: email, Pool: pool });

    user.confirmRegistration(code, true, (err) => {
      setLoading(false);
      if (err) {
        setMessage(err.message || "Verification failed.");
        return;
      }
      navigate("/verify-success");
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logoBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7V9C21 12.866 17.866 16 14 16H10C6.13401 16 3 12.866 3 9V7Z"
                stroke="white"
                strokeWidth="1.5"
                fill="rgba(255,255,255,0.2)"
              />
              <path
                d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M9 11L11 13L15 9"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div>
            <div style={styles.siteName}>Bucket Lyst</div>
            <div style={styles.siteTag}>Student Task Manager</div>
          </div>
        </div>
      </header>

      <main style={styles.centerArea}>
        <div style={styles.card}>
          <div style={{ padding: "40px 36px 32px", width: "100%" }}>
            <div style={styles.panelIcon}>🔐</div>
            <h2 style={styles.title}>Verify Your Account</h2>
            <p style={styles.subtitle}>Enter the code sent to your email</p>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Verification Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  ...styles.input,
                  letterSpacing: 4,
                  textAlign: "center",
                  fontSize: 18,
                }}
                placeholder="e.g. 123456"
              />
            </div>

            <button
              style={styles.button}
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? "Verifying…" : "Verify Account →"}
            </button>

            {message && <p style={styles.message}>{message}</p>}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={styles.statusDot} />
            <span style={styles.statusText}>All systems operational</span>
          </div>
          <div style={styles.copy}>
            © {new Date().getFullYear()} Bucket Lyst
          </div>
        </div>
      </footer>
    </div>
  );
}
