import { useEffect, useState } from "react";
import { getTasks } from "../../api/tasks";

const STA = {
  todo:        { label: "To Do",       bg: "#f3f4f6", color: "#374151" },
  in_progress: { label: "In Progress", bg: "#dbeafe", color: "#1d4ed8" },
  done:        { label: "Done",        bg: "#d1fae5", color: "#059669" },
};

function StatusPill({ status }) {
  const cfg = STA[status] || STA.todo;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 11px", borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>{cfg.label}</span>
  );
}

export default function HighPriority() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const data = await getTasks();
    setTasks(data.filter(t => t.priority === "high"));
    setLoading(false);
  }

  const done    = tasks.filter(t => t.status === "done").length;
  const active  = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "todo").length;

  const STATS = [
    { label: "High Priority", value: tasks.length, bg: "linear-gradient(135deg,#dc2626,#f87171)", shadow: "rgba(220,38,38,0.28)" },
    { label: "In Progress",   value: active,        bg: "linear-gradient(135deg,#0891b2,#22d3ee)", shadow: "rgba(8,145,178,0.28)" },
    { label: "Pending",       value: pending,       bg: "linear-gradient(135deg,#d97706,#fbbf24)", shadow: "rgba(217,119,6,0.28)" },
    { label: "Completed",     value: done,          bg: "linear-gradient(135deg,#059669,#34d399)", shadow: "rgba(5,150,105,0.28)" },
  ];

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg,#dc2626,#f87171)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: "0 6px 18px rgba(220,38,38,0.32)", flexShrink: 0,
        }}>🔥</div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
            High Priority
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
            Tasks that need your immediate attention
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {tasks.length > 0 && (
        <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 18, padding: "18px 22px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: `0 4px 16px ${s.shadow}`, flex: "1 1 120px",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 700, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "56px 0", color: "#9ca3af" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "3px solid #fee2e2", borderTopColor: "#dc2626",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          Loading high priority tasks…
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && tasks.length === 0 && (
        <div style={{
          textAlign: "center", padding: "72px 24px",
          background: "#fff", borderRadius: 22,
          boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" }}>
            No high priority tasks!
          </h3>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            Great job staying on top of things. Keep it up!
          </p>
        </div>
      )}

      {/* ── Task cards ── */}
      {!loading && tasks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tasks.map((task, idx) => (
            <div key={task.id} style={{
              background: "#fff", borderRadius: 18,
              boxShadow: "0 2px 16px rgba(220,38,38,0.07)",
              padding: "18px 22px",
              borderLeft: "4px solid #ef4444",
              opacity: task.status === "done" ? 0.6 : 1,
              transition: "box-shadow 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Urgency badge + title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 7,
                      background: task.status === "done"
                        ? "linear-gradient(135deg,#059669,#34d399)"
                        : "linear-gradient(135deg,#dc2626,#f87171)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}>
                      {task.status === "done" ? "✓" : idx + 1}
                    </div>
                    <h3 style={{
                      fontSize: 15, fontWeight: 700, color: "#1e1b4b",
                      margin: 0, lineHeight: 1.35,
                      textDecoration: task.status === "done" ? "line-through" : "none",
                    }}>
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5, paddingLeft: 34 }}>
                      {task.description}
                    </p>
                  )}

                  {task.due_date && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 12, color: "#6b7280",
                      background: "#f9fafb", borderRadius: 8,
                      padding: "3px 10px", border: "1px solid #f3f4f6",
                      marginLeft: 34,
                    }}>
                      📅 Due {task.due_date}
                    </span>
                  )}
                </div>
                <StatusPill status={task.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
