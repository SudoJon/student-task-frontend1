import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "../../cognitoConfig";
import { useNavigate, useLocation } from "react-router-dom";

const pool = new CognitoUserPool({
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId,
});

export default function Auth() {
  // modes
  const [mode, setMode] = useState("login"); // login | forgot-email | forgot-code | forgot-reset | register

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  // forgot state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState(false);

  // register state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState(false);

  // UI
  const [message, setMessage] = useState("");
  const [messageNeutral, setMessageNeutral] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home";

  // slider measurement and refs
  const cardRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(0);
  const panelCount = 5; // login, forgot-email, forgot-code, forgot-reset, register

  // password strength checks
  const regStrength = useMemo(() => {
    return {
      length: regPassword.length >= 8,
      number: /\d/.test(regPassword),
      uppercase: /[A-Z]/.test(regPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(regPassword),
    };
  }, [regPassword]);
  const regAllStrong = Object.values(regStrength).every(Boolean);

  const resetStrength = useMemo(() => {
    return {
      length: forgotNewPassword.length >= 8,
      number: /\d/.test(forgotNewPassword),
      uppercase: /[A-Z]/.test(forgotNewPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(forgotNewPassword),
    };
  }, [forgotNewPassword]);
  const resetAllStrong = Object.values(resetStrength).every(Boolean);

  // compute mode index
  const modeIndex =
    mode === "login"
      ? 0
      : mode === "forgot-email"
      ? 1
      : mode === "forgot-code"
      ? 2
      : mode === "forgot-reset"
      ? 3
      : 4;

  // measure panel width using ResizeObserver for robust layout changes
  useEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;

    const measure = () => {
      const w = el.clientWidth || 0;
      setPanelWidth(Math.floor(w));
    };

    measure();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        measure();
      });
      ro.observe(el);
    } else {
      window.addEventListener("resize", measure);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", measure);
    };
  }, []);

  // re-measure after mode changes (microtask) to avoid timing races
  useEffect(() => {
    const id = setTimeout(() => {
      if (!cardRef.current) return;
      const w = cardRef.current.clientWidth || 0;
      setPanelWidth(Math.floor(w));
    }, 40);
    return () => clearTimeout(id);
  }, [mode]);

  const inputBorder = (isError) =>
    isError ? "1.6px solid #ef4444" : "1.5px solid #e5e7eb";

  const emailIsValid = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
  };

  /* ---------- AUTH ACTIONS ---------- */

  const handleLogin = () => {
    setMessage("");
    setLoginError(false);

    if (!loginEmail || !loginPassword) {
      setMessage("Please enter email and password.");
      setLoginError(true);
      return;
    }

    setLoading(true);
    const user = new CognitoUser({ Username: loginEmail, Pool: pool });
    const authDetails = new AuthenticationDetails({
      Username: loginEmail,
      Password: loginPassword,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const token = session.getIdToken().getJwtToken();
        if (keepSignedIn) localStorage.setItem("token", token);
        else sessionStorage.setItem("token", token);
        setLoading(false);
        navigate(from, { replace: true });
      },
      onFailure: (err) => {
        setLoading(false);
        setLoginError(true);
        setMessage(err?.message || "Login failed. Check credentials.");
      },
    });
  };

  /* Forgot flow */
  const sendForgotCode = () => {
    setMessage("");
    setForgotError(false);
    setMessageNeutral(false);

    if (!forgotEmail) {
      setMessage("Please enter your email.");
      setForgotError(true);
      return;
    }
    if (!emailIsValid(forgotEmail)) {
      setMessage("Please enter a valid email address.");
      setForgotError(true);
      return;
    }

    setLoading(true);
    const user = new CognitoUser({ Username: forgotEmail, Pool: pool });
    user.forgotPassword({
      onSuccess: () => {
        setLoading(false);
        setMessage("If the account exists, a verification code was sent.");
        setMode("forgot-code");
      },
      onFailure: (err) => {
        setLoading(false);
        setMessage(err?.message || "Could not send reset code.");
        setForgotError(true);
      },
      inputVerificationCode: () => {
        setLoading(false);
        setMessage("Enter the verification code sent to your email.");
        setMode("forgot-code");
      },
    });
  };

  const verifyForgotCodeAndContinue = () => {
    setMessage("");
    setForgotError(false);
    setMessageNeutral(true);

    if (!forgotCode) {
      setMessage("Please enter the verification code.");
      setForgotError(true);
      setMessageNeutral(false);
      return;
    }
    if (forgotCode.length < 4) {
      setMessage("Verification code looks too short.");
      setForgotError(true);
      setMessageNeutral(false);
      return;
    }

    // proceed to reset panel; authoritative verification happens on confirm
    setMode("forgot-reset");
  };

  const confirmForgotPassword = () => {
    setMessage("");
    setForgotError(false);

    if (!forgotEmail || !forgotCode || !forgotNewPassword || !forgotConfirmPassword) {
      setMessage("Please fill all fields to reset password.");
      setForgotError(true);
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setMessage("Passwords do not match.");
      setForgotError(true);
      return;
    }
    if (!resetAllStrong) {
      setMessage("New password does not meet strength requirements.");
      setForgotError(true);
      return;
    }

    setLoading(true);
    const user = new CognitoUser({ Username: forgotEmail, Pool: pool });
    user.confirmPassword(forgotCode, forgotNewPassword, {
      onSuccess: () => {
        setLoading(false);
        setMessage("Password reset. You can now sign in with the new password.");
        setForgotCode("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setMode("login");
        setLoginEmail(forgotEmail);
        setLoginPassword("");
      },
      onFailure: (err) => {
        setLoading(false);
        setMessage(err?.message || "Could not reset password. The code may be invalid.");
        setForgotError(true);
      },
    });
  };

  /* Register */
  const handleRegister = () => {
    setMessage("");
    setRegError(false);

    if (!regEmail || !regPassword || !regConfirm) {
      setMessage("Please fill all fields.");
      setRegError(true);
      return;
    }
    if (!emailIsValid(regEmail)) {
      setMessage("Please enter a valid email address.");
      setRegError(true);
      return;
    }
    if (regPassword !== regConfirm) {
      setMessage("Passwords do not match.");
      setRegError(true);
      return;
    }
    if (!regAllStrong) {
      setMessage("Password does not meet strength requirements.");
      setRegError(true);
      return;
    }

    setLoading(true);
    pool.signUp(regEmail, regPassword, [], null, (err) => {
      setLoading(false);
      if (err) {
        setMessage(err.message || "Registration error");
        setRegError(true);
        return;
      }
      setMessage("Account created! Check your email to verify.");
      setTimeout(() => setMode("login"), 1100);
    });
  };

  const openForgotEmailPanel = () => {
    setForgotEmail("");
    setForgotCode("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotError(false);
    setMessage("");
    setMessageNeutral(false);
    setMode("forgot-email");
  };

  const cancelToLogin = () => {
    setMessage("");
    setForgotError(false);
    setMessageNeutral(false);
    setMode("login");
  };

  // slider inline styles (use translate3d for crisp GPU transform)
  const offset = -panelWidth * modeIndex;
  const sliderStyle = {
    width: panelWidth ? `${panelCount * panelWidth}px` : `${panelCount * 100}%`,
    display: "flex",
    transition: "transform 420ms cubic-bezier(.2,.9,.2,1)",
    willChange: "transform",
    transform: `translate3d(${offset}px, 0, 0)`,
    boxSizing: "border-box",
  };

  const panelTileStyle = {
    flex: "0 0 auto",
    width: panelWidth ? `${panelWidth}px` : `${100 / panelCount}%`,
    boxSizing: "border-box",
    padding: "40px 36px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <div style={styles.page}>
      {/* Decorative background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logoBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7V9C21 12.866 17.866 16 14 16H10C6.13401 16 3 12.866 3 9V7Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.2)" />
              <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 11L11 13L15 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={styles.siteName}>Bucket Lyst</div>
            <div style={styles.siteTag}>Student Task Manager</div>
          </div>
        </div>
      </header>

      {/* Main card area */}
      <main style={styles.centerArea}>
        {/* Left decorative panel (hidden on small screens via inline) */}
        <div style={styles.leftPanel}>
          <div style={styles.leftPanelContent}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>🎓</div>
            <h2 style={styles.leftTitle}>Stay on top of your studies</h2>
            <p style={styles.leftDesc}>
              Manage tasks, take notes, and stay focused with your personal student dashboard.
            </p>
            <div style={styles.featureList}>
              {["📋 Track all your tasks", "📝 Organize your notes", "🤖 AI study assistant", "🎵 Focus music player"].map((f, i) => (
                <div key={i} style={styles.featureItem}>
                  <div style={styles.featureDot} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div style={styles.card} ref={cardRef}>
          <div style={styles.sliderViewport}>
            <div style={sliderStyle}>

              {/* PANEL 0: LOGIN */}
              <div style={panelTileStyle}>
                <div style={styles.panelIcon}>👋</div>
                <h2 style={styles.title}>Welcome back</h2>
                <p style={styles.subtitle}>Sign in to your account</p>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(loginError) }}
                    onFocus={() => setLoginError(false)}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(loginError) }}
                    onFocus={() => setLoginError(false)}
                  />
                </div>

                <div style={styles.rowBetween}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} style={{ marginRight: 7, accentColor: "#7c3aed" }} />
                    Keep me signed in
                  </label>
                  <button style={styles.linkButton} onClick={openForgotEmailPanel}>
                    Forgot password?
                  </button>
                </div>

                <button style={styles.button} onClick={handleLogin} disabled={loading}>
                  {loading ? "Signing in…" : "Sign In →"}
                </button>

                {message && <p style={styles.message}>{message}</p>}

                <p style={styles.switchText}>
                  Don't have an account?{" "}
                  <span style={styles.switchLink} onClick={() => setMode("register")}>
                    Create one
                  </span>
                </p>
              </div>

              {/* PANEL 1: FORGOT - ENTER EMAIL */}
              <div style={panelTileStyle}>
                <div style={styles.panelIcon}>🔐</div>
                <h2 style={styles.title}>Reset Password</h2>
                <p style={styles.subtitle}>We'll send a code to your email</p>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Email address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(forgotError) }}
                    onFocus={() => setForgotError(false)}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 360 }}>
                  <button style={styles.button} onClick={sendForgotCode} disabled={loading}>
                    {loading ? "Sending…" : "Send Code"}
                  </button>
                  <button style={styles.buttonSecondary} onClick={cancelToLogin}>
                    Cancel
                  </button>
                </div>

                {message && (
                  <p style={{ ...styles.message, color: forgotError ? "#ef4444" : "#374151" }}>{message}</p>
                )}

                <p style={styles.switchText}>
                  Remembered it?{" "}
                  <span style={styles.switchLink} onClick={() => setMode("login")}>Sign in</span>
                </p>
              </div>

              {/* PANEL 2: FORGOT - ENTER CODE */}
              <div style={panelTileStyle}>
                <div style={styles.panelIcon}>📬</div>
                <h2 style={styles.title}>Check Your Email</h2>
                <p style={styles.subtitle}>Enter the verification code we sent</p>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Verification code</label>
                  <input
                    placeholder="e.g. 123456"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(forgotError), letterSpacing: 4, textAlign: "center", fontSize: 18 }}
                    onFocus={() => {
                      setForgotError(false);
                      setMessageNeutral(true);
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 360 }}>
                  <button style={styles.button} onClick={verifyForgotCodeAndContinue}>
                    Next →
                  </button>
                  <button style={styles.buttonSecondary} onClick={cancelToLogin}>
                    Cancel
                  </button>
                </div>

                {message && (
                  <p style={{ ...styles.message, color: forgotError ? "#ef4444" : messageNeutral ? "#374151" : "#ef4444" }}>{message}</p>
                )}

                <p style={styles.switchText}>
                  Wrong email?{" "}
                  <span style={styles.switchLink} onClick={() => setMode("forgot-email")}>Back</span>
                </p>
              </div>

              {/* PANEL 3: FORGOT - RESET NEW PASSWORD */}
              <div style={panelTileStyle}>
                <div style={styles.panelIcon}>🔑</div>
                <h2 style={styles.title}>Set New Password</h2>
                <p style={styles.subtitle}>Choose a strong password</p>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>New password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(forgotError) }}
                    onFocus={() => setForgotError(false)}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Confirm new password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(forgotError) }}
                    onFocus={() => setForgotError(false)}
                  />
                </div>

                <div style={styles.criteria}>
                  <PasswordCriteria label="At least 8 characters" ok={resetStrength.length} />
                  <PasswordCriteria label="Contains a number" ok={resetStrength.number} />
                  <PasswordCriteria label="Uppercase letter" ok={resetStrength.uppercase} />
                  <PasswordCriteria label="Special character" ok={resetStrength.special} />
                </div>

                <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 360 }}>
                  <button style={styles.button} onClick={confirmForgotPassword} disabled={loading}>
                    {loading ? "Confirming…" : "Confirm"}
                  </button>
                  <button style={styles.buttonSecondary} onClick={cancelToLogin}>
                    Cancel
                  </button>
                </div>

                {message && <p style={styles.message}>{message}</p>}

                <p style={styles.switchText}>
                  Remembered it?{" "}
                  <span style={styles.switchLink} onClick={() => setMode("login")}>Sign in</span>
                </p>
              </div>

              {/* PANEL 4: REGISTER */}
              <div style={panelTileStyle}>
                <div style={styles.panelIcon}>✨</div>
                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.subtitle}>Join Bucket Lyst today — it's free</p>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(regError) }}
                    onFocus={() => setRegError(false)}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(regError) }}
                    onFocus={() => setRegError(false)}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Confirm password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    style={{ ...styles.input, border: inputBorder(regError) }}
                    onFocus={() => setRegError(false)}
                  />
                </div>

                <div style={styles.criteria}>
                  <PasswordCriteria label="At least 8 characters" ok={regStrength.length} />
                  <PasswordCriteria label="Contains a number" ok={regStrength.number} />
                  <PasswordCriteria label="Uppercase letter" ok={regStrength.uppercase} />
                  <PasswordCriteria label="Special character" ok={regStrength.special} />
                </div>

                <button style={{ ...styles.button, marginTop: 4 }} onClick={handleRegister} disabled={loading}>
                  {loading ? "Creating…" : "Create Account →"}
                </button>

                {message && <p style={styles.message}>{message}</p>}

                <p style={styles.switchText}>
                  Already have an account?{" "}
                  <span style={styles.switchLink} onClick={() => setMode("login")}>Sign in</span>
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={styles.statusDot} />
            <span style={styles.statusText}>All systems operational</span>
          </div>
          <div style={styles.copy}>© {new Date().getFullYear()} Bucket Lyst</div>
        </div>
      </footer>

      {/* Loading overlay */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinnerWrap}>
            <div style={styles.spinner} />
            <p style={{ color: "#6d28d9", fontSize: 14, fontWeight: 600, margin: "12px 0 0" }}>Please wait…</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes auth-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes auth-blob { 0%,100% { transform: scale(1) translate(0,0); } 50% { transform: scale(1.08) translate(12px,-12px); } }
      `}</style>
    </div>
  );
}

/* Helper: password criteria row */
function PasswordCriteria({ label, ok }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <div style={{
        width: 18, height: 18, borderRadius: 6,
        background: ok ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: ok ? "0 2px 8px rgba(124,58,237,0.25)" : "none",
        transition: "background 0.2s, box-shadow 0.2s",
      }}>
        {ok && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{ color: ok ? "#5b21b6" : "#9ca3af", fontSize: 13, fontWeight: ok ? 600 : 400, transition: "color 0.2s" }}>
        {label}
      </span>
    </div>
  );
}

/* Styles */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 40%, #fce7f3 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute", top: -120, right: -80,
    width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
    pointerEvents: "none",
    animation: "auth-blob 8s ease-in-out infinite",
  },
  blob2: {
    position: "absolute", bottom: -100, left: -60,
    width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
    animation: "auth-blob 10s ease-in-out infinite reverse",
  },
  blob3: {
    position: "absolute", top: "40%", left: "30%",
    width: 300, height: 300, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  header: {
    padding: "24px 32px 0",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoBox: {
    width: 44, height: 44, borderRadius: 14,
    background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
  },
  siteName: {
    fontSize: 22, fontWeight: 800,
    color: "#4c1d95",
    letterSpacing: -0.5, lineHeight: 1,
  },
  siteTag: {
    fontSize: 12, color: "#8b5cf6",
    marginTop: 2, fontWeight: 500,
  },
  centerArea: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px 20px",
    gap: 40,
    position: "relative",
    zIndex: 1,
  },
  leftPanel: {
    width: 320,
    flexShrink: 0,
    display: "none", // shown via media query workaround — always show on desktop
  },
  leftPanelContent: {
    padding: "32px",
    background: "rgba(255,255,255,0.6)",
    borderRadius: 24,
    backdropFilter: "blur(20px)",
    boxShadow: "0 4px 24px rgba(124,58,237,0.1)",
    border: "1px solid rgba(255,255,255,0.8)",
  },
  leftTitle: {
    fontSize: 22, fontWeight: 700,
    color: "#1e1b4b", margin: "0 0 10px",
    lineHeight: 1.3,
  },
  leftDesc: {
    fontSize: 14, color: "#6b7280",
    lineHeight: 1.6, margin: "0 0 20px",
  },
  featureList: {
    display: "flex", flexDirection: "column", gap: 10,
  },
  featureItem: {
    display: "flex", alignItems: "center", gap: 10,
    fontSize: 14, color: "#374151", fontWeight: 500,
  },
  featureDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    flexShrink: 0,
  },
  card: {
    width: 440,
    minHeight: 520,
    borderRadius: 24,
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.9)",
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
    boxSizing: "border-box",
  },
  panelIcon: {
    fontSize: 36, marginBottom: 10,
  },
  title: {
    marginBottom: 6, fontWeight: 800,
    fontSize: 24, color: "#1e1b4b",
    letterSpacing: -0.5, textAlign: "center",
  },
  subtitle: {
    fontSize: 14, color: "#9ca3af",
    margin: "0 0 24px", textAlign: "center",
    fontWeight: 400,
  },
  fieldGroup: {
    width: "100%", maxWidth: 360, marginBottom: 14,
  },
  fieldLabel: {
    display: "block", fontSize: 12, fontWeight: 700,
    color: "#6b7280", marginBottom: 6,
    letterSpacing: 0.4, textTransform: "uppercase",
  },
  input: {
    width: "100%", padding: "12px 14px",
    borderRadius: 12, fontSize: 14,
    outline: "none", boxSizing: "border-box",
    marginBottom: 0, fontFamily: "inherit",
    background: "#fafafa", color: "#1e1b4b",
    transition: "border-color 0.18s, box-shadow 0.18s",
  },
  rowBetween: {
    width: "100%", maxWidth: 360,
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  checkboxLabel: {
    display: "flex", alignItems: "center",
    color: "#374151", fontSize: 13, fontWeight: 500,
    cursor: "pointer",
  },
  linkButton: {
    background: "transparent", border: "none",
    color: "#7c3aed", cursor: "pointer",
    fontSize: 13, fontWeight: 600,
    textDecoration: "none", padding: 0,
    fontFamily: "inherit",
  },
  button: {
    flex: 1, width: "100%", maxWidth: 360,
    padding: "13px 20px", borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    color: "white", fontSize: 15, fontWeight: 700,
    cursor: "pointer", marginTop: 4,
    boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
    fontFamily: "inherit", letterSpacing: 0.2,
    transition: "opacity 0.15s, transform 0.1s",
  },
  buttonSecondary: {
    flex: 1, padding: "13px 20px", borderRadius: 12,
    border: "1.5px solid #e5e7eb",
    background: "#f9fafb", color: "#374151",
    fontSize: 15, fontWeight: 600,
    cursor: "pointer", marginTop: 4,
    fontFamily: "inherit",
  },
  message: {
    marginTop: 12, color: "#ef4444",
    minHeight: 20, fontSize: 13,
    textAlign: "center", fontWeight: 500,
  },
  switchText: {
    marginTop: 20, color: "#9ca3af",
    fontSize: 14, textAlign: "center",
  },
  switchLink: {
    color: "#7c3aed", cursor: "pointer",
    fontWeight: 700, textDecoration: "none",
  },
  criteria: {
    width: "100%", maxWidth: 360,
    marginTop: 4, marginBottom: 12,
    textAlign: "left",
    background: "#faf5ff",
    borderRadius: 12, padding: "12px 14px",
    boxSizing: "border-box",
  },
  footer: {
    borderTop: "1px solid rgba(124,58,237,0.08)",
    background: "rgba(255,255,255,0.7)",
    padding: "12px 24px",
    backdropFilter: "blur(10px)",
    position: "relative", zIndex: 1,
  },
  footerInner: {
    maxWidth: 980, margin: "0 auto",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: 12,
    fontSize: 13, color: "#6b7280",
  },
  statusDot: {
    width: 8, height: 8, borderRadius: 999,
    background: "#10b981",
    boxShadow: "0 0 6px rgba(16,185,129,0.4)",
  },
  statusText: { color: "#374151", fontSize: 13 },
  copy: { color: "#9ca3af", fontSize: 13 },
  loadingOverlay: {
    position: "fixed", inset: 0,
    display: "flex", justifyContent: "center", alignItems: "center",
    background: "rgba(245,243,255,0.7)",
    backdropFilter: "blur(8px)",
    zIndex: 9999,
  },
  spinnerWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center",
    background: "white",
    borderRadius: 20, padding: "28px 36px",
    boxShadow: "0 12px 40px rgba(124,58,237,0.15)",
  },
  spinner: {
    width: 44, height: 44, borderRadius: "50%",
    border: "4px solid #ede9fe",
    borderTopColor: "#7c3aed",
    animation: "auth-spin 0.8s linear infinite",
  },
};
