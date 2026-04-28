import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNote } from "../../api/notes";

const NOTE_COLORS = [
    { key: "purple", bg: "#f5f3ff", border: "#a78bfa", dot: "#7c3aed", label: "Purple" },
    { key: "pink", bg: "#fce7f3", border: "#f9a8d4", dot: "#db2777", label: "Pink" },
    { key: "teal", bg: "#ccfbf1", border: "#5eead4", dot: "#0d9488", label: "Teal" },
    { key: "amber", bg: "#fef3c7", border: "#fcd34d", dot: "#d97706", label: "Amber" },
    { key: "blue", bg: "#dbeafe", border: "#93c5fd", dot: "#2563eb", label: "Blue" },
];

export default function NewNote() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [color, setColor] = useState("purple");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const activeColor = NOTE_COLORS.find(c => c.key === color) || NOTE_COLORS[0];
    const hasContent = title.trim() || body.trim();

    async function handleSave() {
        if (!hasContent || saving) return;
        setSaving(true);
        try {
            await createNote({
                title: title.trim() || "Untitled",
                content: body.trim(),
                color,
            });
            setSaved(true);
            setTimeout(() => navigate("/notes"), 900);
        } catch (e) {
            console.error("Failed to save note", e);
            setSaving(false);
        }
    }

    const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
    const charCount = body.length;

    return (
        <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>
            {/* ── Header ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 28,
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 16,
                            background: `linear-gradient(135deg,${activeColor.dot},${activeColor.border})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            boxShadow: `0 6px 18px ${activeColor.dot}44`,
                            transition: "background 0.3s, box-shadow 0.3s",
                            flexShrink: 0,
                        }}
                    >
                        📝
                    </div>
                    <div>
                        <h1
                            style={{
                                fontSize: 26,
                                fontWeight: 800,
                                color: "#1e1b4b",
                                margin: 0,
                                letterSpacing: -0.5,
                            }}
                        >
                            New Note
                        </h1>
                        <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
                            {wordCount} word{wordCount !== 1 ? "s" : ""} · {charCount} character
                            {charCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => navigate("/notes")}
                        style={{
                            padding: "10px 20px",
                            borderRadius: 12,
                            border: "1.5px solid #e5e7eb",
                            background: "#f9fafb",
                            color: "#374151",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasContent || saving}
                        style={{
                            padding: "10px 24px",
                            borderRadius: 12,
                            border: "none",
                            background:
                                hasContent && !saving
                                    ? "linear-gradient(135deg,#7c3aed,#a78bfa)"
                                    : "#e5e7eb",
                            color: hasContent && !saving ? "#fff" : "#9ca3af",
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: hasContent && !saving ? "pointer" : "not-allowed",
                            fontFamily: "inherit",
                            boxShadow:
                                hasContent && !saving
                                    ? "0 4px 14px rgba(124,58,237,0.28)"
                                    : "none",
                            transition: "background 0.2s, box-shadow 0.2s",
                        }}
                    >
                        {saved ? "✅ Saved!" : saving ? "Saving…" : "💾 Save Note"}
                    </button>
                </div>
            </div>

            {/* ── Note editor card ── */}
            <div
                style={{
                    background: activeColor.bg,
                    borderRadius: 24,
                    border: `2px solid ${activeColor.border}`,
                    padding: "28px 32px",
                    boxShadow: `0 4px 28px ${activeColor.dot}18`,
                    transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
                }}
            >
                {/* Color picker */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 22,
                    }}
                >
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#9ca3af",
                            letterSpacing: 1,
                            textTransform: "uppercase",
                        }}
                    >
                        Color
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        {NOTE_COLORS.map((c) => (
                            <button
                                key={c.key}
                                onClick={() => setColor(c.key)}
                                title={c.label}
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    background: c.dot,
                                    border: "none",
                                    outline:
                                        color === c.key
                                            ? `3px solid ${c.dot}`
                                            : "3px solid transparent",
                                    outlineOffset: 2,
                                    cursor: "pointer",
                                    transform: color === c.key ? "scale(1.25)" : "scale(1)",
                                    transition: "transform 0.15s, outline 0.15s",
                                    boxShadow:
                                        color === c.key ? `0 0 0 4px ${c.bg}` : "none",
                                }}
                            />
                        ))}
                    </div>
                    <span
                        style={{
                            fontSize: 12,
                            color: activeColor.dot,
                            fontWeight: 700,
                            background: activeColor.bg,
                            padding: "2px 10px",
                            borderRadius: 999,
                            border: `1px solid ${activeColor.border}`,
                        }}
                    >
                        {activeColor.label}
                    </span>
                </div>

                {/* Title */}
                <input
                    placeholder="Note title…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "0 0 14px",
                        border: "none",
                        borderBottom: `2px solid ${activeColor.border}`,
                        background: "transparent",
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#1e1b4b",
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                        marginBottom: 20,
                        transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                        (e.target.style.borderBottomColor = activeColor.dot)
                    }
                    onBlur={(e) =>
                        (e.target.style.borderBottomColor = activeColor.border)
                    }
                />

                {/* Body */}
                <textarea
                    placeholder="Start writing your note here…"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={14}
                    style={{
                        width: "100%",
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        fontSize: 15,
                        color: "#374151",
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                        lineHeight: 1.8,
                        resize: "vertical",
                    }}
                />
            </div>

            {/* ── Tips row ── */}
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 20,
                    flexWrap: "wrap",
                }}
            >
                {[
                    { icon: "💡", tip: "Notes are saved securely to your account." },
                    { icon: "🎨", tip: "Pick a color to organize by subject." },
                    { icon: "🔍", tip: "Search all notes from the Notes page." },
                ].map((t, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "#fff",
                            borderRadius: 12,
                            padding: "10px 16px",
                            fontSize: 13,
                            color: "#6b7280",
                            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                            flex: "1 1 180px",
                        }}
                    >
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        {t.tip}
                    </div>
                ))}
            </div>
        </div>
    );
}
