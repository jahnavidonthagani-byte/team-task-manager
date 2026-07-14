import { useEffect, useState } from "react";
import API from "../api";

export default function Projects() {
  const role = localStorage.getItem("role")?.toLowerCase();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [memberPicks, setMemberPicks] = useState({}); // { [projectId]: selectedUserId }
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");

  // ==========================
  // LOAD PROJECTS + USERS
  // ==========================
  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.log("LOAD PROJECT ERROR:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.log("LOAD USERS ERROR:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  // ==========================
  // CREATE PROJECT (ADMIN ONLY)
  // ==========================
  const createProject = async () => {
    if (role !== "admin") {
      alert("Access Denied: Only Admins can create projects.");
      return;
    }

    if (!name.trim()) {
      return alert("Enter Project Name");
    }

    try {
      await API.post("/projects", { name, description });
      alert("Project Created Successfully");
      setName("");
      setDescription("");
      loadProjects();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Error creating project");
    }
  };

  // ==========================
  // DELETE PROJECT
  // ==========================
  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await API.delete(`/projects/${id}`);
      alert("Project Deleted Successfully");
      loadProjects();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Error deleting project");
    }
  };

  // ==========================
  // EDIT PROJECT
  // ==========================
  const startEdit = (project) => {
    setEditingId(project._id);
    setEditForm({ name: project.name || "", description: project.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", description: "" });
  };

  const saveEdit = async (projectId) => {
    if (!editForm.name.trim()) {
      return alert("Project name cannot be empty");
    }

    try {
      await API.put(`/projects/${projectId}`, editForm);
      setEditingId(null);
      loadProjects();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Error updating project");
    }
  };

  // ==========================
  // ADD MEMBER
  // ==========================
  const addMember = async (projectId) => {
    const userId = memberPicks[projectId];
    if (!userId) {
      return alert("Select a user first");
    }

    try {
      await API.post(`/projects/${projectId}/members`, { userId });
      loadProjects();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Error adding member");
    }
  };

  // ==========================
  // REMOVE MEMBER
  // ==========================
  const removeMember = async (projectId, userId) => {
    try {
      await API.delete(`/projects/${projectId}/members/${userId}`);
      loadProjects();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || "Error removing member");
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "30px",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ color: "#2563eb", marginBottom: "25px", textAlign: "center" }}>Projects</h2>

      {/* CREATE PROJECT FORM BLOCK */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          margin: "0 auto 30px auto",
        }}
      >
        <input
          type="text"
          placeholder={role === "admin" ? "Project Name" : "Project Name (Admin Only)"}
          value={name}
          disabled={role !== "admin"}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
            textAlign: "center",
            background: role !== "admin" ? "#f3f4f6" : "#fff",
          }}
        />

        <textarea
          rows="4"
          placeholder={role === "admin" ? "Project Description" : "Project Description (Admin Only)"}
          value={description}
          disabled={role !== "admin"}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            resize: "none",
            boxSizing: "border-box",
            textAlign: "center",
            background: role !== "admin" ? "#f3f4f6" : "#fff",
          }}
        />

        <button
          onClick={createProject}
          disabled={role !== "admin"}
          style={{
            width: "100%",
            padding: "12px",
            background: role === "admin" ? "#2563eb" : "#94a3b8",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: role === "admin" ? "pointer" : "not-allowed",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Create Project
        </button>
      </div>

      {/* PROJECT LIST */}
      <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Project List</h3>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <input
          placeholder="Search projects by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            textAlign: "center",
          }}
        />
      </div>

      {loading ? (
        <p>Loading Projects...</p>
      ) : projects.length === 0 ? (
        <p>No Projects Found</p>
      ) : filteredProjects.length === 0 ? (
        <p style={{ textAlign: "center" }}>No projects match your search</p>
      ) : (
        filteredProjects.map((project) => {
          const memberIds = (project?.members || []).map((m) => m?._id);
          const availableUsers = users.filter((u) => !memberIds.includes(u._id));

          return (
            <div
              key={project?._id}
              style={{
                background: "#fff",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
                boxShadow: "0 0 8px rgba(0,0,0,0.08)",
                position: "relative",
              }}
            >
              {editingId === project._id ? (
                <div style={{ marginBottom: "15px" }}>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                  />
                  <textarea
                    rows="3"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      resize: "none",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => saveEdit(project._id)} style={addBtnStyle}>
                      Save
                    </button>
                    <button onClick={cancelEdit} style={removeBtnStyle}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 style={{ color: "#2563eb", marginBottom: "10px", textAlign: "center" }}>
                    {project?.name}
                  </h3>

                  <p style={{ margin: "5px 0" }}>
                    <strong>Description : </strong>
                    {project?.description || "No Description"}
                  </p>

                  {role === "admin" && (
                    <button
                      onClick={() => startEdit(project)}
                      style={{ ...addBtnStyle, marginBottom: "10px" }}
                    >
                      Edit
                    </button>
                  )}
                </>
              )}

              <p style={{ margin: "5px 0" }}>
                <strong>Created By : </strong>
                {project?.owner?.name || "Unknown"}
              </p>

              {/* MEMBER LIST */}
              <div style={{ margin: "12px 0" }}>
                <strong>Members ({project?.members?.length || 0}):</strong>
                {(project?.members || []).length === 0 ? (
                  <p style={{ color: "#64748b", margin: "5px 0" }}>
                    No members yet
                  </p>
                ) : (
                  <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                    {project.members.map((m) => (
                      <li
                        key={m._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "4px",
                        }}
                      >
                        <span>
                          {m.name} <em style={{ color: "#94a3b8" }}>({m.role})</em>
                        </span>
                        {role === "admin" && (
                          <button
                            onClick={() => removeMember(project._id, m._id)}
                            style={removeBtnStyle}
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ADD MEMBER (ADMIN ONLY) */}
              {role === "admin" && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "50px" }}>
                  <select
                    value={memberPicks[project._id] || ""}
                    onChange={(e) =>
                      setMemberPicks({
                        ...memberPicks,
                        [project._id]: e.target.value,
                      })
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Select user to add...</option>
                    {availableUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => addMember(project._id)}
                    style={addBtnStyle}
                  >
                    Add Member
                  </button>
                </div>
              )}

              {/* Delete button option */}
              <button
                onClick={() => deleteProject(project?._id)}
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "20px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Delete
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

const addBtnStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
};

const removeBtnStyle = {
  background: "#f1f5f9",
  color: "#dc2626",
  border: "1px solid #dc2626",
  padding: "2px 8px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
};
