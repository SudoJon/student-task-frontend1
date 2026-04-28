import React, { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../../api/settings";
import "./Settings.css";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Auto-save handler
  const handleChange = async (field, value) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);

    try {
      await updateSettings({ [field]: value });
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  if (loading || !settings) {
    return <div className="settings-loading">Loading settings…</div>;
  }

  return (
    <div className="settings-page">

      {/* THEME */}
      <div className="settings-card">
        <h3 className="settings-title">Theme</h3>
        <div className="segmented-control">
          {[
            { value: "light", label: "☀️ Light" },
            { value: "dark", label: "🌙 Dark" },
            { value: "system", label: "🖥️ System" },
          ].map((opt) => (
            <button
              key={opt.value}
              className={
                settings.theme === opt.value
                  ? "segment active"
                  : "segment"
              }
              onClick={() => handleChange("theme", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* FONT SIZE */}
      <div className="settings-card">
        <h3 className="settings-title">Font Size</h3>
        <div className="segmented-control">
          {[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ].map((opt) => (
            <button
              key={opt.value}
              className={
                settings.font_size === opt.value
                  ? "segment active"
                  : "segment"
              }
              onClick={() => handleChange("font_size", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="settings-card">
        <h3 className="settings-title">Notifications</h3>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.notifications_enabled === 1}
            onChange={(e) =>
              handleChange("notifications_enabled", e.target.checked ? 1 : 0)
            }
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
}
