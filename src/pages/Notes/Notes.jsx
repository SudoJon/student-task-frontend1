import React from "react";
import { Link } from "react-router-dom";

const colorMap = {
  purple: { bg: "#f5f3ff", border: "#a78bfa", dot: "#7c3aed", header: "#ede9fe" },
  pink:   { bg: "#fce7f3", border: "#f9a8d4", dot: "#db2777", header: "#fce7f3" },
  teal:   { bg: "#ccfbf1", border: "#5eead4", dot: "#0d9488", header: "#ccfbf1" },
  amber:  { bg: "#fef3c7", border: "#fcd34d", dot: "#d97706", header: "#fef9c3" },
  blue:   { bg: "#dbeafe", border: "#93c5fd", dot: "#2563eb", header: "#dbeafe" },
};

function Tasks() {
  const [notes, setNotes] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("bucketlyst_notes") || "[]"); }
    catch { return []; }
  });
  const [search, setSearch]           = React.useState("");
  const [activeId, setActiveId]       = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  function save(updated) {
    setNotes(updated);
    localStorage.setItem("bucketlyst_notes", JSON.stringify(updated));
  }

  function handleDelete(id) {
    save(notes.filter(n => n.id !== id));
    if (activeId === id) setActiveId(null);
    setConfirmDelete(null);
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: 28,
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, boxShadow: "0 6px 18px rgba(124,58,237,0.3)", flexShrink: 0,
          }}>📝</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
              All Notes
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
              {notes.length} note{notes.length !== 1 ? "s" : ""} saved locally
            </p>
          </div>
        </div>

        <Link to="/notes/new" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 22px", borderRadius: 13,
          background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
          color: "#fff", fontSize: 14, fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
          transition: "box-shadow 0.2s",
        }}>
          ➕ New Note
        </Link>
      </div>

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <span style={{
          position: "absolute", left: 15, top: "50%",
          transform: "translateY(-50%)", fontSize: 16, color: "#9ca3af",
          pointerEvents: "none",
        }}>🔍</span>
        <input
          placeholder="Search notes by title or content…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px 12px 44px",
            borderRadius: 14, border: "1.5px solid #e5e7eb",
            background: "#fafafa", fontSize: 14, color: "#1e1b4b",
            outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#a78bfa"}
          onBlur={e  => e.target.style.borderColor = "#e5e7eb"}
        />
      </div>

      {/* ── Empty state ── */}
      {notes.length === 0 && (
        <div style={{
          textAlign: "center", padding: "72px 24px",
          background: "#fff", borderRadius: 22,
          boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📓</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px" }}>
            No notes yet
          </h3>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 24px" }}>
            Create your first note to get started.
          </p>
          <Link to="/notes/new" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 13,
            background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
            color: "#fff", fontSize: 14, fontWeight: 700,
            textDecoration: "none",
          }}>
            ➕ Create Note
          </Link>
        </div>
      )}

      {/* ── No search results ── */}
      {notes.length > 0 && filtered.length === 0 && (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: "#fff", borderRadius: 22,
          boxShadow: "0 2px 16px rgba(139,92,246,0.07)",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
            No notes match <strong>"{search}"</strong>
          </p>
        </div>
      )}

      {/* ── Notes grid ── */}
      {filtered.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))",
          gap: 16,
        }}>
          {filtered.map(note => {
            const c       = colorMap[note.color] || colorMap.purple;
            const isOpen  = activeId === note.id;
            return (
              <div
                key={note.id}
                onClick={() => setActiveId(isOpen ? null : note.id)}
                style={{
                  background: c.bg,
                  borderRadius: 20,
                  border: `2px solid ${isOpen ? c.dot : c.border}`,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: isOpen
                    ? `0 8px 28px ${c.dot}2e`
                    : "0 2px 12px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
              >
                {/* Card header strip */}
                <div style={{
                  background: c.header, padding: "14px 18px 10px",
                  borderBottom: `1px solid ${c.border}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: c.dot, flexShrink: 0,
                    }} />
                    <h3 style={{
                      fontSize: 14, fontWeight: 800, color: "#1e1b4b",
                      margin: 0, lineHeight: 1.3,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      maxWidth: 160,
                    }}>
                      {note.title || "Untitled"}
                    </h3>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDelete(note.id); }}
                    style={{
                      background: "transparent", border: "none",
                      color: "#9ca3af", cursor: "pointer", fontSize: 15,
                      padding: "2px 4px", borderRadius: 6,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#dc2626"}
                    onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
                  >
                    🗑
                  </button>
                </div>

                {/* Body preview */}
                <div style={{ padding: "12px 18px 14px" }}>
                  <p style={{
                    fontSize: 13, color: "#6b7280", margin: "0 0 10px",
                    lineHeight: 1.55,
                    display: "-webkit-box", WebkitLineClamp: isOpen ? 999 : 3,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                    whiteSpace: isOpen ? "pre-wrap" : "normal",
                  }}>
                    {note.body || "No content"}
                  </p>

                  {/* Expanded full body */}
                  {isOpen && note.body && (
                    <div style={{
                      marginTop: 10, paddingTop: 10,
                      borderTop: `1px solid ${c.border}`,
                      fontSize: 14, color: "#374151", lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}>
                      {note.body}
                    </div>
                  )}

                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginTop: 10,
                  }}>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{note.date || ""}</span>
                    <span style={{ fontSize: 11, color: c.dot, fontWeight: 700 }}>
                      {isOpen ? "▲ Collapse" : "▼ Expand"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(30,27,75,0.35)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999,
        }}>
          <div style={{
            background: "#fff", borderRadius: 22, padding: "32px 36px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
            textAlign: "center", maxWidth: 360, width: "90%",
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🗑️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", margin: "0 0 8px" }}>
              Delete this note?
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 12,
                  border: "1.5px solid #e5e7eb", background: "#f9fafb",
                  color: "#374151", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#dc2626,#f87171)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 3px 12px rgba(220,38,38,0.28)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
