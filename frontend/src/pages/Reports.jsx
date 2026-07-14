import { useEffect, useState } from "react";
import API from "../api";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [s, t, p] = await Promise.all([
        API.get("/analytics/summary"),
        API.get("/tasks"),
        API.get("/projects"),
      ]);
      setSummary(s.data);
      setTasks(t.data || []);
      setProjects(p.data || []);
    } catch (err) {
      console.log("Load reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tasksPerProject = projects.map((p) => {
    const projectTasks = tasks.filter((t) => t.projectId?._id === p._id);
    const completed = projectTasks.filter((t) => t.status === "Completed").length;
    return {
      name: p.name,
      total: projectTasks.length,
      completed,
      completionRate:
        projectTasks.length > 0
          ? Math.round((completed / projectTasks.length) * 100)
          : 0,
    };
  });

  const exportCSV = () => {
    const rows = [
      ["Title", "Project", "Assigned By", "Status", "Due Date"],
      ...tasks.map((t) => [
        t.title,
        t.projectId?.name || "",
        t.assignedBy?.name || "",
        t.status,
        t.dueDate ? t.dueDate.substring(0, 10) : "",
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `task-report-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading report...</div>;
  }

  return (
    <div style={{ padding: "30px", background: "#f4f7fb", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Reports</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
        <button onClick={exportCSV} style={exportBtnStyle}>
          Export Tasks as CSV
        </button>
      </div>

      {summary && (
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          {Object.entries(summary.statusCounts).map(([status, count]) => (
            <div key={status} style={cardStyle}>
              <div style={{ fontSize: "13px", color: "#64748b" }}>{status}</div>
              <div style={{ fontSize: "26px", fontWeight: 700 }}>{count}</div>
            </div>
          ))}
          <div style={{ ...cardStyle, background: "#fef2f2" }}>
            <div style={{ fontSize: "13px", color: "#64748b" }}>Overdue (not marked)</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#dc2626" }}>
              {summary.overdueNotMarked}
            </div>
          </div>
        </div>
      )}

      <h3 style={{ textAlign: "center", marginBottom: "16px" }}>
        Completion Rate by Project
      </h3>

      {tasksPerProject.length === 0 ? (
        <p style={{ textAlign: "center" }}>No projects to report on yet</p>
      ) : (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#e2e8f0", textAlign: "left" }}>
                <th style={thStyle}>Project</th>
                <th style={thStyle}>Total Tasks</th>
                <th style={thStyle}>Completed</th>
                <th style={thStyle}>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {tasksPerProject.map((row) => (
                <tr key={row.name} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={tdStyle}>{row.name}</td>
                  <td style={tdStyle}>{row.total}</td>
                  <td style={tdStyle}>{row.completed}</td>
                  <td style={tdStyle}>{row.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary?.workload?.length > 0 && (
        <>
          <h3 style={{ textAlign: "center", margin: "30px 0 16px 0" }}>
            Workload by Team Member
          </h3>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" }}>
              <thead>
                <tr style={{ background: "#e2e8f0", textAlign: "left" }}>
                  <th style={thStyle}>Team Member</th>
                  <th style={thStyle}>Total Tasks</th>
                  <th style={thStyle}>Completed</th>
                </tr>
              </thead>
              <tbody>
                {summary.workload.map((w) => (
                  <tr key={w.userId} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={tdStyle}>{w.name || "Unknown"}</td>
                    <td style={tdStyle}>{w.totalTasks}</td>
                    <td style={tdStyle}>{w.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "16px 20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  textAlign: "center",
  minWidth: "140px",
};

const thStyle = {
  padding: "10px 14px",
  fontSize: "13px",
  color: "#334155",
};

const tdStyle = {
  padding: "10px 14px",
  fontSize: "14px",
};

const exportBtnStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};
