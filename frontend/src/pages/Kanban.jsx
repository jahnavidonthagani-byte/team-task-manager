import { useEffect, useState } from "react";
import API from "../api";

const COLUMNS = ["Pending", "In Progress", "Completed", "Overdue"];

const COLUMN_COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Completed: "#22c55e",
  Overdue: "#ef4444",
};

export default function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragOverCol, setDragOverCol] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.log("Load tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.log("Update status error:", err);
      alert(err.response?.data?.msg || "Error moving task");
      loadTasks(); // revert on failure
    }
  };

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading board...</div>;
  }

  return (
    <div style={{ padding: "30px", background: "#f4f7fb", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Kanban Board</h2>

      <div style={{ display: "flex", gap: "16px", overflowX: "auto" }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          const isOver = dragOverCol === col;

          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, col)}
              style={{
                background: isOver ? "#e0e7ff" : "#eef1f6",
                borderRadius: "10px",
                width: "270px",
                minWidth: "270px",
                padding: "12px",
                minHeight: "400px",
                border: isOver ? "2px dashed #6366f1" : "2px solid transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: COLUMN_COLORS[col],
                    display: "inline-block",
                  }}
                />
                <strong>{col}</strong>
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  ({colTasks.length})
                </span>
              </div>

              {colTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    cursor: "grab",
                    borderLeft: `4px solid ${COLUMN_COLORS[col]}`,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {task.projectId?.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {task.assignedBy?.name}
                  </div>
                  {task.dueDate && (
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      Due {task.dueDate.substring(0, 10)}
                    </div>
                  )}
                </div>
              ))}

              {colTasks.length === 0 && (
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Drop tasks here
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: "20px", color: "#64748b", fontSize: "13px" }}>
        Drag a task card between columns to update its status.
      </p>
    </div>
  );
}
