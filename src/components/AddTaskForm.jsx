import { useState } from "react";
import { createTask } from "../api/tasks";

function AddTaskForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    await createTask({
      title,
      description,
      priority,
      due_date: dueDate,
      status: "todo"
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");

    onCreated();
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#fafafa", fontSize: 14,
    color: "#1e1b4b", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.18s",
  };

  const selectStyle = { ...inputStyle, cursor: "pointer" };

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#6b7280", marginBottom: 6, letterSpacing: 0.3,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}>
        {/* Title — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Task Title *</label>
          <input
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Description — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Description</label>
          <input
            placeholder="Add a short description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Priority */}
        <div>
          <label style={labelStyle}>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        {/* Due date */}
        <div>
          <label style={labelStyle}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Submit — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <button
            type="submit"
            style={{
              width: "100%", padding: "12px",
              borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
              color: "#ffffff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", letterSpacing: 0.3,
              boxShadow: "0 3px 12px rgba(124,58,237,0.28)",
              fontFamily: "inherit",
              transition: "opacity 0.15s, transform 0.1s",
            }}
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddTaskForm;
