import { useEffect, useRef, useState } from "react";
import API from "../api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const load = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.log("Load notifications error:", err);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      load();
    } catch (err) {
      console.log("Mark read error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      load();
    } catch (err) {
      console.log("Mark all read error:", err);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} style={bellBtnStyle}>
        🔔
        {unreadCount > 0 && <span style={badgeStyle}>{unreadCount}</span>}
      </button>

      {open && (
        <div style={dropdownStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 12px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <strong style={{ fontSize: "14px" }}>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={markAllBtnStyle}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p style={{ padding: "12px", fontSize: "13px", color: "#64748b" }}>
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    borderBottom: "1px solid #f1f5f9",
                    background: n.read ? "#fff" : "#eff6ff",
                    cursor: n.read ? "default" : "pointer",
                  }}
                >
                  <div>{n.message}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const bellBtnStyle = {
  position: "relative",
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  padding: "4px 8px",
};

const badgeStyle = {
  position: "absolute",
  top: "-2px",
  right: "0px",
  background: "#ef4444",
  color: "#fff",
  borderRadius: "999px",
  fontSize: "10px",
  padding: "1px 5px",
  fontWeight: 700,
};

const dropdownStyle = {
  position: "absolute",
  right: 0,
  top: "36px",
  width: "300px",
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  zIndex: 100,
};

const markAllBtnStyle = {
  background: "none",
  border: "none",
  color: "#2563eb",
  fontSize: "12px",
  cursor: "pointer",
};
