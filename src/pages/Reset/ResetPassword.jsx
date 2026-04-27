// src/pages/Reset/ResetPassword.jsx

import React, { useState, useEffect } from "react";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import { cognitoConfig } from "../../cognitoConfig";
import { authStyles as styles } from "../../styles/authStyles";

/* -------------------------------
   Password Rule Checker
--------------------------------*/
const checkPasswordRules = (password) => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
});

/* -------------------------------
   Criteria Item Component
--------------------------------*/
const CriteriaItem = ({ label, valid }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
                style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: valid ? "#10b981" : "#d1d5db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 10,
                    transition: "0.2s",
                }}
            >
                {valid ? "✓" : ""}
            </div>

            <span
                style={{
                    color: valid ? "#10b981" : "#6b7280",
                    fontWeight: valid ? 600 : 400,
                    transition: "0.2s",
                }}
            >
                {label}
            </span>
        </div>
    );
};

/* -------------------------------
   Cognito Pool
--------------------------------*/
const pool = new CognitoUserPool({
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.clientId,
});

/* -------------------------------
   Reset Password Page
--------------------------------*/
export default function ResetPassword() {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [rules, setRules] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
    });

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    // Extract email + code from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") || params.get("username") || "");
        setCode(params.get("code") || "");
    }, []);

    const handleReset = () => {
        if (!password || !confirm) {
            setMessage("Please fill out both password fields.");
            return;
        }
        if (password !== confirm) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        const user = new CognitoUser({
            Username: email,
            Pool: pool,
        });

        user.confirmPassword(code, password, {
            onSuccess: () => {
                navigate("/auth", {
                    state: { resetSuccess: true },
                });
            },
            onFailure: (err) => {
                setLoading(false);
                setMessage(err.message || "Could not reset password.");
            },
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
                            <path d="M9 11L11 13L15 9" stroke="white" strokeWidth="2" />
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
                        <div style={styles.panelIcon}>🔑</div>
                        <h2 style={styles.title}>Create New Password</h2>
                        <p style={styles.subtitle}>Enter your new password below</p>

                        {/* New Password */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.fieldLabel}>New password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPassword(val);
                                    setRules(checkPasswordRules(val));
                                }}
                                style={styles.input}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.fieldLabel}>Confirm password</label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        {/* Interactive Criteria */}
                        <div style={styles.criteria}>
                            <strong>Password must include:</strong>

                            <div
                                style={{
                                    marginTop: 10,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6,
                                }}
                            >
                                <CriteriaItem label="At least 8 characters" valid={rules.length} />
                                <CriteriaItem label="One uppercase letter" valid={rules.upper} />
                                <CriteriaItem label="One lowercase letter" valid={rules.lower} />
                                <CriteriaItem label="One number" valid={rules.number} />
                                <CriteriaItem label="One special character" valid={rules.special} />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <button
                            style={styles.button}
                            onClick={handleReset}
                            disabled={loading}
                        >
                            {loading ? "Resetting…" : "Reset Password →"}
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
