import { useState, useRef, useEffect } from "react";

/* ─── Model & prompt config (unchanged) ─────────────────── */
const AI_MODELS = [
  { id: "gpt-4o",           label: "GPT-4o",           provider: "OpenAI",    icon: "🤖", color: "#10a37f", desc: "Most capable, great for complex tasks"    },
  { id: "gpt-4o-mini",      label: "GPT-4o Mini",      provider: "OpenAI",    icon: "⚡", color: "#10a37f", desc: "Fast and efficient for everyday tasks"     },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "Google",    icon: "✨", color: "#4285f4", desc: "Google's fastest multimodal model"          },
  { id: "claude-3-haiku",   label: "Claude 3 Haiku",   provider: "Anthropic", icon: "🌿", color: "#d97706", desc: "Thoughtful, nuanced responses"              },
];

const QUICK_PROMPTS = [
  { label: "📋 Summarize tasks",  text: "Can you help me summarize and prioritize my current tasks?" },
  { label: "📅 Study schedule",   text: "Help me create an effective study schedule for the week."   },
  { label: "✍️ Essay outline",    text: "Help me create an outline for an essay."                    },
  { label: "💡 Explain concept",  text: "Can you explain a difficult concept in simple terms?"       },
  { label: "⚡ Productivity tips", text: "Give me 5 productivity tips for students."                 },
  { label: "🍅 Pomodoro plan",    text: "Create a Pomodoro study plan for a 3-hour study session."  },
];

