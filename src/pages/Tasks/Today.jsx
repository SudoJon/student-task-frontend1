import { useEffect, useState } from "react";
import { getTasks } from "../../api/tasks";

/* ─── Shared config ─────────────────────────────────────── */
const PRI = {
    high: { label: "High", bg: "#fee2e2", color: "#dc2626", bar: "#ef4444" },
    medium: { label: "Medium", bg: "#fef3c7", color: "#d97706", bar: "#f59e0b" },
    low: { label: "Low", bg: "#d1fae5", color: "#059669", bar: "#10b981" },
};
const STA = {
    todo: { label: "To Do", bg: "#f3f4f6", color: "#374151" },
    in_progress: { label: "In Progress", bg: "#dbeafe", color: "#1d4ed8" },
    done: { label: "Done", bg: "#d1fae5", color: "#059669" },
};

function Pill({ cfg }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 11px", borderRadius: 999,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 700, letterSpacing: 0.2, whiteSpace: "nowrap",
        }}>
            {cfg.bar && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.bar, display: "inline-block" }} />}
            {cfg.label}
        </span>
    );
}

function Spinner({ color = "#7c3aed", track = "#ede9fe" }) {
    return (
        <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: `3px solid ${track}`, borderTopColor: color,
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
        }} />
    );
}

/* ─── Component ─────────────────────────────────────────── */
export default function Today() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadTasks(); }, []);

    async function loadTasks() {
        const data = await getTasks();
        const today = new Date().toISOString().split("T")[0];
        setTasks(data.filter(t => t.due_date === today));
        setLoading(false);
    }

    const todayLabel = new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const done = tasks.filter(t => t.status === "done").length;
    const pending = tasks.length - done;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    return (
        <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, boxShadow: "0 6px 18px rgba(245,158,11,0.32)", flexShrink: 0,
                }}>☀️</div>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
                        Today's Tasks
                    </h1>
                    <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{todayLabel}</p>
                </div>
            </div>

            {/* ── Progress card ── */}
            {tasks.length > 0 && (
                <div style={{
                    background: "#fff", borderRadius: 22, padding: "22px 28px",
                    marginBottom: 24, boxShadow: "0 2px 20px rgba(139,92,246,0.09)",
                    display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
                }}>
                    {/* Circular progress */}
                    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                        <svg width="72" height="72" viewBox="0 0 72 72">
                            <circle cx="36" cy="36" r="28" fill="none" stroke="#f3f4f6" strokeWidth="7" />
                            <circle
                                cx="36" cy="36" r="28" fill="none"
                                stroke="url(#prog)" strokeWidth="7"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                                transform="rotate(-90 36 36)"
                                style={{ transition: "stroke-dashoffset 0.5s ease" }}
                            />
                            <defs>
                                <linearGradient id="prog" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#7c3aed" />
                                    <stop offset="100%" stopColor="#a78bfa" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, fontWeight: 800, color: "#1e1b4b",
                        }}>{pct}%</div>
                    </div>

                    {/* Bar + stats */}
                    <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b" }}>Daily Progress</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>{done}/{tasks.length} done</span>
                        </div>
                        <div style={{ height: 9, background: "#f3f4f6", borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
                            <div style={{
                                height: "100%", borderRadius: 999,
                                background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
                                width: `${pct}%`, transition: "width 0.5s ease",
                            }} />
                        </div>
                        <div style={{ display: "flex", gap: 20 }}>
                            {[
                                { n: done, label: "Completed", color: "#059669", bg: "#d1fae5" },
                                { n: pending, label: "Remaining", color: "#d97706", bg: "#fef3c7" },
                            ].map(s => (
                                <div key={s.label} style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    background: s.bg, borderRadius: 10, padding: "6px 12px",
                                }}>
                                    <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.n}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Loading ── */}
            {loading && (
                <div style={{ textAlign: "center", padding: "56px 0", color: "#9ca3af" }}>
                    <Spinner /><div>Loading today's tasks…</div>
                </div>
            )}

            {/* ── Empty ── */}
            {!loading && tasks.length === 0 && (
                <div style={{
                    textAlign: "center", padding: "72px 24px",
                    background: "#fff", borderRadius: 22,
                    boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
                }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>🌅</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" }}>
                        Nothing due today!
                    </h3>
                    <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
                        Enjoy your free time or add a task from All Tasks.
                    </p>
                </div>
            )}

            {/* ── Task list ── */}
            {!loading && tasks.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {tasks.map(task => {
                        const p = PRI[task.priority] || PRI.medium;
                        const s = STA[task.status] || STA.todo;
                        return (
                            <div key={task.id} style={{
                                background: "#fff", borderRadius: 18,
                                boxShadow: "0 2px 16px rgba(139,92,246,0.07)",
                                padding: "18px 22px",
                                borderLeft: `4px solid ${p.bar}`,
                                opacity: task.status === "done" ? 0.65 : 1,
                                transition: "box-shadow 0.2s",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{
                                            fontSize: 15, fontWeight: 700, color: "#1e1b4b",
                                            margin: "0 0 4px", lineHeight: 1.35,
                                            textDecoration: task.status === "done" ? "line-through" : "none",
                                        }}>
                                            {task.status === "done" && (
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                    width: 18, height: 18, borderRadius: "50%",
                                                    background: "linear-gradient(135deg,#059669,#34d399)",
                                                    marginRight: 8, flexShrink: 0, verticalAlign: "middle",
                                                }}>
                                                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                                        <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </span>
                                            )}
                                            {task.title}
                                        </h3>
                                        {task.description && (
                                            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 8px", lineHeight: 1.5 }}>
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                                        <Pill cfg={p} />
                                        <Pill cfg={s} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}