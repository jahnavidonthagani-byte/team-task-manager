import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import API from "../api";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Completed: "#22c55e",
  Overdue: "#ef4444",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/analytics/summary");
      setSummary(res.data);
    } catch (e) {
      console.log("Dashboard load error:", e);
      setError("Could not load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusData = summary
    ? Object.entries(summary.statusCounts).map(([status, count]) => ({
        status,
        count,
      }))
    : [];

  const totalTasks = statusData.reduce((sum, s) => sum + s.count, 0);

  const workloadData = summary?.workload?.map((w) => ({
    name: w.name || "Unknown",
    total: w.totalTasks,
    completed: w.completed,
  })) || [];

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Dashboard</h1>

      {loading && <p>Loading analytics...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {!loading && !error && summary && (
        <>
          {/* STAT CARDS */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            {statusData.map((s) => (
              <div key={s.status} style={cardStyle}>
                <h3>{s.status}</h3>
                <p style={{ fontSize: "28px", margin: 0 }}>{s.count}</p>
              </div>
            ))}
            <div style={{ ...cardStyle, background: "#fef2f2" }}>
              <h3>Overdue (not marked)</h3>
              <p style={{ fontSize: "28px", margin: 0, color: "#dc2626" }}>
                {summary.overdueNotMarked}
              </p>
            </div>
          </div>

          {/* CHARTS */}
          <div
            style={{
              display: "flex",
              gap: "30px",
              marginTop: "40px",
              flexWrap: "wrap",
            }}
          >
            <div style={chartCardStyle}>
              <h3 style={{ marginBottom: "10px", textAlign: "center" }}>Task Status Breakdown</h3>
              {totalTasks === 0 ? (
                <p>No tasks yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {workloadData.length > 0 && (
              <div style={chartCardStyle}>
                <h3 style={{ marginBottom: "10px", textAlign: "center" }}>
                  Team Workload (Admin view)
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total Tasks" />
                    <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {/* NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        <button onClick={() => navigate("/projects")} style={btnStyle}>
          Projects
        </button>

        <button onClick={() => navigate("/tasks")} style={btnStyle}>
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
  fontSize: "16px",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "180px",
  textAlign: "center",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const chartCardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  width: "420px",
  maxWidth: "100%",
};
