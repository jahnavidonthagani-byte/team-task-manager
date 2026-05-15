import { useEffect, useState } from "react";
import API from "../api";

export default function Projects() {

  const role = localStorage.getItem("role");

  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  // LOAD PROJECTS
  const loadProjects = async () => {

    try {

      const res =
        await API.get("/projects");

      setProjects(res.data || []);

    } catch (err) {

      console.log(err);
    }
  };

  useEffect(() => {

    const fetchData = async () => {
      await loadProjects();
    };

    fetchData();

  }, []);

  // CREATE PROJECT
  const createProject = async () => {

    if (!name) {
      return alert(
        "Enter project name"
      );
    }

    try {

      await API.post(
        "/projects",
        { name }
      );

      alert("Project Created");

      setName("");

      loadProjects();

    } catch (err) {

      alert(
        err.response?.data?.msg ||
        "Error creating project"
      );
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fb",
        minHeight: "100vh"
      }}
    >

      <h2
        style={{
          marginBottom: "25px",
          color: "#1e293b"
        }}
      >
        Projects
      </h2>

      {/* ADMIN ONLY */}
      {role === "Admin" && (

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow:
              "0 0 10px rgba(0,0,0,0.08)",
            maxWidth: "450px",
            marginBottom: "30px"
          }}
        >

          <input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            style={inputStyle}
          />

          <button
            onClick={createProject}
            style={buttonStyle}
          >
            Create Project
          </button>

        </div>
      )}

      {/* PROJECT LIST */}
      <div
        style={{
          display: "grid",
          gap: "20px"
        }}
      >

        {projects.map((project) => (

          <div
            key={project._id}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow:
                "0 0 10px rgba(0,0,0,0.08)"
            }}
          >

            <h3
              style={{
                color: "#2563eb"
              }}
            >
              {project.name}
            </h3>

          </div>

        ))}

      </div>

    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "15px"
};