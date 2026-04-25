import { useState } from "react";

const STUDY_PLAYLISTS = [
  { id: "0vvXs7CCTIjPFli0oEncYm", title: "Deep Focus",        category: "Focus",    emoji: "🎯", color: "#7c3aed", colorLight: "#ede9fe", desc: "Minimize distractions and maximize output.",         duration: "4h 20m" },
  { id: "37i9dQZF1DX8NTLI2TtZa6", title: "Lo-Fi Beats",       category: "Chill",    emoji: "🎧", color: "#0891b2", colorLight: "#e0f2fe", desc: "Relaxed lo-fi hip hop for long study sessions.",     duration: "3h 45m" },
  { id: "37i9dQZF1DX4sWSpwq3LiO", title: "Peaceful Piano",    category: "Calm",     emoji: "🎹", color: "#059669", colorLight: "#d1fae5", desc: "Gentle piano melodies to soothe your mind.",         duration: "2h 55m" },
  { id: "37i9dQZF1DWZeKCadgRdKQ", title: "Classical Study",   category: "Focus",    emoji: "🎻", color: "#d97706", colorLight: "#fef3c7", desc: "Timeless classical pieces for deep thinking.",        duration: "5h 10m" },
  { id: "37i9dQZF1DX3rxVfibe1L0", title: "Mood Booster",      category: "Energy",   emoji: "⚡", color: "#dc2626", colorLight: "#fee2e2", desc: "Upbeat tracks to keep your energy high.",             duration: "2h 30m" },
  { id: "37i9dQZF1DWYcDQ1hSjOpY", title: "Night Owl",         category: "Chill",    emoji: "🌙", color: "#4f46e5", colorLight: "#e0e7ff", desc: "Perfect for late-night study marathons.",             duration: "3h 15m" },
  { id: "37i9dQZF1DX9XIZsNDKAr6", title: "Brain Food",        category: "Focus",    emoji: "🧠", color: "#be185d", colorLight: "#fce7f3", desc: "Scientifically curated for cognitive performance.",   duration: "4h 05m" },
  { id: "37i9dQZF1DWWQRwui0ExPn", title: "Ambient Chill",     category: "Calm",     emoji: "🌊", color: "#0369a1", colorLight: "#e0f2fe", desc: "Ambient soundscapes for a calm study environment.",   duration: "6h 00m" },
];

const CATEGORIES = ["All", "Focus", "Chill", "Calm", "Energy"];

export default function StudyPlaylists() {
  const [selected, setSelected] = useState(STUDY_PLAYLISTS[0].id);
  const [filter, setFilter]     = useState("All");

  const filtered = filter === "All"
    ? STUDY_PLAYLISTS
    : STUDY_PLAYLISTS.filter(p => p.category === filter);

  const activePl = STUDY_PLAYLISTS.find(p => p.id === selected) || STUDY_PLAYLISTS[0];

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg,#0891b2,#22d3ee)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: "0 6px 18px rgba(8,145,178,0.3)", flexShrink: 0,
        }}>🎧</div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", margin: 0, letterSpacing: -0.5 }}>
            Study Playlists
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
            {STUDY_PLAYLISTS.length} curated playlists for every study mood
          </p>
        </div>
      </div>

      {/* ── Category filter ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "8px 20px", borderRadius: 999,
              border: `1.5px solid ${filter === cat ? "#7c3aed" : "#e5e7eb"}`,
              background: filter === cat ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "#fff",
              color: filter === cat ? "#fff" : "#374151",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: filter === cat ? "0 3px 12px rgba(124,58,237,0.25)" : "none",
              transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Featured player card ── */}
      <div style={{
        background: "#fff", borderRadius: 24,
        boxShadow: "0 4px 24px rgba(139,92,246,0.1)",
        overflow: "hidden", marginBottom: 28,
      }}>
        {/* Colored top strip */}
        <div style={{
          background: `linear-gradient(135deg,${activePl.color},${activePl.color}cc)`,
          padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, backdropFilter: "blur(4px)",
            }}>
              {activePl.emoji}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3 }}>
                Now Playing
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{activePl.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                {activePl.category} · {activePl.duration}
              </div>
            </div>
          </div>
          <a
            href={`https://open.spotify.com/playlist/${activePl.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 11,
              background: "rgba(255,255,255,0.2)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(4px)",
            }}
          >
            ↗ Open Spotify
          </a>
        </div>

        {/* Embedded player */}
        <iframe
          title={activePl.title}
          src={`https://open.spotify.com/embed/playlist/${activePl.id}?utm_source=generator&theme=0`}
          width="100%"
          height="200"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ display: "block" }}
        />
      </div>

      {/* ── Playlist grid ── */}
      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1e1b4b", margin: "0 0 16px", letterSpacing: -0.3 }}>
        {filter === "All" ? "All Playlists" : `${filter} Playlists`}
        <span style={{
          marginLeft: 10, fontSize: 12, fontWeight: 700,
          color: "#9ca3af", background: "#f3f4f6",
          padding: "2px 10px", borderRadius: 999,
        }}>
          {filtered.length}
        </span>
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 14,
      }}>
        {filtered.map(pl => {
          const isActive = selected === pl.id;
          return (
            <div
              key={pl.id}
              onClick={() => setSelected(pl.id)}
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
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: isActive ? pl.color : pl.colorLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
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
                    {pl.category} · {pl.duration}
                  </div>
                </div>
                {isActive && (
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 18, flexShrink: 0 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        width: 3, borderRadius: 2, background: pl.color,
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

      <style>{`
        @keyframes bar1 { from{height:6px}  to{height:14px} }
        @keyframes bar2 { from{height:14px} to{height:20px} }
        @keyframes bar3 { from{height:10px} to{height:16px} }
      `}</style>
    </div>
  );
}