/* ─── Component (export name preserved as Tasks) ────────── */
function Tasks() {
  const [messages, setMessages]           = useState([{
    id: 1, role: "assistant",
    content: "Hi! I'm your AI study assistant. I can help you with tasks, notes, study plans, and more. What would you like to work on today?",
    model: "gpt-4o",
  }]);
  const [input, setInput]                 = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [loading, setLoading]             = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [editText, setEditText]           = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const activeModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── API call (unchanged logic) ── */
  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText) return;

    const userMsg = { id: Date.now(), role: "user", content: userText, model: selectedModel };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const apiKey  = process.env.REACT_APP_OPENAI_API_KEY || "";
      const history = updated.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel.startsWith("gpt") ? selectedModel : "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful AI study assistant for students. Be concise, friendly, and practical." },
            ...history,
          ],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data  = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: reply, model: selectedModel }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant",
        content: "⚠️ Could not connect to the AI. Please check your API key in `.env` (`REACT_APP_OPENAI_API_KEY`).",
        model: selectedModel,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(msg)  { setEditingId(msg.id); setEditText(msg.content); }
  function saveEdit(id)    { setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editText } : m)); setEditingId(null); }
  function deleteMessage(id) { setMessages(prev => prev.filter(m => m.id !== id)); }
  function clearChat()     {
    setMessages([{ id: Date.now(), role: "assistant", content: "Chat cleared! How can I help you?", model: selectedModel }]);
  }
  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div style={{
      fontFamily: "'Inter',-apple-system,sans-serif",
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 80px)",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 18,
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, boxShadow: "0 6px 18px rgba(124,58,237,0.3)", flexShrink: 0,
          }}>🤖</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
              AI Assistant
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
              Powered by {activeModel.provider} · {activeModel.label}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Model picker */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowModelPicker(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 16px", borderRadius: 12,
                border: "1.5px solid #ede9fe", background: "#f5f3ff",
                color: "#6d28d9", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <span>{activeModel.icon}</span>
              {activeModel.label}
              <span style={{ fontSize: 9, opacity: 0.7 }}>▼</span>
            </button>

            {showModelPicker && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "#fff", borderRadius: 18,
                boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                border: "1px solid #f3f4f6", zIndex: 200,
                minWidth: 290, overflow: "hidden",
              }}>
                <div style={{ padding: "12px 16px 8px", fontSize: 11, fontWeight: 800, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase" }}>
                  Choose Model
                </div>
                {AI_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      width: "100%", padding: "10px 16px",
                      background: selectedModel === m.id ? "#f5f3ff" : "transparent",
                      border: "none", cursor: "pointer", textAlign: "left",
                      fontFamily: "inherit", borderBottom: "1px solid #f9fafb",
                    }}
                  >
                    <span style={{ fontSize: 20, marginTop: 2, flexShrink: 0 }}>{m.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b" }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{m.provider} · {m.desc}</div>
                    </div>
                    {selectedModel === m.id && (
                      <span style={{ color: "#7c3aed", fontSize: 16, marginLeft: "auto", flexShrink: 0 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={clearChat}
            style={{
              padding: "9px 14px", borderRadius: 12,
              border: "1.5px solid #e5e7eb", background: "#f9fafb",
              color: "#6b7280", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            🗑 Clear
          </button>
        </div>
      </div>

      {/* ── Quick prompts ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p.label}
            onClick={() => sendMessage(p.text)}
            style={{
              padding: "6px 14px", borderRadius: 999,
              border: "1.5px solid #ede9fe", background: "#f5f3ff",
              color: "#6d28d9", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f5f3ff"; }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Chat window ── */}
      <div style={{
        flex: 1, overflowY: "auto",
        background: "#ffffff", borderRadius: 22,
        boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
        padding: "20px 20px 12px",
        marginBottom: 14,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-start", gap: 10,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: msg.role === "user"
                ? "linear-gradient(135deg,#7c3aed,#a78bfa)"
                : "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, boxShadow: msg.role === "user" ? "0 2px 8px rgba(124,58,237,0.25)" : "none",
            }}>
              {msg.role === "user" ? "👤" : (AI_MODELS.find(m => m.id === msg.model)?.icon || "🤖")}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: "74%", minWidth: 0 }}>
              {editingId === msg.id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%", padding: "10px 14px",
                      borderRadius: 14, border: "1.5px solid #a78bfa",
                      background: "#fafafa", fontSize: 14, color: "#1e1b4b",
                      outline: "none", fontFamily: "inherit", resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <button onClick={() => saveEdit(msg.id)} style={{
                      padding: "6px 16px", borderRadius: 9, border: "none",
                      background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                      color: "#fff", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{
                      padding: "6px 14px", borderRadius: 9,
                      border: "1.5px solid #e5e7eb", background: "#f9fafb",
                      color: "#374151", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg,#7c3aed,#a78bfa)"
                    : "#f9fafb",
                  color: msg.role === "user" ? "#fff" : "#1e1b4b",
                  borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                  padding: "13px 17px",
                  fontSize: 14, lineHeight: 1.65,
                  boxShadow: msg.role === "user"
                    ? "0 4px 14px rgba(124,58,237,0.25)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                </div>
              )}

              {/* Message actions */}
              {editingId !== msg.id && (
                <div style={{
                  display: "flex", gap: 4, marginTop: 5,
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}>
                  {[
                    { icon: "✏️", label: "Edit",   action: () => startEdit(msg)                              },
                    { icon: "🗑",  label: "Delete", action: () => deleteMessage(msg.id)                       },
                    { icon: "📋", label: "Copy",   action: () => navigator.clipboard?.writeText(msg.content) },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      title={btn.label}
                      style={{
                        background: "transparent", border: "none",
                        color: "#c4b5fd", cursor: "pointer", fontSize: 12,
                        padding: "3px 7px", borderRadius: 7, fontFamily: "inherit",
                        transition: "color 0.15s, background 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.color = "#7c3aed"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c4b5fd"; }}
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
            }}>
              {activeModel.icon}
            </div>
            <div style={{
              background: "#f9fafb", borderRadius: "20px 20px 20px 4px",
              padding: "13px 18px", display: "flex", gap: 5, alignItems: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#a78bfa",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div style={{
        background: "#fff", borderRadius: 18,
        boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
        padding: "12px 14px",
        display: "flex", gap: 10, alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${activeModel.label}… (Enter to send, Shift+Enter for new line)`}
          rows={1}
          style={{
            flex: 1, padding: "10px 14px",
            borderRadius: 12, border: "1.5px solid #e5e7eb",
            background: "#fafafa", fontSize: 14, color: "#1e1b4b",
            outline: "none", fontFamily: "inherit",
            resize: "none", lineHeight: 1.5,
            maxHeight: 120, overflowY: "auto",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#a78bfa"}
          onBlur={e  => e.target.style.borderColor = "#e5e7eb"}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: 46, height: 46, borderRadius: 13, border: "none",
            background: (!input.trim() || loading)
              ? "#e5e7eb"
              : "linear-gradient(135deg,#7c3aed,#a78bfa)",
            color: (!input.trim() || loading) ? "#9ca3af" : "#fff",
            fontSize: 18, cursor: (!input.trim() || loading) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: (!input.trim() || loading) ? "none" : "0 4px 14px rgba(124,58,237,0.28)",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        >
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-7px); }
        }
      `}</style>
    </div>
  );
}

export default Tasks;
