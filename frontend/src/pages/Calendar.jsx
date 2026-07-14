import { useEffect, useState } from "react";
import API from "../api";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Completed: "#22c55e",
  Overdue: "#ef4444",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthGrid(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }
  return cells;
}

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

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

  const changeMonth = (delta) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const tasksByDay = {};
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  const cells = buildMonthGrid(year, month);
  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div style={{ padding: "30px", background: "#f4f7fb", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "900px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0" }}>
          {MONTH_NAMES[month]} {year}
        </h2>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={() => changeMonth(-1)} style={navBtnStyle}>
            &larr; Prev
          </button>
          <button
            onClick={() => {
              setMonth(today.getMonth());
              setYear(today.getFullYear());
            }}
            style={navBtnStyle}
          >
            Today
          </button>
          <button onClick={() => changeMonth(1)} style={navBtnStyle}>
            Next &rarr;
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "6px",
            maxWidth: "900px",
          }}
        >
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              style={{
                textAlign: "center",
                fontWeight: 600,
                color: "#64748b",
                fontSize: "13px",
                padding: "6px 0",
              }}
            >
              {label}
            </div>
          ))}

          {cells.map((day, idx) => (
            <div
              key={idx}
              style={{
                minHeight: "100px",
                background: day ? "#fff" : "transparent",
                borderRadius: "8px",
                padding: "6px",
                boxShadow: day ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                border: day && isToday(day) ? "2px solid #2563eb" : "1px solid #eef1f6",
              }}
            >
              {day && (
                <>
                  <div style={{ fontSize: "12px", color: "#334155", marginBottom: "4px" }}>
                    {day}
                  </div>
                  {(tasksByDay[day] || []).map((t) => (
                    <div
                      key={t._id}
                      title={`${t.title} (${t.status})`}
                      style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        marginBottom: "3px",
                        color: "#fff",
                        background: STATUS_COLORS[t.status] || "#94a3b8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  padding: "8px 14px",
  background: "#fff",
  color: "#334155",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};
