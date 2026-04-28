import { useState } from "react";

const FEATURED = {
  id:    "0vvXs7CCTIjPFli0oEncYm",
  title: "Deep Focus",
  mood:  "Concentration & Flow",
  emoji: "🎯",
  color: "#7c3aed",
  colorLight: "#ede9fe",
};

const PLAYLISTS = [
  { id: "0vvXs7CCTIjPFli0oEncYm", title: "Deep Focus",       mood: "Concentration",  emoji: "🎯", color: "#7c3aed", colorLight: "#ede9fe", desc: "Minimize distractions and maximize output." },
  { id: "37i9dQZF1DX8NTLI2TtZa6", title: "Lo-Fi Beats",      mood: "Chill Study",    emoji: "🎧", color: "#0891b2", colorLight: "#e0f2fe", desc: "Relaxed lo-fi hip hop for long study sessions." },
  { id: "37i9dQZF1DX4sWSpwq3LiO", title: "Peaceful Piano",   mood: "Calm Focus",     emoji: "🎹", color: "#059669", colorLight: "#d1fae5", desc: "Gentle piano melodies to soothe your mind." },
  { id: "37i9dQZF1DWZeKCadgRdKQ", title: "Classical Study",  mood: "Academic",       emoji: "🎻", color: "#d97706", colorLight: "#fef3c7", desc: "Timeless classical pieces for deep thinking." },
  { id: "37i9dQZF1DX3rxVfibe1L0", title: "Mood Booster",     mood: "Energetic",      emoji: "⚡", color: "#dc2626", colorLight: "#fee2e2", desc: "Upbeat tracks to keep your energy high." },
  { id: "37i9dQZF1DWYcDQ1hSjOpY", title: "Night Owl",        mood: "Late Night",     emoji: "🌙", color: "#4f46e5", colorLight: "#e0e7ff", desc: "Perfect for late-night study marathons." },
];

export default function Music() {
  const [activePlaylist, setActivePlaylist] = useState(FEATURED);
  const [view, setView]                     = useState("grid");

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 28,
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, boxShadow: "0 6px 18px rgba(124,58,237,0.3)", flexShrink: 0,
          }}>🎵</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
              Study Music
            </h1>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
              Curated playlists to keep you in the zone
            </p>
          </div>
        </div>

        {/* View toggle */}
        <div style={{
          display: "flex", background: "#f3f4f6",
          borderRadius: 12, padding: 4, gap: 2,
        }}>
          {[
            { id: "grid",   icon: "⊞", label: "Grid"   },
            { id: "player", icon: "▶", label: "Player" },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: "7px 16px", borderRadius: 9, border: "none",
                background: view === v.id ? "#fff" : "transparent",
                color: view === v.id ? "#7c3aed" : "#6b7280",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: view === v.id ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Now Playing hero ── */}
      <div style={{
        background: `linear-gradient(135deg, ${activePlaylist.color}, ${activePlaylist.color}cc)`,
        borderRadius: 24, padding: "26px 30px", marginBottom: 24,
        boxShadow: `0 8px 32px ${activePlaylist.color}44`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, backdropFilter: "blur(4px)",
            animation: "pulse 2s ease-in-out infinite",
          }}>
            {activePlaylist.emoji}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
              🎵 Now Playing
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
              {activePlaylist.title}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
              {activePlaylist.mood}
            </div>
          </div>
        </div>

        <a
          href={`https://open.spotify.com/playlist/${activePlaylist.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 12,
            background: "rgba(255,255,255,0.2)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            textDecoration: "none", backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.3)",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
        >
          ↗ Open in Spotify
        </a>
      </div>

      {/* ── Embedded Spotify player ── */}
      <div style={{
        background: "#fff", borderRadius: 22,
        boxShadow: "0 2px 20px rgba(139,92,246,0.08)",
        overflow: "hidden", marginBottom: 28,
      }}>
        <iframe
          title={activePlaylist.title}
          src={`https://open.spotify.com/embed/playlist/${activePlaylist.id}?utm_source=generator&theme=0`}
          width="100%"
          height={view === "player" ? 500 : 160}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ display: "block", transition: "height 0.3s ease" }}
        />
      </div>

      {/* ── Playlist grid ── */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", margin: "0 0 16px", letterSpacing: -0.3 }}>
          All Playlists
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
        }}>
          {PLAYLISTS.map(pl => {
            const isActive = activePlaylist.id === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => setActivePlaylist(pl)}
                style={{
                  background: isActive ? pl.colorLight : "#fff",
                  borderRadius: 18,
                  border: `2px solid ${isActive ? pl.color : "#f3f4f6"}`,
                  padding: "16px 18px",
                  cursor: "pointer",
                  boxShadow: isActive
                    ? `0 6px 22px ${pl.color}28`
                    : "0 2px 10px rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: isActive ? pl.color : pl.colorLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                    transition: "background 0.2s",
                  }}>
                    {pl.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 800,
                      color: isActive ? pl.color : "#1e1b4b",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {pl.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
                      {pl.mood}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{
                      display: "flex", gap: 2, alignItems: "flex-end",
                      height: 18, flexShrink: 0,
                    }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{
                          width: 3, borderRadius: 2,
                          background: pl.color,
                          animation: `bar${i} 0.8s ease-in-out infinite alternate`,
                          height: `${[10, 18, 14][i - 1]}px`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
                <p style={{
                  fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {pl.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes bar1  { from{height:6px}  to{height:14px} }
        @keyframes bar2  { from{height:14px} to{height:20px} }
        @keyframes bar3  { from{height:10px} to{height:16px} }
      `}</style>
    </div>
  );
}
