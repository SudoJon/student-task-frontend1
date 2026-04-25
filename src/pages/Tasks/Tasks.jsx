import { useEffect, useState } from "react";
import { getTasks, deleteTask, updateTask } from "../../api/tasks";
import AddTaskForm from "../../components/AddTaskForm";

/* ── inline design tokens ── */
const colors = {
  pageBg: "transparent",
  cardBg: "#ffffff",
  cardShadow: "0 2px 16px rgba(139, 92, 246, 0.08), 0 1px 4px rgba(0,0,0,0.04)",
  cardShadowHover: "0 8px 32px rgba(139, 92, 246, 0.14), 0 2px 8px rgba(0,0,0,0.06)",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  purpleMid: "#a78bfa",
  pink: "#ec4899",
  pinkLight: "#fce7f3",
  teal: "#0d9488",
  tealLight: "#ccfbf1",
  amber: "#d97706",
  amberLight: "#fef3c7",
  green: "#059669",
  greenLight: "#d1fae5",
  red: "#dc2626",
  redLight: "#fee2e2",
  textPrimary: "#1e1b4b",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#f3f4f6",
  inputBg: "#fafafa",
  inputBorder: "#e5e7eb",
  inputBorderFocus: "#a78bfa",
};

const priorityConfig = {
  high:   { label: "High",   bg: colors.redLight,   color: colors.red,   dot: "#ef4444" },
  medium: { label: "Medium", bg: colors.amberLight,  color: colors.amber, dot: "#f59e0b" },
  low:    { label: "Low",    bg: colors.greenLight,  color: colors.green, dot: "#10b981" },
};

const statusConfig = {
  todo:        { label: "To Do",       bg: "#f3f4f6",       color: "#374151" },
  in_progress: { label: "In Progress", bg: "#dbeafe",       color: "#1d4ed8" },
  done:        { label: "Completed",   bg: colors.greenLight, color: colors.green },
};

/* ── small reusable badge ── */
function Badge({ cfg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600, letterSpacing: 0.2,
    }}>
      {cfg.dot && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      )}
      {cfg.label}
    </span>
  );
}

