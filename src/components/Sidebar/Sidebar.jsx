import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const NAV = [
  {
    section: "TASKS",
    items: [
      { to: "/tasks",           icon: "✦",  label: "All Tasks"     },
      { to: "/tasks/today",     icon: "☀️", label: "Today"         },
      { to: "/tasks/week",      icon: "📅", label: "This Week"     },
      { to: "/tasks/high",      icon: "🔥", label: "High Priority" },
      { to: "/tasks/completed", icon: "✅", label: "Completed"     },
    ],
  },
  {
    section: "NOTES",
    items: [
      { to: "/notes",     icon: "📝", label: "All Notes" },
      { to: "/notes/new", icon: "➕", label: "New Note"  },
    ],
  },
  {
    section: "ASSISTANT",
    items: [
      { to: "/assistant", icon: "🤖", label: "Chat" },
    ],
  },
  {
    section: "MUSIC",
    items: [
      { to: "/music",       icon: "🎵", label: "Player"          },
      { to: "/music/study", icon: "🎧", label: "Study Playlists" },
    ],
  },
  {
    section: "CALENDAR",
    items: [
      { to: "/calendar", icon: "📆", label: "Calendar" },
    ],
  },
  {
    section: "SETTINGS",
    items: [
      { to: "/settings", icon: "⚙️", label: "Appearance" },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  function handleSignOut() {
    // Clear both storage locations used by this app
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/auth");
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">B</div>
        <div>
          <div className="sidebar-logo-title">Bucket Lyst</div>
          <div className="sidebar-logo-sub">Task Manager</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div key={group.section} className="sidebar-group">
            <div className="sidebar-group-label">{group.section}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/tasks"}
                className={({ isActive }) =>
                  "sidebar-link" + (isActive ? " sidebar-link--active" : "")
                }
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="sidebar-footer">
        <button className="sidebar-signout" onClick={handleSignOut}>
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
