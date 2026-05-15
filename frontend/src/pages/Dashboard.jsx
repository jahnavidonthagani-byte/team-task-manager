import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  // load tasks
  const load = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  // eslint-safe useEffect
  useEffect(() => {
    const getData = async () => {
      await load();
    };

    getData();
  }, []);

  // counts
  const pending = tasks.filter(
    (t) => t.status === "Pending"
  ).length;

  const inProgress = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;

  const completed = tasks.filter(
    (t) => t.status === "Completed"
  ).length;

  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== "Completed"
  ).length;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      {/* Dashboard Stats */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap"
        }}
      >
        <div style={cardStyle}>
          <h3>Pending</h3>
          <p>{pending}</p>
        </div>

        <div style={cardStyle}>
          <h3>In Progress</h3>
          <p>{inProgress}</p>
        </div>

        <div style={cardStyle}>
          <h3>Completed</h3>
          <p>{completed}</p>
        </div>

        <div style={cardStyle}>
          <h3>Overdue</h3>
          <p>{overdue}</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "40px"
        }}
      >
        <button
          onClick={() => navigate("/projects")}
          style={btnStyle}
        >
          Projects
        </button>

        <button
          onClick={() => navigate("/tasks")}
          style={btnStyle}
        >
          Tasks
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "15px 25px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px"
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "200px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};