/* ── stat card ── */
function StatCard({ icon, label, value, bg, color, shadow }) {
  return (
    <div style={{
      background: bg,
      borderRadius: 18,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: shadow || "0 2px 12px rgba(0,0,0,0.06)",
      flex: "1 1 0",
      minWidth: 0,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(255,255,255,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color, opacity: 0.75, marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editStatus, setEditStatus] = useState("todo");
  const [editDueDate, setEditDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    await deleteTask(id);
    loadTasks();
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditDueDate(task.due_date);
  }

  async function saveEdit(id, forcedStatus = null) {
    await updateTask(id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      status: forcedStatus || editStatus,
      due_date: editDueDate
    });
    setEditingId(null);
    loadTasks();
  }

  /* derived stats */
  const total      = tasks.length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending    = tasks.filter(t => t.status === "todo").length;
  const completed  = tasks.filter(t => t.status === "done").length;

  /* ── shared input style ── */
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${colors.inputBorder}`,
    background: colors.inputBg, fontSize: 14,
    color: colors.textPrimary, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.18s",
  };

  const selectStyle = { ...inputStyle, cursor: "pointer" };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700,
          color: colors.textPrimary, margin: 0, letterSpacing: -0.5,
        }}>
          All Tasks
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: 14, margin: "6px 0 0 0" }}>
          Manage and track all your tasks in one place
        </p>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard
          icon="📋" label="Total Tasks" value={total}
          bg="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
          color="#ffffff"
          shadow="0 4px 16px rgba(124,58,237,0.28)"
        />
        <StatCard
          icon="⚡" label="In Progress" value={inProgress}
          bg="linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)"
          color="#ffffff"
          shadow="0 4px 16px rgba(8,145,178,0.28)"
        />
        <StatCard
          icon="⏳" label="Pending" value={pending}
          bg="linear-gradient(135deg, #d97706 0%, #fbbf24 100%)"
          color="#ffffff"
          shadow="0 4px 16px rgba(217,119,6,0.28)"
        />
        <StatCard
          icon="✅" label="Completed" value={completed}
          bg="linear-gradient(135deg, #059669 0%, #34d399 100%)"
          color="#ffffff"
          shadow="0 4px 16px rgba(5,150,105,0.28)"
        />
      </div>

      {/* ── Add Task Form card ── */}
      <div style={{
        background: colors.cardBg, borderRadius: 20,
        padding: "24px 28px", marginBottom: 28,
        boxShadow: colors.cardShadow,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: "0 0 16px 0" }}>
          ➕ Add New Task
        </h2>
        <AddTaskForm onCreated={loadTasks} />
      </div>

      {/* ── Status / loading ── */}
      {loading && (
        <div style={{
          textAlign: "center", padding: "48px 0",
          color: colors.textSecondary, fontSize: 15,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #ede9fe", borderTopColor: colors.purple,
            animation: "tasks-spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          Loading your tasks…
        </div>
      )}

      {error && (
        <div style={{
          background: colors.redLight, color: colors.red,
          borderRadius: 12, padding: "12px 16px",
          fontSize: 14, marginBottom: 20,
          border: `1px solid #fecaca`,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && tasks.length === 0 && (
        <div style={{
          textAlign: "center", padding: "64px 24px",
          background: colors.cardBg, borderRadius: 20,
          boxShadow: colors.cardShadow,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.textPrimary, margin: "0 0 8px" }}>
            No tasks yet
          </h3>
          <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>
            Add your first task above to get started!
          </p>
        </div>
      )}

      {/* ── Task cards ── */}
      {!loading && tasks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tasks.map(task => {
            const priCfg = priorityConfig[task.priority] || priorityConfig.medium;
            const staCfg = statusConfig[task.status] || statusConfig.todo;

            return (
              <div
                key={task.id}
                style={{
                  background: colors.cardBg, borderRadius: 18,
                  boxShadow: editingId === task.id ? colors.cardShadowHover : colors.cardShadow,
                  border: editingId === task.id ? `2px solid ${colors.purpleMid}` : "2px solid transparent",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  overflow: "hidden",
                }}
              >
                {editingId === task.id ? (
                  /* ── EDIT MODE ── */
                  <div style={{ padding: "24px 28px" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.purple, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 0.8 }}>
                      ✏️ Editing Task
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Title</label>
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          placeholder="Task title"
                          style={inputStyle}
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                          placeholder="Task description"
                          rows={3}
                          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Priority</label>
                        <select value={editPriority} onChange={e => setEditPriority(e.target.value)} style={selectStyle}>
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Status</label>
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={selectStyle}>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Due Date</label>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={e => setEditDueDate(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <button
                        onClick={() => saveEdit(task.id)}
                        style={btnPrimary}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={btnGhost}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── READ MODE ── */
                  <div style={{ padding: "20px 24px" }}>
                    {/* Top row: title + badges */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: 16, fontWeight: 700,
                          color: task.status === "done" ? colors.textMuted : colors.textPrimary,
                          margin: 0, lineHeight: 1.3,
                          textDecoration: task.status === "done" ? "line-through" : "none",
                        }}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p style={{
                            fontSize: 13, color: colors.textSecondary,
                            margin: "5px 0 0", lineHeight: 1.5,
                          }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                        <Badge cfg={priCfg} />
                        <Badge cfg={staCfg} />
                      </div>
                    </div>

                    {/* Due date */}
                    {task.due_date && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 12, color: colors.textSecondary,
                        background: "#f9fafb", borderRadius: 8,
                        padding: "4px 10px", marginBottom: 14,
                        border: "1px solid #f3f4f6",
                      }}>
                        📅 Due {task.due_date}
                      </div>
                    )}
                    {!task.due_date && (
                      <div style={{ marginBottom: 14 }} />
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => startEdit(task)} style={btnOutline}>
                        ✏️ Edit
                      </button>
                      {task.status !== "done" && (
                        <button onClick={() => saveEdit(task.id, "done")} style={btnSuccess}>
                          ✅ Mark Completed
                        </button>
                      )}
                      <button onClick={() => handleDelete(task.id)} style={btnDanger}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* spinner keyframes */}
      <style>{`
        @keyframes tasks-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ── shared button / label styles ── */
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#6b7280", marginBottom: 6, letterSpacing: 0.3,
};

const btnBase = {
  padding: "9px 18px", borderRadius: 10, fontSize: 13,
  fontWeight: 600, cursor: "pointer", border: "none",
  transition: "opacity 0.15s, transform 0.1s",
  fontFamily: "inherit", letterSpacing: 0.2,
};

const btnPrimary = {
  ...btnBase,
  background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
  color: "#ffffff",
  boxShadow: "0 3px 10px rgba(124,58,237,0.28)",
};

const btnGhost = {
  ...btnBase,
  background: "#f3f4f6",
  color: "#374151",
};

const btnOutline = {
  ...btnBase,
  background: "#f5f3ff",
  color: "#6d28d9",
  border: "1.5px solid #ede9fe",
};

const btnSuccess = {
  ...btnBase,
  background: "#d1fae5",
  color: "#065f46",
  border: "1.5px solid #a7f3d0",
};

const btnDanger = {
  ...btnBase,
  background: "#fee2e2",
  color: "#991b1b",
  border: "1.5px solid #fecaca",
};

export default Tasks;
