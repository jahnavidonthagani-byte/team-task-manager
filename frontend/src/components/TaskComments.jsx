import { useEffect, useState } from "react";
import API from "../api";

export default function TaskComments({ taskId }) {
  const role = localStorage.getItem("role")?.toLowerCase();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myUserId, setMyUserId] = useState(null);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/comments/task/${taskId}`);
      setComments(res.data || []);
    } catch (err) {
      console.log("Load comments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyId = async () => {
    try {
      const res = await API.get("/users/me");
      setMyUserId(res.data?._id || null);
    } catch (err) {
      console.log("Load current user error:", err);
    }
  };

  useEffect(() => {
    if (open) {
      loadComments();
      if (!myUserId) loadMyId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addComment = async () => {
    if (!text.trim()) return;

    try {
      await API.post(`/comments/task/${taskId}`, { text });
      setText("");
      loadComments();
    } catch (err) {
      console.log("Add comment error:", err);
      alert(err.response?.data?.msg || "Error adding comment");
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await API.delete(`/comments/${commentId}`);
      loadComments();
    } catch (err) {
      console.log("Delete comment error:", err);
      alert(err.response?.data?.msg || "Error deleting comment");
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <button onClick={() => setOpen(!open)} style={toggleStyle}>
        {open ? "Hide Activity Log" : `Show Activity Log (${comments.length || ""})`}
      </button>

      {open && (
        <div style={panelStyle}>
          {loading ? (
            <p style={{ fontSize: "13px", color: "#64748b" }}>Loading...</p>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#64748b" }}>
              No comments yet
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 10px 0" }}>
              {comments.map((c) => {
                if (c.isSystem) {
                  return (
                    <li key={c._id} style={systemEntryStyle}>
                      🕘 {c.text} · {new Date(c.createdAt).toLocaleString()}
                    </li>
                  );
                }

                const canDelete = role === "admin" || c.author?._id === myUserId;
                return (
                  <li key={c._id} style={commentStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ fontSize: "13px", color: "#334155" }}>
                        <strong>{c.author?.name || "Unknown"}</strong>{" "}
                        <span style={{ color: "#94a3b8" }}>
                          ({c.author?.role})
                        </span>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => deleteComment(c._id)}
                          style={deleteBtnStyle}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: "14px" }}>{c.text}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") addComment();
              }}
            />
            <button onClick={addComment} style={sendStyle}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const toggleStyle = {
  background: "none",
  border: "1px solid #cbd5e1",
  color: "#2563eb",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};

const panelStyle = {
  marginTop: "10px",
  padding: "12px",
  background: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const commentStyle = {
  padding: "8px 0",
  borderBottom: "1px solid #e2e8f0",
};

const systemEntryStyle = {
  padding: "6px 0",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "12px",
  color: "#64748b",
  fontStyle: "italic",
};

const sendStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
};

const deleteBtnStyle = {
  background: "none",
  border: "1px solid #dc2626",
  color: "#dc2626",
  padding: "2px 8px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "11px",
};
