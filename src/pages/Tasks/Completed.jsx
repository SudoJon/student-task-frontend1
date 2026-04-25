import { useEffect, useState } from "react";
import { getTasks } from "../../api/tasks";

const PRI = {
  high:   { label: "High",   bg: "#fee2e2", color: "#dc2626", bar: "#ef4444" },
  medium: { label: "Medium", bg: "#fef3c7", color: "#d97706", bar: "#f59e0b" },
  low:    { label: "Low",    bg: "#d1fae5", color: "#059669", bar: "#10b981" },
};

function PriorityPill({ priority }) {
  const cfg = PRI[priority] || PRI.medium;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 11px", borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.bar, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

export default function Completed() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const data = await getTasks();
    setTasks(data.filter(t => t.status === "done"));
    setLoading(false);
  }

  const sorted = [...tasks].sort((a, b) =>
    (b.due_date || "").localeCompare(a.due_date || "")
  );

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg,#059669,#34d399)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: "0 6px 18px rgba(5,150,105,0.32)", flexShrink: 0,
        }}>✅</div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
            Completed Tasks
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
            Your accomplishments — great work!
          </p>
        </div>
      </div>

      {/* ── Achievement banner ── */}
      {tasks.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg,#059669,#34d399)",
          borderRadius: 22, padding: "22px 28px", marginBottom: 28,
          boxShadow: "0 6px 24px rgba(5,150,105,0.28)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.75)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>
              🏆 Achievement Unlocked
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {tasks.length} Task{tasks.length !== 1 ? "s" : ""} Completed
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>
              Keep up the momentum!
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.18)",
            borderRadius: 18, padding: "16px 24px",
            textAlign: "center", backdropFilter: "blur(4px)",
          }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>100%</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 700, marginTop: 4 }}>
              Completion Rate
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "56px 0", color: "#9ca3af" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "3px solid #d1fae5", borderTopColor: "#059669",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          Loading completed tasks…
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && tasks.length === 0 && (
        <div style={{
          textAlign: "center", padding: "72px 24px",
          background: "#fff", borderRadius: 22,
          boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" }}>
            No completed tasks yet
          </h3>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            Complete tasks from All Tasks and they'll appear here.
          </p>
        </div>
      )}

      {/* ── Completed list ── */}
      {!loading && sorted.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map(task => (
            <div key={task.id} style={{
              background: "#fff", borderRadius: 18,
              boxShadow: "0 2px 12px rgba(5,150,105,0.07)",
              padding: "18px 22px",
              borderLeft: "4px solid #10b981",
              opacity: 0.85,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    {/* Green checkmark circle */}
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "linear-gradient(135deg,#059669,#34d399)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 style={{
                      fontSize: 15, fontWeight: 700, color: "#374151",
                      margin: 0, lineHeight: 1.35,
                      textDecoration: "line-through",
                    }}>
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 8px", lineHeight: 1.5, paddingLeft: 32 }}>
                      {task.description}
                    </p>
                  )}

                  {task.due_date && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 12, color: "#9ca3af",
                      background: "#f9fafb", borderRadius: 8,
                      padding: "3px 10px", border: "1px solid #f3f4f6",
                      marginLeft: 32,
                    }}>
                      📅 {task.due_date}
                    </span>
                  )}
                </div>
                <PriorityPill priority={task.priority} />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
