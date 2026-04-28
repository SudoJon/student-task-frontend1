import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "../../cognitoConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { authStyles as styles } from "../../styles/authStyles";

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
                const idToken = session.getIdToken().getJwtToken();

                if (keepSignedIn) {
                    localStorage.setItem("authToken", idToken);
                } else {
                    sessionStorage.setItem("authToken", idToken);
                }

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
            setLoginEmail(regEmail);
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

                            {/* PANEL 2: FORGOT - CHECK EMAIL CONFIRMATION */}
                            <div style={panelTileStyle}>
                                <div style={styles.panelIcon}>📨</div>

                                <h2 style={styles.title}>Check Your Email</h2>

                                <p style={styles.subtitle}>
                                    We’ve sent a password reset link to your email.
                                    Open the link in your inbox to create a new password.
                                </p>

                                <button
                                    style={styles.button}
                                    onClick={() => setMode("login")} // ⭐ FIXED THIS LINE!
                                >
                                    Return to Sign In →
                                </button>

                                <p style={styles.switchText}>
                                    Didn’t receive it?{" "}
                                    <span
                                        style={styles.switchLink}
                                        onClick={() => setMode("forgot-email")}
                                    >
                                        Try again
                                    </span>
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
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <span style={{ color: ok ? "#5b21b6" : "#9ca3af", fontSize: 13, fontWeight: ok ? 600 : 400, transition: "color 0.2s" }}>
                {label}
            </span>
        </div>
    );
}