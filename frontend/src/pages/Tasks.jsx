import { useEffect, useState } from "react";
import API from "../api";
import TaskComments from "../components/TaskComments";

export default function Tasks() {
  const role = localStorage.getItem("role")?.toLowerCase();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    projectId: "",
    assignedBy: "",
    dueDate: "",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  // ================= LOAD DATA =================
  const loadData = async () => {
    try {
      const [t, p, u] = await Promise.all([
        API.get("/tasks"),
        API.get("/projects"),
        API.get("/users"),
      ]);

      setTasks(t.data || []);
      setProjects(p.data || []);
      setUsers(u.data || []);
    } catch {
      console.log("Error loading data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ================= CREATE TASK =================
  const createTask = async () => {
    if (role !== "admin") {
      alert("Access Denied: Only Admins can create tasks.");
      return;
    }

    if (!form.title || !form.projectId || !form.assignedBy || !form.dueDate) {
      alert("Please fill all fields");
      return;
    }

    try {
      await API.post("/tasks", {
        ...form,
        status: "Pending",
      });

      setForm({
        title: "",
        projectId: "",
        assignedBy: "",
        dueDate: "",
      });

      loadData();
    } catch {
      alert("Error creating task");
    }
  };

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/tasks/${id}`, { status });
      loadData();
    } catch {
      alert("Error updating task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesProject =
      !projectFilter || task.projectId?._id === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  return (
    <div style={{ padding: "30px", background: "#f4f7fb", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>Task Management</h2>

      {/* ================= INPUT FORM (Admin Only) ================= */}
      <div style={boxStyle}>
        <h3 style={{ textAlign: "center" }}>Create Task</h3>

        <input
          placeholder={role === "admin" ? "Task Title" : "Task Title (Admin Only)"}
          value={form.title}
          disabled={role !== "admin"}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          style={{ ...inputStyle, background: role !== "admin" ? "#f3f4f6" : "#fff" }}
        />

        <select
          value={form.projectId}
          disabled={role !== "admin"}
          onChange={(e) =>
            setForm({ ...form, projectId: e.target.value })
          }
          style={{ ...inputStyle, background: role !== "admin" ? "#f3f4f6" : "#fff" }}
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={form.assignedBy}
          disabled={role !== "admin"}
          onChange={(e) =>
            setForm({ ...form, assignedBy: e.target.value })
          }
          style={{ ...inputStyle, background: role !== "admin" ? "#f3f4f6" : "#fff" }}
        >
          <option value="">Assigned By</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.dueDate}
          disabled={role !== "admin"}
          onChange={(e) =>
            setForm({ ...form, dueDate: e.target.value })
          }
          style={{ ...inputStyle, background: role !== "admin" ? "#f3f4f6" : "#fff" }}
        />

        <button
          onClick={createTask}
          disabled={role !== "admin"}
          style={{
            ...buttonStyle,
            background: role === "admin" ? "#2563eb" : "#94a3b8",
            cursor: role === "admin" ? "pointer" : "not-allowed",
          }}
        >
          Create Task
          </button>
      </div>

      {/* ================= TASK LIST ================= */}
      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "16px",
            justifyContent: "center",
          }}
        >
          <input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, width: "220px", marginBottom: 0 }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, width: "160px", marginBottom: 0 }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ ...inputStyle, width: "180px", marginBottom: 0 }}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {(search || statusFilter || projectFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setProjectFilter("");
              }}
              style={{ ...buttonStyle, background: "#94a3b8" }}
            >
              Clear
            </button>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <p style={{ textAlign: "center" }}>
            {tasks.length === 0 ? "No tasks found" : "No tasks match your search/filters"}
          </p>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} style={cardStyle}>
              <h3 style={{ textAlign: "center" }}>{task.title}</h3>

              <p><b>Project:</b> {task.projectId?.name}</p>
              <p><b>Assigned By:</b> {task.assignedBy?.name}</p>
              <p><b>Due Date:</b> {task.dueDate?.substring(0, 10)}</p>
              <p><b>Status:</b> {task.status}</p>

              {/* Anyone logged in can update task status */}
              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(task._id, e.target.value)
                }
                style={inputStyle}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>

              <TaskComments taskId={task._id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ================= STYLES =================
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
};

const boxStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
};

const cardStyle = {
  background: "white",
  padding: "15px",
  marginTop: "10px",
  borderRadius: "10px",
};