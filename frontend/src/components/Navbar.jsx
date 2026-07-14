import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="navbar">

      <h2 style={{ textAlign: "center" }}>Task Manager</h2>

      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/kanban">Kanban</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/reports">Reports</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {token && <NotificationBell />}
        <button onClick={logout}>Logout</button>
      </div>

    </div>
  );
}
