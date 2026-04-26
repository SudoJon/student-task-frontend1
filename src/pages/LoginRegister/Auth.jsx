import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "../../cognitoConfig";
import { useNavigate } from "react-router-dom";

/* === Cognito Setup === */
const pool = new CognitoUserPool({
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId,
});

/* === Helper: mask email for display === */
function maskEmail(email) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/* ============================================================
   MAIN AUTH COMPONENT
   ============================================================ */
export default function Auth() {
  /* === Modes for slider === */
  const [mode, setMode] = useState("login");
  const panels = [
    "login",
    "register",
    "forgot-email",
    "forgot-code",
    "forgot-reset",
    "verify-account",
  ];

  /* === Login State === */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  /* === Register State === */
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  /* === Verify Account State === */
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  /* === Forgot Password State === */
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  /* === UI State === */
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  /* === Slider Logic === */
  const cardRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (cardRef.current) {
      setPanelWidth(cardRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (cardRef.current) setPanelWidth(cardRef.current.offsetWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentIndex = panels.indexOf(mode);
  const sliderStyle = {
    transform: `translateX(-${currentIndex * panelWidth}px)`,
    transition: "transform 0.4s ease",
    display: "flex",
    width: `${panelWidth * panels.length}px`,
  };

  /* === Password Strength Checkers === */
  const regStrength = useMemo(
    () => ({
      length: regPassword.length >= 8,
      number: /\d/.test(regPassword),
      uppercase: /[A-Z]/.test(regPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(regPassword),
    }),
    [regPassword]
  );
  const regAllStrong = Object.values(regStrength).every(Boolean);

  const resetStrength = useMemo(
    () => ({
      length: forgotNewPassword.length >= 8,
      number: /\d/.test(forgotNewPassword),
      uppercase: /[A-Z]/.test(forgotNewPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(forgotNewPassword),
    }),
    [forgotNewPassword]
  );
  const resetAllStrong = Object.values(resetStrength).every(Boolean);

  /* === Helper to Set Status Messages === */
  const setStatus = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
  };

  /* === Helper: store token based on keepSignedIn === */
  const storeSessionToken = (session) => {
    try {
      const idToken = session.getIdToken().getJwtToken();
      if (keepSignedIn) {
        localStorage.setItem("authToken", idToken);
        sessionStorage.removeItem("authToken");
      } else {
        sessionStorage.setItem("authToken", idToken);
        localStorage.removeItem("authToken");
      }
    } catch {
      // fail silently; navigation still happens
    }
  };

  /* ============================================================
     LOGIN HANDLER
     ============================================================ */
  const handleLogin = () => {
    setLoading(true);
    setStatus("");
    if (!loginEmail || !loginPassword) {
      setStatus("Please enter email and password.", true);
      setLoading(false);
      return;
    }

    const user = new CognitoUser({
      Username: loginEmail,
      Pool: pool,
    });

    const authDetails = new AuthenticationDetails({
      Username: loginEmail,
      Password: loginPassword,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        setStatus("");
        setLoading(false);
        storeSessionToken(session);
        navigate("/home", { replace: true });
      },
      onFailure: (err) => {
        if (err && err.code === "UserNotConfirmedException") {
          setStatus("Please verify your account before signing in.", true);
          setConfirmEmail(loginEmail);
          setMode("verify-account");
        } else {
          setStatus(err.message || "Login failed.", true);
        }
        setLoading(false);
      },
      newPasswordRequired: () => {
        setStatus(
          "Additional steps required. Try resetting your password.",
          true
        );
        setLoading(false);
      },
    });
  };

  /* ============================================================
     REGISTER HANDLER (NOW GOES TO VERIFY-ACCOUNT)
     ============================================================ */
const handleRegister = () => {
  setLoading(true);
  setStatus("");

  if (!regEmail || !regPassword || !regConfirm) {
    setStatus("Please fill out all fields.", true);
    setLoading(false);
    return;
  }
  if (regPassword !== regConfirm) {
    setStatus("Passwords do not match.", true);
    setLoading(false);
    return;
  }
  if (!regAllStrong) {
    setStatus("Password does not meet all requirements.", true);
    setLoading(false);
    return;
  }

  pool.signUp(regEmail, regPassword, [], null, (err, result) => {
    if (err) {
      setStatus(err.message || "Error creating account.", true);
      setLoading(false);
      return;
    }

    const emailFromCognito =
      (result && result.user && result.user.getUsername()) || regEmail;

    setConfirmEmail(emailFromCognito);
    setConfirmCode("");

    // ⭐ Correct behavior:
    // Show success message on the SIGN IN panel
    setStatus("Account created. Check your email for a verification code.");

    // ⭐ Send user back to Sign In (NOT to create-new-password)
    setMode("login");

    setLoading(false);
  });
};

  /* ============================================================
     VERIFY ACCOUNT HANDLER
     ============================================================ */
  const handleVerifyAccount = () => {
    setLoading(true);
    setStatus("");

    if (!confirmEmail || !confirmCode) {
      setStatus("Please enter the verification code.", true);
      setLoading(false);
      return;
    }

    const user = new CognitoUser({
      Username: confirmEmail,
      Pool: pool,
    });

    user.confirmRegistration(confirmCode, true, {
      onSuccess: () => {
        // After confirmation, auto-login using the original email + password if available
        if (!regPassword) {
          setStatus(
            "Account verified. Please sign in with your credentials."
          );
          setMode("login");
          setLoading(false);
          return;
        }

        const authDetails = new AuthenticationDetails({
          Username: confirmEmail,
          Password: regPassword,
        });

        user.authenticateUser(authDetails, {
          onSuccess: (session) => {
            setStatus("");
            setLoading(false);
            storeSessionToken(session);
            navigate("/home", { replace: true });
          },
          onFailure: () => {
            setStatus(
              "Account verified. Please sign in with your credentials.",
              false
            );
            setLoading(false);
            setMode("login");
          },
        });
      },
      onFailure: (err) => {
        setStatus(err.message || "Error verifying account.", true);
        setLoading(false);
      },
    });
  };

  /* ============================================================
     RESEND VERIFICATION CODE
     ============================================================ */
  const handleResendVerification = () => {
    setLoading(true);
    setStatus("");

    if (!confirmEmail) {
      setStatus("No email available to resend code.", true);
      setLoading(false);
      return;
    }

    const user = new CognitoUser({
      Username: confirmEmail,
      Pool: pool,
    });

    user.resendConfirmationCode((err) => {
      if (err) {
        setStatus(err.message || "Error resending code.", true);
        setLoading(false);
        return;
      }
      setStatus("A new verification code has been sent to your email.");
      setLoading(false);
    });
  };

  /* ============================================================
     FORGOT PASSWORD — SEND CODE
     ============================================================ */
  const handleForgotSendCode = () => {
    setLoading(true);
    setStatus("");
    if (!forgotEmail) {
      setStatus("Please enter your email.", true);
      setLoading(false);
      return;
    }

    const user = new CognitoUser({
      Username: forgotEmail,
      Pool: pool,
    });

    user.forgotPassword({
      onSuccess: () => {},
      onFailure: (err) => {
        setStatus(err.message || "Error sending reset code.", true);
        setLoading(false);
      },
      inputVerificationCode: () => {
        setStatus("Verification code sent. Check your email.");
        setLoading(false);
        setMode("forgot-code");
      },
    });
  };

  /* ============================================================
     FORGOT PASSWORD — RESET PASSWORD
     ============================================================ */
  const handleForgotReset = () => {
    setLoading(true);
    setStatus("");
    if (
      !forgotEmail ||
      !forgotCode ||
      !forgotNewPassword ||
      !forgotConfirmPassword
    ) {
      setStatus("Please fill out all fields.", true);
      setLoading(false);
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setStatus("Passwords do not match.", true);
      setLoading(false);
      return;
    }
    if (!resetAllStrong) {
      setStatus("Password does not meet all requirements.", true);
      setLoading(false);
      return;
    }

    const user = new CognitoUser({
      Username: forgotEmail,
      Pool: pool,
    });

    user.confirmPassword(forgotCode, forgotNewPassword, {
      onSuccess: () => {
        setStatus("Password reset successful. You can now log in.");
        setLoading(false);
        setMode("login");
        setLoginEmail(forgotEmail);
        setLoginPassword("");
      },
      onFailure: (err) => {
        setStatus(err.message || "Error resetting password.", true);
        setLoading(false);
      },
    });
  };

  /* ============================================================
     PASSWORD CRITERIA COMPONENT
     ============================================================ */
  const PasswordCriteria = ({ label, ok }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: ok ? "#10b981" : "#e5e7eb",
          boxShadow: ok ? "0 0 6px rgba(16,185,129,0.18)" : "none",
        }}
      />
      <div
        style={{
          color: ok ? "#065f46" : "#6b7280",
          fontSize: 13,
        }}
      >
        {label}
      </div>
    </div>
  );

  const renderPasswordRequirements = (strength) => (
    <div style={styles.criteria}>
      <PasswordCriteria label="At least 8 characters" ok={strength.length} />
      <PasswordCriteria label="Contains a number" ok={strength.number} />
      <PasswordCriteria label="Uppercase letter" ok={strength.uppercase} />
      <PasswordCriteria label="Special character" ok={strength.special} />
    </div>
  );

  /* ============================================================
     JSX STARTS HERE
     ============================================================ */
  return (
    <div style={styles.page}>
      {/* === HEADER WITH ORIGINAL SVG LOGO === */}
      <header style={styles.header}>
        <div style={styles.brand}>
          {/* ORIGINAL INLINE SVG LOGO */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0b5cff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16l-1.5 12.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 7z" />
            <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <div>
            <div style={styles.siteName}>Bucket Lyst</div>
            <div style={styles.siteTag}>Student Task Manager</div>
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT AREA === */}
      <main style={styles.centerArea}>
        <div ref={cardRef} style={styles.card}>
          <div style={styles.sliderViewport}>
            <div style={sliderStyle}>
              {/* === LOGIN PANEL === */}
              <div
                style={{
                  width: panelWidth,
                  padding: 24,
                  boxSizing: "border-box",
                }}
              >
                <div style={styles.title}>Sign in</div>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />

                {/* Keep me signed in */}
                <div
                  style={styles.checkboxRow}
                  onClick={() => setKeepSignedIn(!keepSignedIn)}
                >
                  <div
                    style={{
                      ...styles.checkboxBox,
                      ...(keepSignedIn ? styles.checkboxBoxChecked : {}),
                    }}
                  >
                    {keepSignedIn && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8.5L6.2 11.5L13 4.5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span style={styles.checkboxLabel}>Keep me signed in</span>
                </div>

                <button
                  style={styles.button}
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <div style={styles.switchText}>
                  <span
                    style={styles.switchLink}
                    onClick={() => {
                      setMode("forgot-email");
                      setStatus("");
                    }}
                  >
                    Forgot your password
                  </span>
                </div>
                <div style={styles.switchText}>
                  Don’t have an account?{" "}
                  <span
                    style={styles.switchLink}
                    onClick={() => {
                      setMode("register");
                      setStatus("");
                    }}
                  >
                    Create one
                  </span>
                </div>
              </div>

              {/* === REGISTER PANEL === */}
              <div
                style={{
                  width: panelWidth,
                  padding: 24,
                  boxSizing: "border-box",
                }}
              >
                <div style={styles.title}>Create Account</div>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                {renderPasswordRequirements(regStrength)}
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Confirm password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                />
                <button
                  style={styles.button}
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
                <div style={styles.switchText}>
                  Already have an account?{" "}
                  <span
                    style={styles.switchLink}
                    onClick={() => {
                      setMode("login");
                      setStatus("");
                    }}
                  >
                    Sign in
                  </span>
                </div>
              </div>

              {/* === VERIFY ACCOUNT PANEL === */}
              <div
                style={{
                  width: panelWidth,
                  padding: 24,
                  boxSizing: "border-box",
                }}
              >
                <div style={styles.title}>Check Your Email</div>
                <input
                  style={{
                    ...styles.input,
                    backgroundColor: "#f9fafb",
                    cursor: "default",
                  }}
                  type="text"
                  readOnly
                  value={maskEmail(confirmEmail)}
                  placeholder="Email"
                />
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Verification code"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                />
                <button
                  style={styles.button}
                  onClick={handleVerifyAccount}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify account"}
                </button>
                <div style={styles.switchText}>
                  Didn’t get a code?{" "}
                  <span
                    style={styles.switchLink}
                    onClick={handleResendVerification}
                  >
                    Resend code
                  </span>
                </div>
                <div style={styles.switchText}>
                  Already verified?{" "}
                  <span
                    style={styles.switchLink}
                    onClick={() => {
                      setMode("login");
                      setStatus("");
                    }}
                  >
                    Back to sign in
                  </span>
                </div>
              </div>

              {/* === FORGOT EMAIL PANEL === */}
              <div
                style={{
                  width: panelWidth,
                  padding: 24,
                  boxSizing: "border-box",
                }}
              >
                <div style={styles.title}>Reset Password</div>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <button
                  style={styles.button}
                  onClick={handleForgotSendCode}
                  disabled={loading}
                >
                  {loading ? "Sending code..." : "Send code"}
                </button>
                <div style={styles.switchText}>
                  Remembered your password?{" "}
                  <span
                    style={styles.switchLink}
                    onClick={() => {
                      setMode("login");
                      setStatus("");
                    }}
                  >
                    Back to sign in
                  </span>
                </div>
              </div>

              {/* === FORGOT CODE PANEL === */}
              <div
                style={{
                  width: panelWidth,
                  padding: 24,
                  boxSizing: "border-box",
                }}
              >
                <div style={styles.title}>Enter Verification Code</div>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Verification code"
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value)}
                />
                <button
                  style={styles.button}
                  onClick={() => {
                    if (!forgotCode) {
                      setStatus(
                        "Please enter the code from your email.",
                        true
                      );
                      return;
                    }
                    setStatus("");
                    setMode("forgot-reset");
                  }}
                >
                  Continue
                </button>
              </div>

              {/* === FORGOT RESET PANEL === */}
              <div
                style={{
                  width: panelWidth,
                  padding: 24,
                  boxSizing: "border-box",
                }}
              >
                <div style={styles.title}>Create New Password</div>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="New password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                />
                {renderPasswordRequirements(resetStrength)}
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotConfirmPassword}
                  onChange={(e) =>
                    setForgotConfirmPassword(e.target.value)
                  }
                />
                <button
                  style={styles.button}
                  onClick={handleForgotReset}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save new password"}
                </button>
              </div>
            </div>
          </div>

          {/* === STATUS MESSAGE === */}
          <div style={styles.message}>
            {message && (
              <span
                style={{
                  color: isError ? "#ef4444" : "#10b981",
                }}
              >
                {message}
              </span>
            )}
          </div>
        </div>
      </main>

      {/* === FOOTER === */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={styles.statusDot} />
            <span style={styles.statusText}>
              System status: All systems operational
            </span>
          </div>
          <div style={styles.copy}>
            © {new Date().getFullYear()} Bucket Lyst
          </div>
        </div>
      </footer>

      {/* === LOADING OVERLAY === */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STYLES + SPINNER KEYFRAMES
   ============================================================ */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f5f5f7",
    fontFamily:
      "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    boxSizing: "border-box",
  },
  header: {
    padding: "28px 20px 0 20px",
    display: "flex",
    justifyContent: "center",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  siteName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0b5cff",
    lineHeight: 1,
  },
  siteTag: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  centerArea: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    width: 440,
    minHeight: 520,
    padding: 0,
    borderRadius: 16,
    background: "white",
    boxShadow: "0 12px 40px rgba(2,6,23,0.08)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  sliderViewport: {
    width: "100%",
    overflow: "hidden",
    display: "block",
  },
  title: {
    marginBottom: 18,
    fontWeight: 600,
    fontSize: 22,
  },
  input: {
    width: "92%",
    maxWidth: 380,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e6e7eb",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12,
  },
  button: {
    width: "92%",
    maxWidth: 380,
    padding: "12px",
    borderRadius: 10,
    border: "none",
    background: "#0b5cff",
    color: "white",
    fontSize: 15,
    cursor: "pointer",
    marginTop: 8,
  },
  switchText: {
    marginTop: 18,
    color: "#6b7280",
    fontSize: 14,
  },
  switchLink: {
    color: "#0b5cff",
    cursor: "pointer",
    textDecoration: "underline",
  },
  criteria: {
    width: "92%",
    maxWidth: 380,
    marginTop: 6,
    marginBottom: 6,
    textAlign: "left",
  },
  message: {
    marginTop: 12,
    minHeight: 20,
    fontSize: 13,
  },
  footer: {
    borderTop: "1px solid rgba(0,0,0,0.04)",
    background: "#ffffff",
    padding: "12px 20px",
  },
  footerInner: {
    maxWidth: 980,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    fontSize: 13,
    color: "#6b7280",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#10b981",
    boxShadow: "0 0 6px rgba(16,185,129,0.18)",
  },
  statusText: {
    color: "#374151",
    fontSize: 13,
  },
  copy: {
    color: "#9ca3af",
    fontSize: 13,
  },
  loadingOverlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(10,11,13,0.12)",
    zIndex: 9999,
  },
  spinner: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "6px solid rgba(255,255,255,0.9)",
    borderTopColor: "#0b5cff",
    boxShadow: "0 6px 20px rgba(11,92,255,0.12)",
    animation: "spin 900ms linear infinite",
  },

  /* === Apple-style checkbox === */
  checkboxRow: {
    width: "92%",
    maxWidth: 380,
    margin: "4px auto 4px auto",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    userSelect: "none",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    transition: "all 0.15s ease",
  },
  checkboxBoxChecked: {
    backgroundColor: "#0b5cff",
    borderColor: "#0b5cff",
    boxShadow: "0 0 0 1px rgba(11,92,255,0.18)",
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#4b5563",
  },
};

/* ============================================================
   SPINNER KEYFRAMES INJECTION
   ============================================================ */
if (
  typeof document !== "undefined" &&
  !document.getElementById("auth-spinner-keyframes")
) {
  const style = document.createElement("style");
  style.id = "auth-spinner-keyframes";
  style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
