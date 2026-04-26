import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "../../cognitoConfig";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";

/* === Cognito Setup === */
const pool = new CognitoUserPool({
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.clientId,
});

export default function Auth() {
    const { globalLoading, setGlobalLoading } = useLoading();
    const navigate = useNavigate();

    /* === Modes for slider === */
    const [mode, setMode] = useState("login");
    const panels = [
        "login",
        "register",
        "forgot-email",
        "forgot-code",
        "forgot-reset",
    ];

    /* === Login State === */
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [keepSignedIn, setKeepSignedIn] = useState(false);

    /* === Register State === */
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirm, setRegConfirm] = useState("");

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

    /* ⭐ Detect redirect from external Verify page */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("verified") === "true") {
            const email = params.get("email") || "";
            setLoginEmail(email);
            setMessage("Your account is now verified. Please sign in.");
            setIsError(false);
            setMode("login");
        }
    }, []);

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

    const setStatus = (msg, error = false) => {
        setMessage(msg);
        setIsError(error);
    };

    /* ⭐ FIXED: Token Storage */
    const storeSessionToken = (session) => {
        try {
            const accessToken = session.getAccessToken().getJwtToken();
            if (keepSignedIn) {
                localStorage.setItem("authToken", accessToken);
                sessionStorage.removeItem("authToken");
            } else {
                sessionStorage.setItem("authToken", accessToken);
                localStorage.removeItem("authToken");
            }
        } catch (err) {
            console.error("Failed to store token cleanly:", err);
        }
    };

    const handleLogin = () => {
        setLoading(true);
        setStatus("");
        if (!loginEmail || !loginPassword) {
            setStatus("Please enter email and password.", true);
            setLoading(false);
            return;
        }

        const user = new CognitoUser({ Username: loginEmail, Pool: pool });
        const authDetails = new AuthenticationDetails({ Username: loginEmail, Password: loginPassword });

        user.authenticateUser(authDetails, {
            onSuccess: (session) => {
                storeSessionToken(session);
                setLoading(false);
                setGlobalLoading(false); // FIXED: Cleared so it doesn't infinite loop on rejection!
                navigate("/home", { replace: true });
            },
            onFailure: (err) => {
                if (err?.code === "UserNotConfirmedException") {
                    setMode("login");
                    setStatus("Please verify your account before signing in.", true);
                } else {
                    setStatus(err.message || "Error signing in.", true);
                }
                setLoading(false);
                setGlobalLoading(false);
            },
            newPasswordRequired: () => {
                setStatus("This account requires a password reset.", true);
                setMode("forgot-email");
                setLoading(false);
                setGlobalLoading(false);
            },
        });
    };

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

        pool.signUp(regEmail, regPassword, [], null, (err) => {
            if (err) {
                setStatus(err.message || "Error creating account.", true);
                setLoading(false);
                return;
            }
            setMode("login");
            setLoginEmail(regEmail);
            setStatus("Account created. Check your email for a verification code.");
            setLoading(false);
        });
    };

    const handleForgotSendCode = () => {
        setLoading(true);
        setStatus("");
        if (!forgotEmail) {
            setStatus("Please enter your email.", true);
            setLoading(false);
            return;
        }

        const user = new CognitoUser({ Username: forgotEmail, Pool: pool });
        user.forgotPassword({
            onSuccess: () => { },
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

    const handleForgotReset = () => {
        setLoading(true);
        setStatus("");
        if (!forgotEmail || !forgotCode || !forgotNewPassword || !forgotConfirmPassword) {
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

        const user = new CognitoUser({ Username: forgotEmail, Pool: pool });
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

    const PasswordCriteria = ({ label, ok }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div
                style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: ok ? "#10b981" : "#e5e7eb",
                    boxShadow: ok ? "0 0 6px rgba(16,185,129,0.18)" : "none",
                }}
            />
            <div style={{ color: ok ? "#065f46" : "#6b7280", fontSize: 13 }}>{label}</div>
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

    return (
        <div style={styles.page}>
            {globalLoading && (
                <div style={styles.loadingOverlay}>
                    <div style={styles.spinner} />
                </div>
            )}

            <header style={styles.header}>
                <div style={styles.brand}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0b5cff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7h16l-1.5 12.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 7z" />
                        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                    <div style={styles.siteName}>Bucket Lyst</div>
                </div>
            </header>

            <main style={styles.centerArea}>
                <div ref={cardRef} style={styles.card}>
                    <div style={styles.sliderViewport}>
                        <div style={sliderStyle}>

                            {/* === LOGIN PANEL === */}
                            <div style={{ ...styles.panelContainer, width: panelWidth }}>
                                <div style={styles.title}>Sign in with Bucket Lyst</div>
                                <input style={styles.input} type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                                <input style={styles.input} type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                                <div style={styles.checkboxRow} onClick={() => setKeepSignedIn(!keepSignedIn)}>
                                    <div style={{ ...styles.checkboxBox, ...(keepSignedIn ? styles.checkboxBoxChecked : {}) }}>
                                        {keepSignedIn && (
                                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                                <path d="M3 8.5L6.2 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span style={styles.checkboxLabel}>Keep me signed in</span>
                                </div>
                                <button style={styles.button} onClick={handleLogin} disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
                                <div style={styles.linksContainer}>
                                    <div style={styles.switchLink} onClick={() => { setMode("forgot-email"); setStatus(""); }}>Forgotten your password?</div>
                                    <div style={styles.switchLink} onClick={() => { setMode("register"); setStatus(""); }}>Create Account</div>
                                </div>
                            </div>

                            {/* === REGISTER PANEL === */}
                            <div style={{ ...styles.panelContainer, width: panelWidth }}>
                                <div style={styles.title}>Create Account</div>
                                <input style={styles.input} type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                                <input style={styles.input} type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                                <input style={styles.input} type="password" placeholder="Confirm password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} />
                                {renderPasswordRequirements(regStrength)}
                                <button style={styles.button} onClick={handleRegister} disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
                                <div style={styles.linksContainer}>
                                    <div style={styles.switchLink} onClick={() => { setMode("login"); setStatus(""); }}>Back to Sign In</div>
                                </div>
                            </div>

                            {/* === FORGOT EMAIL PANEL === */}
                            <div style={{ ...styles.panelContainer, width: panelWidth }}>
                                <div style={styles.title}>Reset Password</div>
                                <input style={styles.input} type="email" placeholder="Enter your email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                                <button style={styles.button} onClick={handleForgotSendCode} disabled={loading}>{loading ? "Sending code..." : "Send code"}</button>
                                <div style={styles.linksContainer}>
                                    <div style={styles.switchLink} onClick={() => { setMode("login"); setStatus(""); }}>Back to Sign In</div>
                                </div>
                            </div>

                            {/* === FORGOT CODE PANEL === */}
                            <div style={{ ...styles.panelContainer, width: panelWidth }}>
                                <div style={styles.title}>Enter Verification Code</div>
                                <input style={styles.input} type="text" placeholder="Verification code" value={forgotCode} onChange={(e) => setForgotCode(e.target.value)} />
                                <button style={styles.button} onClick={() => { if (!forgotCode) { setStatus("Please enter the code.", true); return; } setStatus(""); setMode("forgot-reset"); }}>Continue</button>
                            </div>

                            {/* === FORGOT RESET PANEL === */}
                            <div style={{ ...styles.panelContainer, width: panelWidth }}>
                                <div style={styles.title}>Create New Password</div>
                                <input style={styles.input} type="password" placeholder="New password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} />
                                <input style={styles.input} type="password" placeholder="Confirm new password" value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)} />
                                {renderPasswordRequirements(resetStrength)}
                                <button style={styles.button} onClick={handleForgotReset} disabled={loading}>{loading ? "Saving..." : "Save new password"}</button>
                            </div>
                        </div>
                    </div>

                    <div style={styles.message}>
                        {message && <span style={{ color: isError ? "#ef4444" : "#10b981" }}>{message}</span>}
                    </div>
                </div>
            </main>

            <footer style={styles.footer}>
                <div style={styles.footerInner}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={styles.statusDot} />
                            <span style={styles.statusText}>System Status</span>
                        </div>
                        <span style={styles.statusText}>Privacy Policy</span>
                        <span style={styles.statusText}>Terms & Conditions</span>
                    </div>
                    <div style={styles.copy}>Copyright © {new Date().getFullYear()} Bucket Lyst.</div>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    page: {
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        boxSizing: "border-box",
    },
    header: { padding: "24px 40px", display: "flex", justifyContent: "flex-start" },
    brand: { display: "flex", alignItems: "center", gap: 8 },
    siteName: { fontSize: 20, fontWeight: 600, color: "#1d1d1f" },
    centerArea: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        overflow: "hidden"
    },
    card: {
        width: 520, // iCloud size
        minHeight: 480,
        borderRadius: 24,
        background: "white",
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
    },
    sliderViewport: { width: "100%", overflow: "hidden" },
    panelContainer: { padding: "56px 0 24px 0", display: "flex", flexDirection: "column", alignItems: "center" },
    title: { marginBottom: 32, fontWeight: 600, fontSize: 26, color: "#1d1d1f" },
    input: {
        width: 340, // Centered content width
        padding: "16px",
        borderRadius: 12,
        border: "1px solid #d2d2d7",
        fontSize: 15,
        marginBottom: 16,
        outline: "none",
    },
    button: {
        width: 340,
        padding: "16px",
        borderRadius: 12,
        background: "#0b5cff",
        color: "white",
        fontSize: 15,
        border: "none",
        cursor: "pointer",
        marginTop: 8,
        marginBottom: 24,
    },
    linksContainer: { display: "flex", flexDirection: "column", gap: 16, marginTop: 8 },
    switchLink: { color: "#0b5cff", cursor: "pointer", fontSize: 14 },
    criteria: { width: 340, margin: "0 auto 16px auto", textAlign: "left" },
    message: { marginBottom: 24, minHeight: 20, fontSize: 14, width: 340 },
    footer: { padding: "20px 40px" },

    footerInner: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#6b7280", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px" },
    statusDot: { width: 8, height: 8, borderRadius: 999, background: "#10b981" },
    statusText: { cursor: "pointer" },

    loadingOverlay: { position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.05)", zIndex: 9999 },

    spinner: { width: 50, height: 50, border: "5px solid #f3f3f3", borderTop: "5px solid #0b5cff", borderRadius: "50%", animation: "spin 1s linear infinite" },
    checkboxRow: { margin: "8px 0 24px 0", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
    checkboxBox: { width: 16, height: 16, borderRadius: 4, border: "1px solid #c7c7cc" },
    checkboxBoxChecked: { backgroundColor: "#0b5cff", borderColor: "#0b5cff" },
    checkboxLabel: { fontSize: 14, color: "#1d1d1f" },
};

// Global keyframes for spinner
if (typeof document !== "undefined" && !document.getElementById("auth-spin-style")) {
    const s = document.createElement("style");
    s.id = "auth-spin-style";
    s.innerHTML = "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
    document.head.appendChild(s);
}