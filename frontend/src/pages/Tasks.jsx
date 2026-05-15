import { useEffect, useState } from "react";
import API from "../api";

export default function Tasks() {

  const role = localStorage.getItem("role");

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    projectId: "",
    assignedTo: "",
    status: "Pending",
    dueDate: ""
  });

  // LOAD DATA
  const loadData = async () => {

    try {

      const taskRes = await API.get("/tasks");
      const projectRes = await API.get("/projects");
      const userRes = await API.get("/users");

      setTasks(taskRes.data || []);
      setProjects(projectRes.data || []);
      setUsers(userRes.data || []);

    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
  const init = async () => {
    await loadData();
  };

  init();
}, []);

  // CREATE TASK (ADMIN ONLY)
  const createTask = async () => {

    try {

      await API.post("/tasks", form);

      alert("Task Created");

      setForm({
        title: "",
        projectId: "",
        assignedTo: "",
        status: "Pending",
        dueDate: ""
      });

      loadData();

    } catch (err) {

      alert(err.response?.data?.msg || "Error creating task");
    }
  };

  // UPDATE STATUS (MEMBER + ADMIN)
  const updateStatus = async (taskId, status) => {

    try {

      await API.put(`/tasks/${taskId}`, { status });

      loadData();

    } catch (err) {

      alert("Error updating status");
    }
  };

  return (
    <div style={{
      padding: "30px",
      background: "#f4f7fb",
      minHeight: "100vh"
    }}>

      <h2 style={{
        marginBottom: "25px",
        color: "#1e293b"
      }}>
        Tasks
      </h2>

      {/* ADMIN ONLY CREATE TASK */}
      {role === "Admin" && (

        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.08)",
          maxWidth: "500px",
          marginBottom: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}>

          <input
            placeholder="Task Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            style={inputStyle}
          />

          <select
            value={form.projectId}
            onChange={(e) =>
              setForm({ ...form, projectId: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={form.assignedTo}
            onChange={(e) =>
              setForm({ ...form, assignedTo: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Select User</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
            style={inputStyle}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
            style={inputStyle}
          />

          <button onClick={createTask} style={buttonStyle}>
            Create Task
          </button>

        </div>
      )}

      {/* TASK LIST */}
      <div style={{ display: "grid", gap: "20px" }}>

        {tasks.map(task => (

          <div key={task._id} style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,0,0,0.08)"
          }}>

            <h3 style={{ color: "#2563eb" }}>
              {task.title}
            </h3>

            <p><strong>Status:</strong> {task.status}</p>

            <p>
              <strong>Due Date:</strong>{" "}
              {task.dueDate
                ? task.dueDate.substring(0, 10)
                : "No Date"}
            </p>

            {/* STATUS UPDATE (MEMBER ENABLED) */}
            <select
              value={task.status}
              onChange={(e) =>
                updateStatus(task._id, e.target.value)
              }
              style={inputStyle}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

          </div>

        ))}

      </div>

    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px"
};

const buttonStyle = {
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "15px"
};