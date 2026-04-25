import { useEffect, useState } from "react";
import { getTasks } from "../../api/tasks";

const PRI = {
  high:   { label: "High",   bg: "#fee2e2", color: "#dc2626", bar: "#ef4444" },
  medium: { label: "Medium", bg: "#fef3c7", color: "#d97706", bar: "#f59e0b" },
  low:    { label: "Low",    bg: "#d1fae5", color: "#059669", bar: "#10b981" },
};
const STA = {
  todo:        { label: "To Do",       bg: "#f3f4f6", color: "#374151" },
  in_progress: { label: "In Progress", bg: "#dbeafe", color: "#1d4ed8" },
  done:        { label: "Done",        bg: "#d1fae5", color: "#059669" },
};

function Pill({ cfg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 11px", borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {cfg.bar && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.bar, display: "inline-block" }} />}
      {cfg.label}
    </span>
  );
}

function groupByDate(tasks) {
  const groups = {};
  tasks.forEach(t => {
    const key = t.due_date || "No Date";
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function formatDateLabel(dateStr) {
  if (dateStr === "No Date") return "No Date";
  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (dateStr === today)    return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });
}

export default function ThisWeek() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const data     = await getTasks();
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const weekEnd  = new Date(today); weekEnd.setDate(today.getDate() + 7);
    setTasks(data.filter(t => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date + "T00:00:00");
      return d >= today && d <= weekEnd;
    }));
    setLoading(false);
  }

  const groups = groupByDate(tasks);
  const done   = tasks.filter(t => t.status === "done").length;
  const todayStr = new Date().toISOString().split("T")[0];

  const weekRange = (() => {
    const s = new Date(), e = new Date();
    e.setDate(s.getDate() + 7);
    const f = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${f(s)} – ${f(e)}`;
  })();

  const STATS = [
    { label: "This Week",  value: tasks.length,         bg: "linear-gradient(135deg,#6366f1,#a78bfa)", shadow: "rgba(99,102,241,0.28)" },
    { label: "Completed",  value: done,                  bg: "linear-gradient(135deg,#059669,#34d399)", shadow: "rgba(5,150,105,0.28)" },
    { label: "Remaining",  value: tasks.length - done,   bg: "linear-gradient(135deg,#d97706,#fbbf24)", shadow: "rgba(217,119,6,0.28)" },
  ];

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg,#0891b2,#22d3ee)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: "0 6px 18px rgba(8,145,178,0.32)", flexShrink: 0,
        }}>📅</div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
            This Week
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{weekRange}</p>
        </div>
      </div>

      {/* ── Stats ── */}
      {tasks.length > 0 && (
        <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 18, padding: "16px 22px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: `0 4px 16px ${s.shadow}`, flex: "1 1 100px",
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "56px 0", color: "#9ca3af" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "3px solid #ede9fe", borderTopColor: "#7c3aed",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          Loading this week's tasks…
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && tasks.length === 0 && (
        <div style={{
          textAlign: "center", padding: "72px 24px",
          background: "#fff", borderRadius: 22,
          boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🗓️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" }}>
            Clear week ahead!
          </h3>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            No tasks due in the next 7 days. Add some from All Tasks.
          </p>
        </div>
      )}

      {/* ── Grouped list ── */}
      {!loading && groups.map(([date, dayTasks]) => {
        const isToday = date === todayStr;
        return (
          <div key={date} style={{ marginBottom: 28 }}>
            {/* Day header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                padding: "5px 16px", borderRadius: 999,
                background: isToday ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "#f3f4f6",
                color: isToday ? "#fff" : "#374151",
                fontSize: 13, fontWeight: 800,
                boxShadow: isToday ? "0 3px 10px rgba(124,58,237,0.25)" : "none",
              }}>
                {formatDateLabel(date)}
              </div>
              <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
              <span style={{
                fontSize: 11, color: "#9ca3af", fontWeight: 700,
                background: "#f9fafb", padding: "3px 10px", borderRadius: 999,
              }}>
                {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dayTasks.map(task => {
                const p = PRI[task.priority] || PRI.medium;
                const s = STA[task.status]   || STA.todo;
                return (
                  <div key={task.id} style={{
                    background: "#fff", borderRadius: 16,
                    boxShadow: "0 2px 12px rgba(139,92,246,0.07)",
                    padding: "16px 20px",
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
                          {task.title}
                        </h3>
                        {task.description && (
                          <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
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
          </div>
        );
      })}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
