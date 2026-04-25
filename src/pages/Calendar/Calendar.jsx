import { useState, useEffect } from "react";
import { getTasks } from "../../api/tasks";

/* ─── Constants ─────────────────────────────────────────── */
const DAYS    = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const PRI_COLOR = {
  high:   { bar: "#ef4444", bg: "#fee2e2", text: "#dc2626" },
  medium: { bar: "#f59e0b", bg: "#fef3c7", text: "#d97706" },
  low:    { bar: "#10b981", bg: "#d1fae5", text: "#059669" },
};
const STA_COLOR = {
  todo:        { bg: "#f3f4f6", text: "#374151" },
  in_progress: { bg: "#dbeafe", text: "#1d4ed8" },
  done:        { bg: "#d1fae5", text: "#059669" },
};

/* ─── Helpers ────────────────────────────────────────────── */
function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* ─── Component ─────────────────────────────────────────── */
export default function Calendar() {
  const todayObj  = new Date();
  const todayStr  = todayObj.toISOString().split("T")[0];

  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [viewDate, setViewDate]   = useState({ year: todayObj.getFullYear(), month: todayObj.getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  }

  /* Group tasks by due_date */
  const tasksByDate = {};
  tasks.forEach(t => {
    if (!t.due_date) return;
    if (!tasksByDate[t.due_date]) tasksByDate[t.due_date] = [];
    tasksByDate[t.due_date].push(t);
  });

  const { year, month } = viewDate;
  const grid = buildMonthGrid(year, month);

  function prevMonth() {
    setViewDate(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 });
    setSelectedDay(null);
  }
  function nextMonth() {
    setViewDate(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 });
    setSelectedDay(null);
  }
  function goToday() {
    setViewDate({ year: todayObj.getFullYear(), month: todayObj.getMonth() });
    setSelectedDay(todayObj.getDate());
  }

  const selectedDateStr = selectedDay ? toDateStr(year, month, selectedDay) : null;
  const selectedTasks   = selectedDateStr ? (tasksByDate[selectedDateStr] || []) : [];

  /* Month stats */
  const monthTasks = Object.entries(tasksByDate)
    .filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
    .flatMap(([, ts]) => ts);
  const monthDone    = monthTasks.filter(t => t.status === "done").length;
  const monthPending = monthTasks.filter(t => t.status !== "done").length;

  const STATS = [
    { label: "This Month",  value: monthTasks.length,  bg: "linear-gradient(135deg,#7c3aed,#a78bfa)", shadow: "rgba(124,58,237,0.25)" },
    { label: "Completed",   value: monthDone,           bg: "linear-gradient(135deg,#059669,#34d399)", shadow: "rgba(5,150,105,0.25)"  },
    { label: "Pending",     value: monthPending,        bg: "linear-gradient(135deg,#d97706,#fbbf24)", shadow: "rgba(217,119,6,0.25)"  },
  ];

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg,#0891b2,#22d3ee)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: "0 6px 18px rgba(8,145,178,0.3)", flexShrink: 0,
        }}>📆</div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
            Calendar
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
            {MONTHS[month]} {year}
          </p>
        </div>
      </div>

      {/* ── Month stats ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
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

      {/* ── Main layout: calendar + side panel ── */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── Calendar card ── */}
        <div style={{
          flex: "1 1 520px",
          background: "#fff", borderRadius: 24,
          boxShadow: "0 2px 20px rgba(139,92,246,0.09)",
          overflow: "hidden",
        }}>
          {/* Month navigation */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid #f3f4f6",
          }}>
            <button
              onClick={prevMonth}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e5e7eb",
                background: "#f9fafb", cursor: "pointer", fontSize: 16, color: "#374151",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >‹</button>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b" }}>
                {MONTHS[month]} {year}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={goToday}
                style={{
                  padding: "7px 14px", borderRadius: 10,
                  border: "1.5px solid #ede9fe", background: "#f5f3ff",
                  color: "#7c3aed", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e5e7eb",
                  background: "#f9fafb", cursor: "pointer", fontSize: 16, color: "#374151",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >›</button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(7,1fr)",
            padding: "10px 14px 4px",
          }}>
            {DAYS.map(d => (
              <div key={d} style={{
                textAlign: "center", fontSize: 11, fontWeight: 800,
                color: "#9ca3af", letterSpacing: 0.5, padding: "4px 0",
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "3px solid #ede9fe", borderTopColor: "#7c3aed",
                animation: "spin 0.8s linear infinite", margin: "0 auto 10px",
              }} />
              Loading tasks…
            </div>
          )}

          {/* Calendar grid */}
          {!loading && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7,1fr)",
              padding: "0 14px 14px", gap: 4,
            }}>
              {grid.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;

                const dateStr  = toDateStr(year, month, day);
                const isToday  = dateStr === todayStr;
                const isSel    = selectedDay === day;
                const dayTasks = tasksByDate[dateStr] || [];
                const hasTasks = dayTasks.length > 0;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDay(isSel ? null : day)}
                    style={{
                      minHeight: 68, borderRadius: 12, padding: "8px 6px 6px",
                      cursor: "pointer",
                      background: isSel
                        ? "linear-gradient(135deg,#7c3aed,#a78bfa)"
                        : isToday
                          ? "#f5f3ff"
                          : "transparent",
                      border: isToday && !isSel ? "1.5px solid #a78bfa" : "1.5px solid transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isToday ? "#f5f3ff" : "transparent"; }}
                  >
                    {/* Day number */}
                    <div style={{
                      fontSize: 13, fontWeight: isToday || isSel ? 800 : 600,
                      color: isSel ? "#fff" : isToday ? "#7c3aed" : "#374151",
                      textAlign: "center", marginBottom: 4,
                    }}>
                      {day}
                    </div>

                    {/* Task dots */}
                    {hasTasks && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                        {dayTasks.slice(0, 4).map(t => {
                          const pc = PRI_COLOR[t.priority] || PRI_COLOR.medium;
                          return (
                            <div key={t.id} style={{
                              width: "100%", height: 4, borderRadius: 2,
                              background: isSel ? "rgba(255,255,255,0.6)" : pc.bar,
                              maxWidth: 28,
                            }} />
                          );
                        })}
                        {dayTasks.length > 4 && (
                          <div style={{
                            fontSize: 9, fontWeight: 800,
                            color: isSel ? "rgba(255,255,255,0.8)" : "#9ca3af",
                          }}>
                            +{dayTasks.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div style={{
            padding: "12px 22px 16px",
            borderTop: "1px solid #f3f4f6",
            display: "flex", gap: 16, flexWrap: "wrap",
          }}>
            {Object.entries(PRI_COLOR).map(([key, c]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 4, borderRadius: 2, background: c.bar }} />
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "capitalize" }}>
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Side panel ── */}
        <div style={{
          flex: "0 0 280px", minWidth: 240,
          background: "#fff", borderRadius: 24,
          boxShadow: "0 2px 20px rgba(139,92,246,0.09)",
          overflow: "hidden",
        }}>
          {/* Panel header */}
          <div style={{
            padding: "18px 22px",
            borderBottom: "1px solid #f3f4f6",
            background: selectedDay ? "linear-gradient(135deg,#f5f3ff,#fce7f3)" : "#fafafa",
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              {selectedDay ? "Selected Day" : "Click a Day"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b" }}>
              {selectedDay
                ? new Date(toDateStr(year, month, selectedDay) + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                : "No day selected"}
            </div>
            {selectedDay && (
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""} due
              </div>
            )}
          </div>

          {/* Task list */}
          <div style={{ padding: "14px 16px", maxHeight: 480, overflowY: "auto" }}>
            {!selectedDay && (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#9ca3af" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>👆</div>
                <div style={{ fontSize: 13 }}>Select a day to see its tasks</div>
              </div>
            )}

            {selectedDay && selectedTasks.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#9ca3af" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🌿</div>
                <div style={{ fontSize: 13 }}>No tasks on this day</div>
              </div>
            )}

            {selectedTasks.map(task => {
              const pc = PRI_COLOR[task.priority] || PRI_COLOR.medium;
              const sc = STA_COLOR[task.status]   || STA_COLOR.todo;
              return (
                <div key={task.id} style={{
                  background: "#fafafa", borderRadius: 14,
                  padding: "12px 14px", marginBottom: 10,
                  borderLeft: `3px solid ${pc.bar}`,
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: "#1e1b4b",
                    marginBottom: 6, lineHeight: 1.35,
                    textDecoration: task.status === "done" ? "line-through" : "none",
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "2px 9px", borderRadius: 999,
                      background: pc.bg, color: pc.text,
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {task.priority}
                    </span>
                    <span style={{
                      padding: "2px 9px", borderRadius: 999,
                      background: sc.bg, color: sc.text,
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {task.status?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
